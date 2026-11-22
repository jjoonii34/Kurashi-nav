package housing

import (
	"context"
	"errors"

	"github.com/jjoonii34/kuramiru/internal/geo"
)

// The housing package defines the interfaces it needs ("ports") and never
// imports the code that implements them ("adapters"). cmd/api wires them.
//
//	housing ──uses──▶ LayerSource ◀──implements── reinfolib.LayerSource (live)
//	                              ◀──implements── fakesource.Source     (dev/test)
//
// This is why every test in this package runs without network or API key.

// LayerSource answers: "what does this layer say about point p?"
type LayerSource interface {
	Lookup(ctx context.Context, layer LayerID, p geo.Point) (LayerResult, error)
}

// Geocoder turns an address into a coordinate. Optional: in the MVP the
// frontend sends a map-pin coordinate instead (docs/adr/0005).
type Geocoder interface {
	Geocode(ctx context.Context, address string) (geo.Point, error)
}

// Properties are the attributes of a matched feature, passed through from
// the source (already filtered to an allow-list by the adapter).
type Properties map[string]any

// LayerResult is what a LayerSource returns for one layer.
type LayerResult struct {
	// Hit: for area layers, p lies inside at least one feature;
	// for point layers, at least one feature is nearby.
	Hit      bool
	Features []Properties
}

// Errors returned by Service.Check. The HTTP layer maps them to status codes.
var (
	ErrInvalidInput         = errors.New("invalid input")
	ErrAddressNotFound      = errors.New("address not found")
	ErrGeocodingUnavailable = errors.New("address search is not available; send lat/lon")
)
