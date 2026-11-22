// Package housing is the core of the "Should I sign this lease?" check.
//
// Given a location (and optionally the agent's cost estimate) it asks every
// data layer in parallel, tolerates individual failures, and assembles one
// multilingual report with the attributions each source requires.
package housing

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/jjoonii34/kuramiru/internal/cost"
	"github.com/jjoonii34/kuramiru/internal/geo"
	"github.com/jjoonii34/kuramiru/internal/i18n"
	"github.com/jjoonii34/kuramiru/internal/parallel"
	"github.com/jjoonii34/kuramiru/internal/source"
)

const maxAddressLen = 200

// Options configures a Service.
type Options struct {
	Layers       []LayerSpec
	Source       LayerSource
	Geocoder     Geocoder // optional
	Attributions []source.Attribution
	LayerTimeout time.Duration // per-layer deadline; a slow layer must not block the report
	MaxParallel  int
	Logger       *slog.Logger
	Now          func() time.Time
}

// Service runs housing checks. It is safe for concurrent use.
type Service struct {
	layers       []LayerSpec
	source       LayerSource
	geocoder     Geocoder
	attributions []source.Attribution
	layerTimeout time.Duration
	maxParallel  int
	log          *slog.Logger
	now          func() time.Time
}

// NewService validates opts and fills in defaults.
func NewService(o Options) (*Service, error) {
	if o.Source == nil {
		return nil, errors.New("housing: Options.Source is required")
	}
	if len(o.Layers) == 0 {
		return nil, errors.New("housing: Options.Layers is empty")
	}
	s := &Service{
		layers:       o.Layers,
		source:       o.Source,
		geocoder:     o.Geocoder,
		attributions: o.Attributions,
		layerTimeout: o.LayerTimeout,
		maxParallel:  o.MaxParallel,
		log:          o.Logger,
		now:          o.Now,
	}
	if s.layerTimeout <= 0 {
		s.layerTimeout = 5 * time.Second
	}
	if s.maxParallel <= 0 {
		s.maxParallel = len(s.layers)
	}
	if s.log == nil {
		s.log = slog.Default()
	}
	if s.now == nil {
		s.now = time.Now
	}
	if s.attributions == nil {
		s.attributions = []source.Attribution{}
	}
	return s, nil
}

// Check builds a report for one location.
func (s *Service) Check(ctx context.Context, req CheckRequest) (Report, error) {
	lang := i18n.Parse(req.Lang)

	// 1. Validate everything that needs no I/O first (fail fast, cheap).
	var costResult *cost.Result
	if req.Cost != nil {
		r, err := cost.Calculate(*req.Cost)
		if err != nil {
			return Report{}, fmt.Errorf("%w: %w", ErrInvalidInput, err)
		}
		costResult = &r
	}

	// 2. Resolve where the home is.
	p, err := s.resolve(ctx, req)
	if err != nil {
		return Report{}, err
	}

	// 3. Ask every layer at once.
	sections := s.lookupAll(ctx, p, lang)
	if err := ctx.Err(); err != nil {
		// The client went away or the request deadline passed: a report
		// made only of failures is not worth returning.
		return Report{}, err
	}

	// 4. Assemble.
	rep := Report{
		Location:    p,
		Lang:        lang,
		Sections:    sections,
		Cost:        costResult,
		Sources:     s.attributions,
		Disclaimer:  t(lang, "disclaimer"),
		GeneratedAt: s.now().UTC(),
	}
	for _, sec := range sections {
		if sec.Status != StatusOK {
			rep.Partial = true
			break
		}
	}
	return rep, nil
}

func (s *Service) resolve(ctx context.Context, req CheckRequest) (geo.Point, error) {
	var p geo.Point
	switch {
	case req.Lat != nil && req.Lon != nil:
		p = geo.Point{Lat: *req.Lat, Lon: *req.Lon}
	case req.Lat != nil || req.Lon != nil:
		return p, fmt.Errorf("%w: lat and lon must be sent together", ErrInvalidInput)
	case strings.TrimSpace(req.Address) != "":
		if utf8.RuneCountInString(req.Address) > maxAddressLen {
			return p, fmt.Errorf("%w: address is too long", ErrInvalidInput)
		}
		if s.geocoder == nil {
			return p, ErrGeocodingUnavailable
		}
		var err error
		if p, err = s.geocoder.Geocode(ctx, req.Address); err != nil {
			return p, err
		}
	default:
		return p, fmt.Errorf("%w: lat/lon or address is required", ErrInvalidInput)
	}

	if err := p.Validate(); err != nil {
		return p, fmt.Errorf("%w: %w", ErrInvalidInput, err)
	}
	return p, nil
}

// lookupAll is the fan-out / fan-in step.
//
// Each goroutine writes only to its own index of sections, so no mutex is
// needed; Wait provides the happens-before edge for reading them afterwards.
// The goroutines always return nil: a failed layer becomes a section with
// Status "unavailable" instead of cancelling its siblings (docs/adr/0003).
func (s *Service) lookupAll(ctx context.Context, p geo.Point, lang i18n.Lang) []Section {
	sections := make([]Section, len(s.layers))

	g, gctx := parallel.WithContext(ctx)
	g.SetLimit(s.maxParallel)
	for i, spec := range s.layers { // Go 1.22+: i and spec are per-iteration
		g.Go(func() error {
			sections[i] = s.lookupOne(gctx, spec, p, lang)
			return nil
		})
	}
	_ = g.Wait()
	return sections
}

func (s *Service) lookupOne(ctx context.Context, spec LayerSpec, p geo.Point, lang i18n.Lang) Section {
	start := time.Now()
	ctx, cancel := context.WithTimeout(ctx, s.layerTimeout)
	defer cancel()

	res, err := s.source.Lookup(ctx, spec.ID, p)

	sec := Section{
		Layer:     spec.ID,
		Kind:      spec.Kind,
		Title:     t(lang, string(spec.ID)),
		SourceID:  spec.SourceID,
		ElapsedMS: time.Since(start).Milliseconds(),
	}
	if err != nil {
		sec.Status = StatusUnavailable
		sec.Message = t(lang, "unavailable")
		// Never log p: the coordinate is user input (docs/adr/0002).
		s.log.LogAttrs(ctx, slog.LevelWarn, "layer lookup failed",
			slog.String("layer", string(spec.ID)),
			slog.Bool("timeout", errors.Is(err, context.DeadlineExceeded)),
			slog.String("error", err.Error()),
		)
		return sec
	}
	sec.Status = StatusOK
	sec.Hit = res.Hit
	sec.Features = res.Features
	if spec.Kind == KindPrice {
		sec.PriceSummary = summarizePrices(res.Features)
	}
	return sec
}
