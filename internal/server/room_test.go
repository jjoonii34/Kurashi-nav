package server

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/jjoonii34/kurashi-nav/internal/room"
)

func TestRoomSize(t *testing.T) {
	h, _ := newTestServer(t)

	rec := do(t, h, http.MethodGet, "/v1/room/size?jo=6&lang=ko", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, body %s", rec.Code, rec.Body)
	}
	var got room.Size
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if got.AreaSqm != 9.72 || got.Shape.WidthM != 2.7 || got.Shape.DepthM != 3.6 {
		t.Errorf("unexpected size: %+v", got)
	}
	if len(got.Furniture) == 0 || got.Furniture[0].Name != "싱글 침대" {
		t.Errorf("furniture not localised: %+v", got.Furniture)
	}
}

func TestRoomLayout(t *testing.T) {
	h, _ := newTestServer(t)

	rec := do(t, h, http.MethodGet, "/v1/room/layout?code=1LDK&lang=en", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, body %s", rec.Code, rec.Body)
	}
	var got room.Layout
	if err := json.NewDecoder(rec.Body).Decode(&got); err != nil {
		t.Fatal(err)
	}
	if got.Guideline == nil || got.Guideline.MinJo != 8 {
		t.Errorf("guideline = %+v, want 8畳", got.Guideline)
	}
}

func TestRoom_BadRequests(t *testing.T) {
	h, _ := newTestServer(t)
	for _, path := range []string{
		"/v1/room/size",                  // neither jo nor area
		"/v1/room/size?jo=6&area_sqm=10", // both
		"/v1/room/size?jo=six",           // not a number
		"/v1/room/size?area_sqm=-3",      // out of range
		"/v1/room/layout",                // missing code
		"/v1/room/layout?code=5R",        // R only exists as 1R
	} {
		t.Run(path, func(t *testing.T) {
			if rec := do(t, h, http.MethodGet, path, ""); rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400 (body %s)", rec.Code, rec.Body)
			}
		})
	}
}
