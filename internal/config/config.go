// Package config reads all settings from environment variables (12-factor).
//
// Secrets such as the MLIT API key come only from the environment
// (.env locally, Secret Manager in production) and are never logged.
package config

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"strconv"
	"strings"
	"time"
)

// DataMode selects where location data comes from.
type DataMode string

const (
	// DataModeFake serves built-in dummy data. No API key needed. Default.
	DataModeFake DataMode = "fake"
	// DataModeLive calls the MLIT 不動産情報ライブラリ API.
	DataModeLive DataMode = "live"
)

// Config is the full runtime configuration.
type Config struct {
	Env       string
	Port      string
	LogLevel  slog.Level
	LogFormat string // "text" (local) or "json" (Cloud Logging)

	DataMode            DataMode
	ReinfolibBaseURL    string
	ReinfolibAPIKey     Secret
	ReinfolibRPS        float64 // sustained requests/second toward MLIT
	ReinfolibBurst      int     // requests allowed at once (one housing check ≈ 9 tiles)
	UpstreamTimeout     time.Duration
	TileCacheTTL        time.Duration
	TileCacheMaxEntries int

	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration
	AllowedOrigins  []string // CORS allow-list for the Next.js frontend
}

// Load reads the configuration from the process environment.
func Load() (Config, error) { return FromEnv(os.Getenv) }

// FromEnv reads the configuration through getenv so tests can inject values.
// All problems are reported together instead of one at a time.
func FromEnv(getenv func(string) string) (Config, error) {
	p := parser{getenv: getenv}

	c := Config{
		Env:                 p.str("APP_ENV", "local"),
		Port:                p.str("PORT", "8080"), // Cloud Run injects PORT
		LogLevel:            p.level("LOG_LEVEL", slog.LevelInfo),
		LogFormat:           p.oneOf("LOG_FORMAT", "text", "text", "json"),
		DataMode:            DataMode(p.oneOf("DATA_MODE", string(DataModeFake), string(DataModeFake), string(DataModeLive))),
		ReinfolibBaseURL:    strings.TrimRight(p.str("REINFOLIB_BASE_URL", "https://www.reinfolib.mlit.go.jp/ex-api/external"), "/"),
		ReinfolibAPIKey:     Secret(strings.TrimSpace(getenv("REINFOLIB_API_KEY"))),
		ReinfolibRPS:        p.float("REINFOLIB_RPS", 1),
		ReinfolibBurst:      p.int("REINFOLIB_BURST", 10),
		UpstreamTimeout:     p.duration("UPSTREAM_TIMEOUT", 5*time.Second),
		TileCacheTTL:        p.duration("TILE_CACHE_TTL", 24*time.Hour),
		TileCacheMaxEntries: p.int("TILE_CACHE_MAX_ENTRIES", 2000),
		RequestTimeout:      p.duration("REQUEST_TIMEOUT", 15*time.Second),
		ShutdownTimeout:     p.duration("SHUTDOWN_TIMEOUT", 10*time.Second),
		AllowedOrigins:      splitCSV(p.str("ALLOWED_ORIGINS", "http://localhost:3000")),
	}

	if c.DataMode == DataModeLive && c.ReinfolibAPIKey == "" {
		p.fail("DATA_MODE=live requires REINFOLIB_API_KEY")
	}
	if c.UpstreamTimeout >= c.RequestTimeout {
		p.fail("UPSTREAM_TIMEOUT must be shorter than REQUEST_TIMEOUT")
	}
	return c, errors.Join(p.errs...)
}

// LogValue controls how Config appears in structured logs (no secrets).
func (c Config) LogValue() slog.Value {
	return slog.GroupValue(
		slog.String("env", c.Env),
		slog.String("port", c.Port),
		slog.String("log_format", c.LogFormat),
		slog.String("data_mode", string(c.DataMode)),
		slog.String("reinfolib_base_url", c.ReinfolibBaseURL),
		slog.Bool("reinfolib_api_key_set", c.ReinfolibAPIKey != ""),
		slog.Float64("reinfolib_rps", c.ReinfolibRPS),
		slog.Duration("upstream_timeout", c.UpstreamTimeout),
		slog.Duration("tile_cache_ttl", c.TileCacheTTL),
		slog.Any("allowed_origins", c.AllowedOrigins),
	)
}

// Secret is a string that refuses to print itself.
type Secret string

const redacted = "[REDACTED]"

func (s Secret) String() string                { return redacted }
func (s Secret) GoString() string              { return redacted }
func (s Secret) LogValue() slog.Value          { return slog.StringValue(redacted) }
func (s Secret) MarshalText() ([]byte, error)  { return []byte(redacted), nil }
func (s Secret) Reveal() string                { return string(s) }
func (s Secret) Format(f fmt.State, verb rune) { _, _ = f.Write([]byte(redacted)) }

type parser struct {
	getenv func(string) string
	errs   []error
}

func (p *parser) fail(format string, args ...any) {
	p.errs = append(p.errs, fmt.Errorf(format, args...))
}

func (p *parser) str(key, def string) string {
	if v := strings.TrimSpace(p.getenv(key)); v != "" {
		return v
	}
	return def
}

func (p *parser) oneOf(key, def string, allowed ...string) string {
	v := p.str(key, def)
	for _, a := range allowed {
		if v == a {
			return v
		}
	}
	p.fail("%s: %q is not one of %v", key, v, allowed)
	return def
}

func (p *parser) duration(key string, def time.Duration) time.Duration {
	raw := p.str(key, "")
	if raw == "" {
		return def
	}
	d, err := time.ParseDuration(raw)
	if err != nil || d <= 0 {
		p.fail("%s: want a positive duration like 5s, got %q", key, raw)
		return def
	}
	return d
}

func (p *parser) int(key string, def int) int {
	raw := p.str(key, "")
	if raw == "" {
		return def
	}
	n, err := strconv.Atoi(raw)
	if err != nil || n < 0 {
		p.fail("%s: want a non-negative integer, got %q", key, raw)
		return def
	}
	return n
}

func (p *parser) float(key string, def float64) float64 {
	raw := p.str(key, "")
	if raw == "" {
		return def
	}
	f, err := strconv.ParseFloat(raw, 64)
	if err != nil || f < 0 {
		p.fail("%s: want a non-negative number, got %q", key, raw)
		return def
	}
	return f
}

func (p *parser) level(key string, def slog.Level) slog.Level {
	raw := p.str(key, "")
	if raw == "" {
		return def
	}
	var l slog.Level
	if err := l.UnmarshalText([]byte(raw)); err != nil {
		p.fail("%s: want debug|info|warn|error, got %q", key, raw)
		return def
	}
	return l
}

func splitCSV(s string) []string {
	var out []string
	for _, part := range strings.Split(s, ",") {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}
