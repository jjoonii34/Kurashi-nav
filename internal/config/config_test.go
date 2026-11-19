package config

import (
	"bytes"
	"fmt"
	"log/slog"
	"strings"
	"testing"
	"time"
)

func envMap(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

func TestFromEnv_Defaults(t *testing.T) {
	c, err := FromEnv(envMap(nil))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.DataMode != DataModeFake {
		t.Errorf("DataMode = %q, want fake by default", c.DataMode)
	}
	if c.Port != "8080" {
		t.Errorf("Port = %q, want 8080", c.Port)
	}
	if c.UpstreamTimeout != 5*time.Second {
		t.Errorf("UpstreamTimeout = %v, want 5s", c.UpstreamTimeout)
	}
}

func TestFromEnv_Errors(t *testing.T) {
	tests := []struct {
		name    string
		env     map[string]string
		wantErr string
	}{
		{"live without key", map[string]string{"DATA_MODE": "live"}, "requires REINFOLIB_API_KEY"},
		{"unknown data mode", map[string]string{"DATA_MODE": "prod"}, "DATA_MODE"},
		{"bad duration", map[string]string{"UPSTREAM_TIMEOUT": "five"}, "UPSTREAM_TIMEOUT"},
		{"negative rps", map[string]string{"REINFOLIB_RPS": "-1"}, "REINFOLIB_RPS"},
		{"bad log level", map[string]string{"LOG_LEVEL": "loud"}, "LOG_LEVEL"},
		{"upstream >= request", map[string]string{"UPSTREAM_TIMEOUT": "20s", "REQUEST_TIMEOUT": "10s"}, "shorter than"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := FromEnv(envMap(tt.env))
			if err == nil || !strings.Contains(err.Error(), tt.wantErr) {
				t.Fatalf("err = %v, want it to contain %q", err, tt.wantErr)
			}
		})
	}
}

func TestFromEnv_Live(t *testing.T) {
	c, err := FromEnv(envMap(map[string]string{
		"DATA_MODE":         "live",
		"REINFOLIB_API_KEY": "  key-123  ",
		"ALLOWED_ORIGINS":   "https://a.example, https://b.example ,",
	}))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c.ReinfolibAPIKey.Reveal() != "key-123" {
		t.Errorf("key not trimmed")
	}
	if len(c.AllowedOrigins) != 2 {
		t.Errorf("AllowedOrigins = %v, want 2 entries", c.AllowedOrigins)
	}
}

// The API key must never appear in logs or formatted output.
func TestSecretNeverLeaks(t *testing.T) {
	const key = "super-secret-key"
	c, err := FromEnv(envMap(map[string]string{"DATA_MODE": "live", "REINFOLIB_API_KEY": key}))
	if err != nil {
		t.Fatal(err)
	}

	var buf bytes.Buffer
	slog.New(slog.NewJSONHandler(&buf, nil)).Info("cfg", "config", c, "key", c.ReinfolibAPIKey)
	slog.New(slog.NewTextHandler(&buf, nil)).Info("cfg", "config", c, "key", c.ReinfolibAPIKey)
	fmt.Fprintf(&buf, "%v %+v %#v %s", c, c, c, c.ReinfolibAPIKey)

	if strings.Contains(buf.String(), key) {
		t.Fatalf("secret leaked into output:\n%s", buf.String())
	}
}
