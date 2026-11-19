// Package reinfolib talks to the MLIT 不動産情報ライブラリ (Real Estate
// Information Library) API.
//
//	client.go       low-level HTTP client: auth header, rate limit, size limit
//	endpoints.go    which MLIT API serves which housing layer
//	layersource.go  adapter implementing housing.LayerSource (tile cache + geometry)
//
// API manual: https://www.reinfolib.mlit.go.jp/help/apiManual/
// The manual asks callers not to send requests from browsers, not to fire
// requests back-to-back, and notes that tile APIs return 200 with an empty
// collection when there is no data. This package follows all three.
package reinfolib

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/geo"
	"github.com/jjoonii34/kurashi-nav/internal/ratelimit"
)

const (
	apiKeyHeader     = "Ocp-Apim-Subscription-Key"
	maxResponseBytes = 32 << 20 // a z15 tile is far smaller; this guards against surprises
)

// ClientConfig configures a Client.
type ClientConfig struct {
	BaseURL    string // e.g. https://www.reinfolib.mlit.go.jp/ex-api/external
	APIKey     string
	Limiter    *ratelimit.Limiter // nil = unlimited (tests only)
	HTTPClient *http.Client       // nil = a client with a 30s backstop timeout
	UserAgent  string
}

// Client is safe for concurrent use.
type Client struct {
	baseURL   string
	apiKey    string
	limiter   *ratelimit.Limiter
	hc        *http.Client
	userAgent string
}

// NewClient returns a Client.
func NewClient(cfg ClientConfig) *Client {
	hc := cfg.HTTPClient
	if hc == nil {
		// Per-call deadlines come from the context; this is only a backstop.
		hc = &http.Client{Timeout: 30 * time.Second}
	}
	ua := cfg.UserAgent
	if ua == "" {
		ua = "kurashi-nav"
	}
	return &Client{
		baseURL:   cfg.BaseURL,
		apiKey:    cfg.APIKey,
		limiter:   cfg.Limiter,
		hc:        hc,
		userAgent: ua,
	}
}

// StatusError is returned when the API answers with a non-200 status.
type StatusError struct {
	API  string
	Code int
}

func (e *StatusError) Error() string {
	return fmt.Sprintf("reinfolib %s: unexpected HTTP status %d", e.API, e.Code)
}

// Tile fetches one XYZ tile of api (e.g. "XKT026") as GeoJSON.
// extra adds API-specific query parameters (e.g. from/to for XPT001).
func (c *Client) Tile(ctx context.Context, api string, t geo.Tile, extra url.Values) ([]geo.Feature, error) {
	if err := c.limiter.Wait(ctx); err != nil {
		return nil, fmt.Errorf("reinfolib %s: rate limit: %w", api, err)
	}

	q := url.Values{}
	for k, vs := range extra {
		q[k] = vs
	}
	q.Set("response_format", "geojson")
	q.Set("z", strconv.Itoa(t.Z))
	q.Set("x", strconv.Itoa(t.X))
	q.Set("y", strconv.Itoa(t.Y))
	endpoint := c.baseURL + "/" + url.PathEscape(api) + "?" + q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("reinfolib %s: build request: %w", api, err)
	}
	// The key goes in a header, never in the URL, so it can't leak into
	// error messages or proxy logs.
	req.Header.Set(apiKeyHeader, c.apiKey)
	req.Header.Set("User-Agent", c.userAgent)

	resp, err := c.hc.Do(req)
	if err != nil {
		return nil, fmt.Errorf("reinfolib %s %s: %w", api, t, err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
	case http.StatusNoContent:
		return nil, nil
	default:
		// Drain a little so the connection can be reused.
		_, _ = io.Copy(io.Discard, io.LimitReader(resp.Body, 4<<10))
		return nil, &StatusError{API: api, Code: resp.StatusCode}
	}

	feats, err := geo.DecodeFeatureCollection(io.LimitReader(resp.Body, maxResponseBytes))
	if err != nil {
		return nil, fmt.Errorf("reinfolib %s %s: %w", api, t, err)
	}
	return feats, nil
}
