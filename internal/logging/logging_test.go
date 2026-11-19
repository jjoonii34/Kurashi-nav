package logging

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"testing"
)

func TestJSONUsesCloudLoggingKeys(t *testing.T) {
	var buf bytes.Buffer
	New(&buf, "json", slog.LevelDebug).Warn("tile fetch slow", "layer", "flood")

	var got map[string]any
	if err := json.Unmarshal(buf.Bytes(), &got); err != nil {
		t.Fatalf("not JSON: %v\n%s", err, buf.String())
	}
	if got["severity"] != "WARNING" {
		t.Errorf("severity = %v, want WARNING", got["severity"])
	}
	if got["message"] != "tile fetch slow" {
		t.Errorf("message = %v", got["message"])
	}
	if _, ok := got["level"]; ok {
		t.Errorf("unexpected raw 'level' key")
	}
}
