package housing_test

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/cost"
	"github.com/jjoonii34/kurashi-nav/internal/fakesource"
	"github.com/jjoonii34/kurashi-nav/internal/geocode"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
	"github.com/jjoonii34/kurashi-nav/internal/i18n"
	"github.com/jjoonii34/kurashi-nav/internal/source"
)

var quiet = slog.New(slog.NewTextHandler(io.Discard, nil))

func ptr(f float64) *float64 { return &f }

func tokyo() housing.CheckRequest {
	return housing.CheckRequest{Lat: ptr(35.681236), Lon: ptr(139.767125)}
}

func newService(t *testing.T, src housing.LayerSource, mutate ...func(*housing.Options)) *housing.Service {
	t.Helper()
	o := housing.Options{
		Layers:       housing.DefaultLayers(source.Dummy.ID),
		Source:       src,
		Geocoder:     geocode.NewStatic(geocode.DemoEntries()),
		Attributions: []source.Attribution{source.Dummy},
		LayerTimeout: time.Second,
		Logger:       quiet,
	}
	for _, m := range mutate {
		m(&o)
	}
	svc, err := housing.NewService(o)
	if err != nil {
		t.Fatal(err)
	}
	return svc
}

func TestCheck_AllLayersOK(t *testing.T) {
	src := fakesource.NewDemo()
	svc := newService(t, src)

	rep, err := svc.Check(context.Background(), tokyo())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if rep.Partial {
		t.Error("Partial = true, want false")
	}
	want := housing.DefaultLayers("")
	if len(rep.Sections) != len(want) {
		t.Fatalf("got %d sections, want %d", len(rep.Sections), len(want))
	}
	for i, sec := range rep.Sections {
		if sec.Layer != want[i].ID {
			t.Errorf("section %d = %s, want %s (order must be stable)", i, sec.Layer, want[i].ID)
		}
		if sec.Status != housing.StatusOK {
			t.Errorf("section %s status = %s", sec.Layer, sec.Status)
		}
	}
	if len(rep.Sources) == 0 || rep.Disclaimer == "" {
		t.Error("report must carry sources and a disclaimer")
	}
	if src.Calls() != int64(len(want)) {
		t.Errorf("source called %d times, want %d", src.Calls(), len(want))
	}
}

func TestCheck_PriceSummaryOnlyOnPriceSections(t *testing.T) {
	svc := newService(t, fakesource.NewDemo())

	rep, err := svc.Check(context.Background(), tokyo())
	if err != nil {
		t.Fatal(err)
	}
	for _, sec := range rep.Sections {
		if sec.Kind != housing.KindPrice {
			if sec.PriceSummary != nil {
				t.Errorf("%s: unexpected price summary", sec.Layer)
			}
			continue
		}
		want := housing.PriceSummary{
			Count:              6,
			UnitPriceYenPerSqm: housing.Quartiles{Q1: 533_333, Median: 553_846, Q3: 650_000},
			PeriodFrom:         "2023Q1",
			PeriodTo:           "2025Q2",
		}
		if sec.PriceSummary == nil || *sec.PriceSummary != want {
			t.Errorf("%s: price summary = %+v, want %+v", sec.Layer, sec.PriceSummary, want)
		}
	}
}

// One broken layer must not break the whole report.
func TestCheck_PartialFailure(t *testing.T) {
	src := fakesource.NewDemo()
	src.Errors = map[housing.LayerID]error{housing.LayerTsunami: errors.New("upstream 503")}
	svc := newService(t, src)

	rep, err := svc.Check(context.Background(), tokyo())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !rep.Partial {
		t.Error("Partial = false, want true")
	}
	for _, sec := range rep.Sections {
		wantStatus := housing.StatusOK
		if sec.Layer == housing.LayerTsunami {
			wantStatus = housing.StatusUnavailable
		}
		if sec.Status != wantStatus {
			t.Errorf("%s: status %s, want %s", sec.Layer, sec.Status, wantStatus)
		}
	}
}

