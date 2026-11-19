package reinfolib

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/geo"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

var tokyoStation = geo.Point{Lat: 35.681236, Lon: 139.767125}

// A square around Tokyo Station, as the zoning API might return it.
const zoningTile = `{"type":"FeatureCollection","features":[
 {"type":"Feature","properties":{"use_area_ja":"商業地域","u_floor_area_ratio_ja":"1300%","secret_internal_field":"x"},
  "geometry":{"type":"Polygon","coordinates":[[[139.76,35.67],[139.78,35.67],[139.78,35.69],[139.76,35.69],[139.76,35.67]]]}},
 {"type":"Feature","properties":{"use_area_ja":"第一種住居地域"},
  "geometry":{"type":"Polygon","coordinates":[[[139.70,35.60],[139.71,35.60],[139.71,35.61],[139.70,35.61],[139.70,35.60]]]}}
]}`

const transactionTile = `{"type":"FeatureCollection","features":[
 {"type":"Feature","properties":{"u_transaction_price_total_ja":"far"},"geometry":{"type":"Point","coordinates":[139.80,35.70]}},
 {"type":"Feature","properties":{"u_transaction_price_total_ja":"near"},"geometry":{"type":"Point","coordinates":[139.7672,35.6813]}}
]}`

// fakeMLIT is an httptest server that mimics the MLIT API.
func fakeMLIT(t *testing.T, body string, calls *atomic.Int64, lastQuery *atomic.Value) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls.Add(1)
		lastQuery.Store(r.URL.Query())
		if r.Header.Get("Ocp-Apim-Subscription-Key") != "test-key" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, body)
	}))
	t.Cleanup(srv.Close)
	return srv
}

func newSource(srvURL, key string) *LayerSource {
	c := NewClient(ClientConfig{BaseURL: srvURL, APIKey: key})
	return NewLayerSource(c, DefaultEndpoints(), time.Hour, 100)
}

func TestLookup_AreaLayer(t *testing.T) {
	var calls atomic.Int64
	var q atomic.Value
	srv := fakeMLIT(t, zoningTile, &calls, &q)
	src := newSource(srv.URL, "test-key")

	res, err := src.Lookup(context.Background(), housing.LayerZoning, tokyoStation)
	if err != nil {
		t.Fatal(err)
	}
	if !res.Hit || len(res.Features) != 1 {
		t.Fatalf("got %+v, want exactly the containing polygon", res)
	}
	f := res.Features[0]
	if f["use_area_ja"] != "商業地域" {
		t.Errorf("use_area_ja = %v", f["use_area_ja"])
	}
	if _, leaked := f["secret_internal_field"]; leaked {
		t.Error("properties outside the allow-list must be dropped")
	}

	query := q.Load().(url.Values)
	if query.Get("z") != "15" || query.Get("x") != "29105" || query.Get("y") != "12903" || query.Get("response_format") != "geojson" {
		t.Errorf("unexpected query %v", query)
	}

	// Second lookup in the same tile is served from cache.
	if _, err := src.Lookup(context.Background(), housing.LayerZoning, tokyoStation); err != nil {
		t.Fatal(err)
	}
	if calls.Load() != 1 {
		t.Errorf("upstream called %d times, want 1 (cache miss only)", calls.Load())
	}
}

func TestLookup_PointLayer(t *testing.T) {
	var calls atomic.Int64
	var q atomic.Value
	srv := fakeMLIT(t, transactionTile, &calls, &q)
	src := newSource(srv.URL, "test-key")
	src.now = func() time.Time { return time.Date(2026, 11, 19, 0, 0, 0, 0, time.UTC) }

	res, err := src.Lookup(context.Background(), housing.LayerTransactions, tokyoStation)
	if err != nil {
		t.Fatal(err)
	}
	if len(res.Features) != 2 || res.Features[0]["u_transaction_price_total_ja"] != "near" {
		t.Fatalf("want nearest first, got %+v", res.Features)
	}
	if _, ok := res.Features[0]["distance_m"]; !ok {
		t.Error("distance_m missing")
	}

	query := q.Load().(url.Values)
	if query.Get("from") != "20231" || query.Get("to") != "20254" {
		t.Errorf("from/to = %s/%s, want 20231/20254", query.Get("from"), query.Get("to"))
	}
}

func TestLookup_UpstreamError(t *testing.T) {
	var calls atomic.Int64
	var q atomic.Value
	srv := fakeMLIT(t, zoningTile, &calls, &q)
	src := newSource(srv.URL, "wrong-key")

	_, err := src.Lookup(context.Background(), housing.LayerZoning, tokyoStation)
	var se *StatusError
	if !errors.As(err, &se) || se.Code != http.StatusUnauthorized {
		t.Fatalf("err = %v, want StatusError 401", err)
	}
	if strings.Contains(err.Error(), "wrong-key") {
		t.Fatal("API key leaked into the error")
	}
}

func TestLookup_UnsupportedLayer(t *testing.T) {
	src := newSource("http://unused.invalid", "k")
	if _, err := src.Lookup(context.Background(), "nope", tokyoStation); !errors.Is(err, ErrUnsupportedLayer) {
		t.Fatalf("err = %v, want ErrUnsupportedLayer", err)
	}
}

func TestEveryDefaultLayerHasAnEndpoint(t *testing.T) {
	eps := DefaultEndpoints()
	for _, l := range housing.DefaultLayers("") {
		ep, ok := eps[l.ID]
		if !ok {
			t.Errorf("layer %s has no endpoint", l.ID)
			continue
		}
		if ep.Zoom < 11 || ep.Zoom > 15 {
			t.Errorf("layer %s: zoom %d outside the API's 11-15 range", l.ID, ep.Zoom)
		}
	}
}
