package geo

import (
	"encoding/json"
	"fmt"
	"io"
)

// Ring is a closed linear ring of GeoJSON positions, each [lon, lat].
type Ring [][2]float64

// Polygon is an outer ring followed by zero or more holes.
type Polygon []Ring

// Feature is a decoded GeoJSON feature. Geometry is normalised so callers
// only deal with two shapes: polygons (Polygon and MultiPolygon) and a point.
// Other geometry types (e.g. LineString) keep only their properties.
type Feature struct {
	Properties map[string]any
	Polygons   []Polygon
	Point      *Point
}

// Contains reports whether p lies inside any of the feature's polygons.
func (f Feature) Contains(p Point) bool {
	for _, pg := range f.Polygons {
		if pg.Contains(p) {
			return true
		}
	}
	return false
}

type rawCollection struct {
	Type     string       `json:"type"`
	Features []rawFeature `json:"features"`
}

type rawFeature struct {
	Geometry *struct {
		Type        string          `json:"type"`
		Coordinates json.RawMessage `json:"coordinates"`
	} `json:"geometry"`
	Properties map[string]any `json:"properties"`
}

// DecodeFeatureCollection parses a GeoJSON FeatureCollection.
// Positions with a third (altitude) value are accepted; the extra value is dropped.
func DecodeFeatureCollection(r io.Reader) ([]Feature, error) {
	var raw rawCollection
	if err := json.NewDecoder(r).Decode(&raw); err != nil {
		return nil, fmt.Errorf("decode geojson: %w", err)
	}
	if raw.Type != "" && raw.Type != "FeatureCollection" {
		return nil, fmt.Errorf("decode geojson: want FeatureCollection, got %q", raw.Type)
	}

	out := make([]Feature, 0, len(raw.Features))
	for i, rf := range raw.Features {
		f := Feature{Properties: rf.Properties}
		if rf.Geometry != nil {
			if err := decodeGeometry(&f, rf.Geometry.Type, rf.Geometry.Coordinates); err != nil {
				return nil, fmt.Errorf("decode geojson feature %d: %w", i, err)
			}
		}
		out = append(out, f)
	}
	return out, nil
}

func decodeGeometry(f *Feature, typ string, coords json.RawMessage) error {
	switch typ {
	case "Polygon":
		var pg Polygon
		if err := json.Unmarshal(coords, &pg); err != nil {
			return err
		}
		f.Polygons = []Polygon{pg}
	case "MultiPolygon":
		if err := json.Unmarshal(coords, &f.Polygons); err != nil {
			return err
		}
	case "Point":
		var pos [2]float64
		if err := json.Unmarshal(coords, &pos); err != nil {
			return err
		}
		f.Point = &Point{Lat: pos[1], Lon: pos[0]}
	default:
		// Ignored on purpose: this service only needs areas and points.
	}
	return nil
}
