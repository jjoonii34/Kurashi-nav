// Command api is the HTTP entry point of Kurashi Nav.
//
// Start reading the code base here. This file shows the whole application on
// one screen: configuration → dependency wiring → HTTP server → graceful shutdown.
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/config"
	"github.com/jjoonii34/kurashi-nav/internal/fakesource"
	"github.com/jjoonii34/kurashi-nav/internal/geocode"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
	"github.com/jjoonii34/kurashi-nav/internal/logging"
	"github.com/jjoonii34/kurashi-nav/internal/ratelimit"
	"github.com/jjoonii34/kurashi-nav/internal/reinfolib"
	"github.com/jjoonii34/kurashi-nav/internal/server"
	"github.com/jjoonii34/kurashi-nav/internal/source"
)

// version is overwritten at build time: -ldflags "-X main.version=v0.1.0".
var version = "dev"

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "fatal:", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}

	logger := logging.New(os.Stdout, cfg.LogFormat, cfg.LogLevel)
	slog.SetDefault(logger)
	logger.Info("starting", "version", version, "config", cfg)

	// ctx is cancelled on Ctrl+C locally and on SIGTERM in Cloud Run / Kubernetes.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	svc, sources, err := buildHousing(cfg, logger)
	if err != nil {
		return fmt.Errorf("build housing service: %w", err)
	}

	srv := &http.Server{
		Addr: net.JoinHostPort("", cfg.Port),
		Handler: server.New(server.Deps{
			Logger:         logger,
			Housing:        svc,
			Sources:        sources,
			AllowedOrigins: cfg.AllowedOrigins,
			RequestTimeout: cfg.RequestTimeout,
			Version:        version,
		}),
		// Without these, a slow client can hold connections open forever (Slowloris).
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      cfg.RequestTimeout + 5*time.Second,
		IdleTimeout:       60 * time.Second,
		ErrorLog:          slog.NewLogLogger(logger.Handler(), slog.LevelWarn),
	}

	serveErr := make(chan error, 1)
	go func() {
		logger.Info("listening", "addr", srv.Addr, "data_mode", cfg.DataMode)
		serveErr <- srv.ListenAndServe()
	}()

	select {
	case err := <-serveErr:
		// ListenAndServe only returns early on a real error (e.g. port in use).
		return fmt.Errorf("listen: %w", err)
	case <-ctx.Done():
		logger.Info("shutdown signal received; draining in-flight requests")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.ShutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("shutdown: %w", err)
	}
	if err := <-serveErr; err != nil && !errors.Is(err, http.ErrServerClosed) {
		return fmt.Errorf("listen: %w", err)
	}
	logger.Info("stopped cleanly")
	return nil
}

// buildHousing wires the housing service to either dummy data or the real
// MLIT API. This is the only place that knows about concrete adapters;
// the housing package itself depends on interfaces only.
func buildHousing(cfg config.Config, logger *slog.Logger) (*housing.Service, []source.Attribution, error) {
	var (
		layers   housing.LayerSource
		geocoder housing.Geocoder
		sourceID string
		sources  []source.Attribution
	)

	switch cfg.DataMode {
	case config.DataModeLive:
		client := reinfolib.NewClient(reinfolib.ClientConfig{
			BaseURL:   cfg.ReinfolibBaseURL,
			APIKey:    cfg.ReinfolibAPIKey.Reveal(),
			Limiter:   ratelimit.New(cfg.ReinfolibRPS, cfg.ReinfolibBurst),
			UserAgent: "kurashi-nav/" + version,
		})
		layers = reinfolib.NewLayerSource(client, reinfolib.DefaultEndpoints(), cfg.TileCacheTTL, cfg.TileCacheMaxEntries)
		// MVP: the frontend sends lat/lon from a map pin (docs/adr/0005).
		geocoder = nil
		sourceID = source.Reinfolib.ID
		sources = []source.Attribution{source.Reinfolib, source.GSITiles}
	default:
		layers = fakesource.NewDemo()
		geocoder = geocode.NewStatic(geocode.DemoEntries())
		sourceID = source.Dummy.ID
		sources = []source.Attribution{source.Dummy, source.GSITiles}
	}

	svc, err := housing.NewService(housing.Options{
		Layers:       housing.DefaultLayers(sourceID),
		Source:       layers,
		Geocoder:     geocoder,
		Attributions: sources,
		LayerTimeout: cfg.UpstreamTimeout,
		MaxParallel:  8,
		Logger:       logger,
	})
	return svc, sources, err
}
