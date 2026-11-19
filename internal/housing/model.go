package housing

import (
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/cost"
	"github.com/jjoonii34/kurashi-nav/internal/geo"
	"github.com/jjoonii34/kurashi-nav/internal/source"
)

// CheckRequest is the body of POST /v1/housing/check.
//
// Privacy: nothing in this struct is stored or logged (docs/adr/0002).
type CheckRequest struct {
	Lat     *float64    `json:"lat,omitempty"`
	Lon     *float64    `json:"lon,omitempty"`
	Address string      `json:"address,omitempty"` // used only if lat/lon are absent
	Lang    string      `json:"lang,omitempty"`    // "en" (default), "ko", "ja-easy"
	Cost    *cost.Input `json:"cost,omitempty"`    // optional initial-cost check
}

// Status of one report section.
type Status string

const (
	StatusOK          Status = "ok"
	StatusUnavailable Status = "unavailable"
)

// Section is one row of the report, e.g. "flood".
type Section struct {
	Layer     LayerID      `json:"layer"`
	Kind      Kind         `json:"kind"`
	Title     string       `json:"title"`
	Status    Status       `json:"status"`
	Hit       bool         `json:"hit"`
	Features  []Properties `json:"features,omitempty"`
	Message   string       `json:"message,omitempty"`
	SourceID  string       `json:"source_id"`
	ElapsedMS int64        `json:"elapsed_ms"`
}

// Report is the response of a housing check.
type Report struct {
	Location    geo.Point            `json:"location"`
	Lang        Lang                 `json:"lang"`
	Sections    []Section            `json:"sections"`
	Cost        *cost.Result         `json:"cost,omitempty"`
	Partial     bool                 `json:"partial"` // true if any section is unavailable
	Sources     []source.Attribution `json:"sources"`
	Disclaimer  string               `json:"disclaimer"`
	GeneratedAt time.Time            `json:"generated_at"`
}
