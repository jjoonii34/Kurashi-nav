// Package logging builds the application's slog.Logger.
//
// LOG_FORMAT=json emits the field names Google Cloud Logging understands
// ("severity", "message"), so logs are filtered by level in Cloud Run
// without any agent or extra library.
package logging

import (
	"io"
	"log/slog"
)

// New returns a text logger for local development or a JSON logger for production.
func New(w io.Writer, format string, level slog.Level) *slog.Logger {
	opts := &slog.HandlerOptions{Level: level}
	if format == "json" {
		opts.ReplaceAttr = cloudLoggingKeys
		return slog.New(slog.NewJSONHandler(w, opts))
	}
	return slog.New(slog.NewTextHandler(w, opts))
}

func cloudLoggingKeys(groups []string, a slog.Attr) slog.Attr {
	if len(groups) > 0 {
		return a
	}
	switch a.Key {
	case slog.MessageKey:
		a.Key = "message"
	case slog.LevelKey:
		a.Key = "severity"
		lvl, _ := a.Value.Any().(slog.Level)
		switch {
		case lvl >= slog.LevelError:
			a.Value = slog.StringValue("ERROR")
		case lvl >= slog.LevelWarn:
			a.Value = slog.StringValue("WARNING")
		case lvl >= slog.LevelInfo:
			a.Value = slog.StringValue("INFO")
		default:
			a.Value = slog.StringValue("DEBUG")
		}
	}
	return a
}
