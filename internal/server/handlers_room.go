package server

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/jjoonii34/kurashi-nav/internal/i18n"
	"github.com/jjoonii34/kurashi-nav/internal/room"
)

// roomSize handles GET /v1/room/size?jo=6 (or ?area_sqm=25) &lang=ko.
// The response feeds the frontend's to-scale 3D room preview.
func (h *handlers) roomSize(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	in, err := sizeInputFrom(q)
	if err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid_input", err.Error())
		return
	}
	size, err := room.Describe(in, i18n.Parse(q.Get("lang")))
	if err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid_input", err.Error())
		return
	}
	// Same input → same output, and nothing location-specific: safe to cache.
	w.Header().Set("Cache-Control", "public, max-age=86400")
	writeJSON(w, http.StatusOK, size)
}

// roomLayout handles GET /v1/room/layout?code=2LDK&lang=ko.
func (h *handlers) roomLayout(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	layout, err := room.ParseLayout(q.Get("code"), i18n.Parse(q.Get("lang")))
	if err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid_input", err.Error())
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=86400")
	writeJSON(w, http.StatusOK, layout)
}

func sizeInputFrom(q url.Values) (room.SizeInput, error) {
	var in room.SizeInput
	fields := []struct {
		key string
		dst *float64
	}{
		{"area_sqm", &in.AreaSqm},
		{"jo", &in.Jo},
	}
	for _, f := range fields {
		raw := q.Get(f.key)
		if raw == "" {
			continue
		}
		v, err := strconv.ParseFloat(raw, 64)
		if err != nil {
			return in, fmt.Errorf("%s must be a number", f.key)
		}
		*f.dst = v
	}
	return in, nil
}
