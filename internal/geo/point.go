// Package geo holds the small amount of geometry this service needs:
// points, XYZ map tiles, GeoJSON decoding and point-in-polygon tests.
// Standard library only.
package geo

import (
	"errors"
	"math"
)

// Point is a WGS84 coordinate. Note that GeoJSON orders positions as
// [lon, lat]; this struct names the fields to avoid that classic bug.
type Point struct {
	Lat float64 `json:"lat"`
	Lon float64 `json:"lon"`
}

// ErrOutsideJapan is returned for coordinates outside Japan's bounding box.
var ErrOutsideJapan = errors.New("coordinate is outside Japan")

// ErrInvalidCoordinate is returned for NaN, Inf or out-of-range values.
var ErrInvalidCoordinate = errors.New("invalid coordinate")

// Japan's rough bounding box (incl. Okinawa and Hokkaido).
// It is coarse on purpose: parts of Korea and Russia fall inside it, and the
// upstream simply returns no data there. A precise check against prefecture
// polygons is a good follow-up exercise.
const (
	minLat, maxLat = 20.0, 46.0
	minLon, maxLon = 122.0, 154.0
)

// Validate reports whether p is a usable coordinate inside Japan.
func (p Point) Validate() error {
	for _, v := range []float64{p.Lat, p.Lon} {
		if math.IsNaN(v) || math.IsInf(v, 0) {
			return ErrInvalidCoordinate
		}
	}
	if p.Lat < -90 || p.Lat > 90 || p.Lon < -180 || p.Lon > 180 {
		return ErrInvalidCoordinate
	}
	if p.Lat < minLat || p.Lat > maxLat || p.Lon < minLon || p.Lon > maxLon {
		return ErrOutsideJapan
	}
	return nil
}

const earthRadiusMeters = 6_371_008.8

// DistanceMeters returns the great-circle (haversine) distance between a and b.
func DistanceMeters(a, b Point) float64 {
	rad := func(d float64) float64 { return d * math.Pi / 180 }
	dLat := rad(b.Lat - a.Lat)
	dLon := rad(b.Lon - a.Lon)
	h := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(rad(a.Lat))*math.Cos(rad(b.Lat))*math.Sin(dLon/2)*math.Sin(dLon/2)
	return 2 * earthRadiusMeters * math.Asin(math.Min(1, math.Sqrt(h)))
}
