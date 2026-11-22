package reinfolib

import (
	"context"
	"errors"
	"fmt"
	"math"
	"net/url"
	"slices"
	"sort"
	"time"

	"github.com/jjoonii34/kuramiru/internal/cache"
	"github.com/jjoonii34/kuramiru/internal/geo"
	"github.com/jjoonii34/kuramiru/internal/housing"
	"github.com/jjoonii34/kuramiru/internal/parallel"
)

// ErrUnsupportedLayer is returned for a layer with no configured endpoint.
var ErrUnsupportedLayer = errors.New("reinfolib: unsupported layer")

// LayerSource implements housing.LayerSource on top of the MLIT tile APIs.
//
// Flow for one lookup:
//
//	point ─▶ XYZ tile ─▶ tile cache ─(miss)─▶ Client.Tile ─▶ GeoJSON features
//	      ─▶ point-in-polygon (areas) or nearest-N (points) ─▶ allow-listed properties
//
// Area layers read the one tile containing the point. Point layers read the
// 2×2 block around it (geo.TilesAround).
//
// The cache key is the tile address plus query parameters — public data,
// never the user's coordinate (docs/adr/0002). Neighbouring homes share
// tiles, so the hit rate is high and MLIT receives fewer requests.
type LayerSource struct {
	client    *Client
	endpoints map[housing.LayerID]Endpoint
	tiles     *cache.TTL[string, []geo.Feature]
	fetching  flights
	now       func() time.Time
}

// NewLayerSource returns a LayerSource with a tile cache.
func NewLayerSource(c *Client, eps map[housing.LayerID]Endpoint, ttl time.Duration, maxTiles int) *LayerSource {
	return &LayerSource{
		client:    c,
		endpoints: eps,
		tiles:     cache.NewTTL[string, []geo.Feature](ttl, maxTiles),
		now:       time.Now,
	}
}

// Lookup implements housing.LayerSource.
func (s *LayerSource) Lookup(ctx context.Context, layer housing.LayerID, p geo.Point) (housing.LayerResult, error) {
	ep, ok := s.endpoints[layer]
	if !ok {
		return housing.LayerResult{}, fmt.Errorf("%w: %s", ErrUnsupportedLayer, layer)
	}

	var params url.Values
	if ep.Params != nil {
		params = ep.Params(s.now())
	}

	var props []housing.Properties
	switch ep.Geometry {
	case Areas:
		feats, err := s.tile(ctx, ep.API, geo.TileAt(p, ep.Zoom), params)
		if err != nil {
			return housing.LayerResult{}, err
		}
		for _, f := range feats {
			if f.Contains(p) {
				props = append(props, pick(f.Properties, ep.Keep))
			}
		}
	case Points:
		// The nearest point may lie just across a tile edge.
		feats, err := s.tilesTogether(ctx, ep.API, geo.TilesAround(p, ep.Zoom), params)
		if err != nil {
			return housing.LayerResult{}, err
		}
		props = nearest(feats, p, ep.Keep, ep.MaxFeatures)
	}
	if ep.Normalize != nil {
		for _, f := range props {
			ep.Normalize(f)
		}
	}
	return housing.LayerResult{Hit: len(props) > 0, Features: props}, nil
}

// tile returns cached features or fetches them. Concurrent lookups of the
// same cold tile share one API call.
func (s *LayerSource) tile(ctx context.Context, api string, t geo.Tile, params url.Values) ([]geo.Feature, error) {
	key := api + "|" + t.String() + "|" + params.Encode()
	if feats, ok := s.tiles.Get(key); ok {
		return feats, nil
	}
	return s.fetching.do(ctx, key, func(ctx context.Context) ([]geo.Feature, error) {
		feats, err := s.client.Tile(ctx, api, t, params)
		if err != nil {
			return nil, err
		}
		s.tiles.Set(key, feats)
		return feats, nil
	})
}

// tilesTogether fetches several tiles at once and joins their features.
// One failed tile fails the lookup: a result built from part of the area
// would look complete while missing the nearest points on one side.
func (s *LayerSource) tilesTogether(ctx context.Context, api string, tiles []geo.Tile, params url.Values) ([]geo.Feature, error) {
	perTile := make([][]geo.Feature, len(tiles))

	g, ctx := parallel.WithContext(ctx)
	for i, t := range tiles {
		g.Go(func() error {
			feats, err := s.tile(ctx, api, t, params)
			perTile[i] = feats
			return err
		})
	}
	if err := g.Wait(); err != nil {
		return nil, err
	}
	return slices.Concat(perTile...), nil
}

// pick copies only the allowed keys. Cached features are shared between
// requests, so they must never be mutated — always copy.
func pick(props map[string]any, keep []string) housing.Properties {
	out := make(housing.Properties, len(keep))
	if keep == nil {
		for k, v := range props {
			out[k] = v
		}
		return out
	}
	for _, k := range keep {
		if v, ok := props[k]; ok {
			out[k] = v
		}
	}
	return out
}

// nearest returns point features sorted by distance from p, capped at limit.
func nearest(feats []geo.Feature, p geo.Point, keep []string, limit int) []housing.Properties {
	type hit struct {
		props    housing.Properties
		distance float64
	}
	var hits []hit
	for _, f := range feats {
		if f.Point == nil {
			continue
		}
		d := geo.DistanceMeters(p, *f.Point)
		props := pick(f.Properties, keep)
		props["distance_m"] = int(math.Round(d))
		hits = append(hits, hit{props, d})
	}
	sort.SliceStable(hits, func(i, j int) bool { return hits[i].distance < hits[j].distance })
	if limit > 0 && len(hits) > limit {
		hits = hits[:limit]
	}
	out := make([]housing.Properties, len(hits))
	for i, h := range hits {
		out[i] = h.props
	}
	return out
}