// A hanging layer is cut off by LayerTimeout instead of delaying the response.
func TestCheck_SlowLayerTimesOut(t *testing.T) {
	src := fakesource.NewDemo()
	src.Delays = map[housing.LayerID]time.Duration{housing.LayerFlood: 10 * time.Second}
	svc := newService(t, src, func(o *housing.Options) { o.LayerTimeout = 50 * time.Millisecond })

	start := time.Now()
	rep, err := svc.Check(context.Background(), tokyo())
	if err != nil {
		t.Fatal(err)
	}
	if elapsed := time.Since(start); elapsed > 2*time.Second {
		t.Fatalf("Check took %v; the slow layer was not cut off", elapsed)
	}
	if rep.Sections[0].Status != housing.StatusUnavailable {
		t.Errorf("flood status = %s, want unavailable", rep.Sections[0].Status)
	}
}

// Layers run concurrently: 9 layers × 200ms must take far less than 1.8s.
func TestCheck_RunsLayersInParallel(t *testing.T) {
	src := fakesource.NewDemo()
	src.Delays = map[housing.LayerID]time.Duration{}
	for _, l := range housing.DefaultLayers("") {
		src.Delays[l.ID] = 200 * time.Millisecond
	}
	svc := newService(t, src)

	start := time.Now()
	if _, err := svc.Check(context.Background(), tokyo()); err != nil {
		t.Fatal(err)
	}
	if elapsed := time.Since(start); elapsed > time.Second {
		t.Fatalf("Check took %v; layers seem to run sequentially", elapsed)
	}
}

func TestCheck_CancelledRequest(t *testing.T) {
	src := fakesource.NewDemo()
	svc := newService(t, src)
	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	if _, err := svc.Check(ctx, tokyo()); !errors.Is(err, context.Canceled) {
		t.Fatalf("err = %v, want context.Canceled", err)
	}
}

func TestCheck_InputErrors(t *testing.T) {
	tests := []struct {
		name string
		req  housing.CheckRequest
		geo  housing.Geocoder
		want error
	}{
		{"no location", housing.CheckRequest{}, nil, housing.ErrInvalidInput},
		{"lat only", housing.CheckRequest{Lat: ptr(35)}, nil, housing.ErrInvalidInput},
		{"outside Japan", housing.CheckRequest{Lat: ptr(40.7), Lon: ptr(-74.0)}, nil, housing.ErrInvalidInput},
		{"address without geocoder", housing.CheckRequest{Address: "東京都"}, nil, housing.ErrGeocodingUnavailable},
		{"unknown address", housing.CheckRequest{Address: "大阪府"}, geocode.NewStatic(nil), housing.ErrAddressNotFound},
		{"invalid cost", func() housing.CheckRequest {
			r := tokyo()
			r.Cost = &cost.Input{RentYen: -1}
			return r
		}(), nil, housing.ErrInvalidInput},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			src := fakesource.NewDemo()
			svc := newService(t, src, func(o *housing.Options) { o.Geocoder = tt.geo })

			_, err := svc.Check(context.Background(), tt.req)
			if !errors.Is(err, tt.want) {
				t.Fatalf("err = %v, want %v", err, tt.want)
			}
			if src.Calls() != 0 {
				t.Errorf("invalid input must be rejected before any upstream call (got %d calls)", src.Calls())
			}
		})
	}
}

func TestCheck_AddressAndCost(t *testing.T) {
	svc := newService(t, fakesource.NewDemo())

	rep, err := svc.Check(context.Background(), housing.CheckRequest{
		Address: "東京都千代田区丸の内１丁目",
		Lang:    "ko",
		Cost:    &cost.Input{RentYen: 80_000, DepositMonths: 1},
	})
	if err != nil {
		t.Fatal(err)
	}
	if rep.Lang != i18n.KO {
		t.Errorf("Lang = %s, want ko", rep.Lang)
	}
	if rep.Cost == nil || rep.Cost.TotalYen != 160_000 {
		t.Errorf("Cost = %+v, want total 160000", rep.Cost)
	}
}
