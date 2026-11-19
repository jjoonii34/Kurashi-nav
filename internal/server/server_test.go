package server

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/fakesource"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
	"github.com/jjoonii34/kurashi-nav/internal/source"
)

// newTestServer wires the real housing service to dummy data, exactly as
// cmd/api does in DATA_MODE=fake. logs captures everything written to the log.
func newTestServer(t *testing.T) (http.Handler, *bytes.Buffer) {
	t.Helper()
	logs := &bytes.Buffer{}
	logger := slog.New(slog.NewTextHandler(logs, &slog.HandlerOptions{Level: slog.LevelDebug}))

	svc, err := housing.NewService(housing.Options{
		Layers:       housing.DefaultLayers(source.Dummy.ID),
		Source:       fakesource.NewDemo(),
		Attributions: []source.Attribution{source.Dummy},
		LayerTimeout: time.Second,
		Logger:       logger,
	})
	if err != nil {
		t.Fatal(err)
	}
	return New(Deps{
		Logger:         logger,
		Housing:        svc,
		Sources:        []source.Attribution{source.Dummy},
		AllowedOrigins: []string{"http://localhost:3000"},
		Version:        "test",
	}), logs
}

func do(t *testing.T, h http.Handler, method, path, body string, headers ...string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	for i := 0; i+1 < len(headers); i += 2 {
		req.Header.Set(headers[i], headers[i+1])
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestHealthz(t *testing.T) {
	h, _ := newTestServer(t)
	rec := do(t, h, http.MethodGet, "/healthz", "")
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d", rec.Code)
	}
	if rec.Header().Get("X-Request-Id") == "" {
		t.Error("missing X-Request-Id")
	}
	if rec.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Error("missing security headers")
	}
}

func TestHousingCheck_OK(t *testing.T) {
	h, logs := newTestServer(t)
	body := `{"lat":35.681236,"lon":139.767125,"lang":"ja","cost":{"rent_yen":80000,"deposit_months":1}}`

	rec := do(t, h, http.MethodPost, "/v1/housing/check", body)
	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, body = %s", rec.Code, rec.Body)
	}
	if rec.Header().Get("Cache-Control") != "no-store" {
		t.Error("housing responses must not be cached")
	}

	var rep housing.Report
	if err := json.NewDecoder(rec.Body).Decode(&rep); err != nil {
		t.Fatal(err)
	}
	if len(rep.Sections) != len(housing.DefaultLayers("")) || rep.Lang != housing.LangJAEasy {
		t.Errorf("unexpected report: %d sections, lang %s", len(rep.Sections), rep.Lang)
	}
	if rep.Cost == nil || rep.Cost.TotalYen != 160_000 {
		t.Errorf("cost = %+v", rep.Cost)
	}

	// Privacy: the coordinate and the rent must not appear in logs (ADR-0002).
	for _, secret := range []string{"35.68", "139.76", "80000"} {
		if strings.Contains(logs.String(), secret) {
			t.Errorf("user input %q leaked into logs:\n%s", secret, logs)
		}
	}
}

func TestHousingCheck_ClientErrors(t *testing.T) {
	h, _ := newTestServer(t)
	tests := []struct {
		name     string
		body     string
		ctype    string
		want     int
		wantCode string
	}{
		{"empty body", "", "application/json", 400, "empty_body"},
		{"malformed", `{"lat":`, "application/json", 400, "malformed_json"},
		{"unknown field", `{"lat":35,"lon":139,"rent":1}`, "application/json", 400, "unknown_field"},
		{"wrong type", `{"lat":"35"}`, "application/json", 400, "wrong_type"},
		{"two objects", `{"lat":35.6,"lon":139.7}{}`, "application/json", 400, "malformed_json"},
		{"not json", `lat=35`, "application/x-www-form-urlencoded", 415, "unsupported_media_type"},
		{"too large", `{"address":"` + strings.Repeat("あ", 10_000) + `"}`, "application/json", 413, "body_too_large"},
		{"no location", `{}`, "application/json", 400, "invalid_input"},
		{"outside Japan", `{"lat":40.7,"lon":-74.0}`, "application/json", 400, "invalid_input"},
		{"address without geocoder", `{"address":"東京都"}`, "application/json", 422, "geocoding_unavailable"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodPost, "/v1/housing/check", strings.NewReader(tt.body))
			req.Header.Set("Content-Type", tt.ctype)
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, req)

			if rec.Code != tt.want {
				t.Fatalf("status = %d, want %d (body %s)", rec.Code, tt.want, rec.Body)
			}
			var eb errorBody
			if err := json.NewDecoder(rec.Body).Decode(&eb); err != nil {
				t.Fatal(err)
			}
			if eb.Error.Code != tt.wantCode {
				t.Errorf("error code = %q, want %q", eb.Error.Code, tt.wantCode)
			}
			if eb.Error.RequestID == "" {
				t.Error("error responses must carry the request id")
			}
		})
	}
}

func TestMethodNotAllowed(t *testing.T) {
	h, _ := newTestServer(t)
	if rec := do(t, h, http.MethodGet, "/v1/housing/check", ""); rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", rec.Code)
	}
}

func TestCORS(t *testing.T) {
	h, _ := newTestServer(t)

	rec := do(t, h, http.MethodOptions, "/v1/housing/check", "",
		"Origin", "http://localhost:3000", "Access-Control-Request-Method", "POST")
	if rec.Code != http.StatusNoContent || rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatalf("preflight: status %d, headers %v", rec.Code, rec.Header())
	}

	rec = do(t, h, http.MethodGet, "/healthz", "", "Origin", "https://evil.example")
	if rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatal("unknown origins must not be allowed")
	}
}

type panicky struct{}

func (panicky) Check(context.Context, housing.CheckRequest) (housing.Report, error) {
	panic("boom")
}

func TestPanicBecomes500(t *testing.T) {
	h := New(Deps{Logger: slog.New(slog.NewTextHandler(io.Discard, nil)), Housing: panicky{}})
	rec := do(t, h, http.MethodPost, "/v1/housing/check", `{"lat":35.6,"lon":139.7}`)
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
}

func TestListSources(t *testing.T) {
	h, _ := newTestServer(t)
	rec := do(t, h, http.MethodGet, "/v1/meta/sources", "")
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), `"id":"dummy"`) {
		t.Fatalf("status %d body %s", rec.Code, rec.Body)
	}
}
