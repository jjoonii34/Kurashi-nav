// Package server is the HTTP layer: routing, middleware, JSON in/out and the
// mapping from domain errors to status codes. No business logic lives here.
package server

import (
	"context"
	"log/slog"
	"net/http"
	"time"

	"github.com/jjoonii34/kuramiru/internal/housing"
	"github.com/jjoonii34/kuramiru/internal/source"
)

// HousingChecker is the only thing the HTTP layer needs from the domain.
// Tests can pass a stub; production passes *housing.Service.
type HousingChecker interface {
	Check(ctx context.Context, req housing.CheckRequest) (housing.Report, error)
}

// Deps are the server's dependencies.
type Deps struct {
	Logger         *slog.Logger
	Housing        HousingChecker
	Sources        []source.Attribution
	AllowedOrigins []string
	RequestTimeout time.Duration
	Version        string
}

// New returns the root handler.
//
// Routes use Go 1.22+ method patterns, so wrong methods get 405 for free.
// Middleware wraps from the inside out; a request passes through them in the
// reverse order of the lines below:
//
//	requestID → accessLog → recover → securityHeaders → cors → timeout → mux
func New(d Deps) http.Handler {
	if d.Logger == nil {
		d.Logger = slog.Default()
	}
	if d.RequestTimeout <= 0 {
		d.RequestTimeout = 15 * time.Second
	}
	if d.Sources == nil {
		d.Sources = []source.Attribution{}
	}

	h := &handlers{log: d.Logger, housing: d.Housing, sources: d.Sources, version: d.Version}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", h.healthz)
	mux.HandleFunc("GET /v1/meta/sources", h.listSources)
	mux.HandleFunc("POST /v1/housing/check", h.checkHousing)
	mux.HandleFunc("GET /v1/room/size", h.roomSize)
	mux.HandleFunc("GET /v1/room/layout", h.roomLayout)

	var handler http.Handler = mux
	handler = withTimeout(handler, d.RequestTimeout)
	handler = withCORS(handler, d.AllowedOrigins)
	handler = withSecurityHeaders(handler)
	handler = withRecover(handler, d.Logger)
	handler = withAccessLog(handler, d.Logger)
	handler = withRequestID(handler)
	return handler
}
