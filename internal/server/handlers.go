package server

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/jjoonii34/kurashi-nav/internal/housing"
	"github.com/jjoonii34/kurashi-nav/internal/source"
)

type handlers struct {
	log     *slog.Logger
	housing HousingChecker
	sources []source.Attribution
	version string
}

// healthz is used by Docker, Cloud Run and uptime checks.
func (h *handlers) healthz(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "version": h.version})
}

// listSources returns every data source and its required credit, so the
// frontend can render an "About the data" page.
func (h *handlers) listSources(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "public, max-age=3600")
	writeJSON(w, http.StatusOK, map[string]any{"sources": h.sources})
}

// checkHousing handles POST /v1/housing/check.
func (h *handlers) checkHousing(w http.ResponseWriter, r *http.Request) {
	var req housing.CheckRequest
	if err := decodeJSON(w, r, &req); err != nil {
		writeDecodeError(w, r, err)
		return
	}

	rep, err := h.housing.Check(r.Context(), req)
	switch {
	case err == nil:
		// The response is about one person's prospective home: never cache it.
		w.Header().Set("Cache-Control", "no-store")
		writeJSON(w, http.StatusOK, rep)
	case errors.Is(err, housing.ErrInvalidInput):
		writeError(w, r, http.StatusBadRequest, "invalid_input", err.Error())
	case errors.Is(err, housing.ErrAddressNotFound):
		writeError(w, r, http.StatusUnprocessableEntity, "address_not_found", "address not found; drop a pin on the map instead")
	case errors.Is(err, housing.ErrGeocodingUnavailable):
		writeError(w, r, http.StatusUnprocessableEntity, "geocoding_unavailable", err.Error())
	case errors.Is(err, context.DeadlineExceeded):
		writeError(w, r, http.StatusGatewayTimeout, "timeout", "the request took too long; please retry")
	case errors.Is(err, context.Canceled):
		// The client disconnected; nobody is listening for a response.
		h.log.DebugContext(r.Context(), "client went away", "request_id", requestIDFrom(r.Context()))
	default:
		h.log.ErrorContext(r.Context(), "housing check failed",
			"request_id", requestIDFrom(r.Context()), "error", err)
		writeError(w, r, http.StatusInternalServerError, "internal", "internal server error")
	}
}
