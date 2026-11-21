package geo

import (
	"errors"
	"math"
	"slices"
	"strings"
	"testing"
)

func TestPointValidate(t *testing.T) {
	tests := []struct {
		name string
		p    Point
		want error
	}{
		{"tokyo station", Point{35.681236, 139.767125}, nil},
		{"naha", Point{26.2124, 127.6809}, nil},
		{"sapporo", Point{43.0618, 141.3545}, nil},
		{"new york", Point{40.7128, -74.0060}, ErrOutsideJapan},
		{"lat/lon swapped", Point{139.767125, 35.681236}, ErrInvalidCoordinate},
		{"NaN", Point{math.NaN(), 139.7}, ErrInvalidCoordinate},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.p.Validate(); !errors.Is(got, tt.want) {
				t.Fatalf("Validate() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTileAt(t *testing.T) {
	tests := []struct {
		name string
		p    Point
		z    int
		want Tile
	}{
		{"origin z0", Point{0, 0}, 0, Tile{0, 0, 0}},
		{"origin z1", Point{0, 0}, 1, Tile{1, 1, 1}},
		// Expected values computed independently (Python, same Web Mercator formula).
		{"tokyo station z15", Point{35.681236, 139.767125}, 15, Tile{15, 29105, 12903}},
		{"tokyo station z11", Point{35.681236, 139.767125}, 11, Tile{11, 1819, 806}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := TileAt(tt.p, tt.z); got != tt.want {
				t.Fatalf("TileAt() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTilesAround(t *testing.T) {
	// At zoom 2 the map is a 4×4 grid, so the expected tiles can be checked
	// by hand: one tile spans 90° of longitude, and latitude 10° sits just
	// above the equator border between rows 1 and 2.
	tests := []struct {
		name string
		p    Point
		z    int
		want []Tile
	}{
		{"near the left and bottom borders", Point{Lat: 10, Lon: 10}, 2, []Tile{{2, 1, 1}, {2, 2, 1}, {2, 1, 2}, {2, 2, 2}}},
		{"near the right and bottom borders", Point{Lat: 10, Lon: 80}, 2, []Tile{{2, 2, 1}, {2, 3, 1}, {2, 2, 2}, {2, 3, 2}}},
		{"near the left and top borders", Point{Lat: -10, Lon: 10}, 2, []Tile{{2, 1, 1}, {2, 2, 1}, {2, 1, 2}, {2, 2, 2}}},
		{"near the top border of row 1", Point{Lat: 60, Lon: 10}, 2, []Tile{{2, 1, 0}, {2, 2, 0}, {2, 1, 1}, {2, 2, 1}}},
		{"at the edge of the map, tiles off the map are left out", Point{Lat: 10, Lon: -179}, 2, []Tile{{2, 0, 1}, {2, 0, 2}}},
		{"zoom 0 has a single tile", Point{Lat: 10, Lon: 10}, 0, []Tile{{0, 0, 0}}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := TilesAround(tt.p, tt.z)
			if !slices.Equal(got, tt.want) {
				t.Fatalf("TilesAround() = %v, want %v", got, tt.want)
			}
			if !slices.Contains(got, TileAt(tt.p, tt.z)) {
				t.Errorf("TilesAround() = %v does not contain the point's own tile %v", got, TileAt(tt.p, tt.z))
			}
		})
	}
}

func TestDistanceMeters(t *testing.T) {
	tokyo := Point{35.681236, 139.767125}
	shinjuku := Point{35.690921, 139.700258}
	got := DistanceMeters(tokyo, shinjuku)
	if got < 6000 || got > 6200 { // ≈ 6.1 km
		t.Fatalf("DistanceMeters = %.0f, want ≈ 6100", got)
	}
}

// A 10x10 square with a 2x2 hole in the middle, plus a separate square.
const sample = `{
  "type": "FeatureCollection",
  "features": [
    {"type": "Feature", "properties": {"name": "square-with-hole"},
     "geometry": {"type": "Polygon", "coordinates": [
       [[0,0],[10,0],[10,10],[0,10],[0,0]],
       [[4,4],[6,4],[6,6],[4,6],[4,4]]
     ]}},
    {"type": "Feature", "properties": {"name": "multi"},
     "geometry": {"type": "MultiPolygon", "coordinates": [
       [[[20,20,5],[22,20,5],[22,22,5],[20,22,5],[20,20,5]]]
     ]}},
    {"type": "Feature", "properties": {"name": "station"},
     "geometry": {"type": "Point", "coordinates": [139.7671, 35.6812]}},
    {"type": "Feature", "properties": {"name": "road"},
     "geometry": {"type": "LineString", "coordinates": [[0,0],[1,1]]}}
  ]
}`

func TestDecodeAndContains(t *testing.T) {
	feats, err := DecodeFeatureCollection(strings.NewReader(sample))
	if err != nil {
		t.Fatal(err)
	}
	if len(feats) != 4 {
		t.Fatalf("got %d features, want 4", len(feats))
	}

	square, multi, station, road := feats[0], feats[1], feats[2], feats[3]

	tests := []struct {
		name string
		f    Feature
		p    Point
		want bool
	}{
		{"inside square", square, Point{Lat: 2, Lon: 2}, true},
		{"inside hole", square, Point{Lat: 5, Lon: 5}, false},
		{"outside square", square, Point{Lat: 11, Lon: 5}, false},
		{"inside multipolygon (3D coords)", multi, Point{Lat: 21, Lon: 21}, true},
		{"outside multipolygon", multi, Point{Lat: 2, Lon: 2}, false},
		{"point feature never contains", station, Point{Lat: 35.6812, Lon: 139.7671}, false},
		{"linestring ignored", road, Point{Lat: 0.5, Lon: 0.5}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := tt.f.Contains(tt.p); got != tt.want {
				t.Fatalf("Contains(%v) = %v, want %v", tt.p, got, tt.want)
			}
		})
	}

	if station.Point == nil || station.Point.Lat != 35.6812 || station.Point.Lon != 139.7671 {
		t.Errorf("point decoded as %+v; GeoJSON order is [lon, lat]", station.Point)
	}
}

func TestDecodeRejectsGarbage(t *testing.T) {
	for _, in := range []string{`not json`, `{"type":"Feature"}`} {
		if _, err := DecodeFeatureCollection(strings.NewReader(in)); err == nil {
			t.Errorf("DecodeFeatureCollection(%q) succeeded, want error", in)
		}
	}
}

func TestDecodeEmpty(t *testing.T) {
	// MLIT tile APIs return 200 with an empty collection when there is no data.
	feats, err := DecodeFeatureCollection(strings.NewReader(`{"type":"FeatureCollection","features":[]}`))
	if err != nil || len(feats) != 0 {
		t.Fatalf("got %v, %v; want empty, nil", feats, err)
	}
}
