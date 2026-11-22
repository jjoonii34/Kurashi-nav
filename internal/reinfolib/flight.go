package reinfolib

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/jjoonii34/kuramiru/internal/geo"
)

// tileFetchTimeout bounds a shared fetch, which no longer stops when the
// lookup that started it gives up.
const tileFetchTimeout = 10 * time.Second

// flight is one fetch in progress. feats and err may be read only after done
// is closed.
type flight struct {
	done  chan struct{}
	feats []geo.Feature
	err   error
}

// flights lets concurrent lookups of the same key share one fetch
// (the "singleflight" pattern). The zero value is ready to use.
type flights struct {
	mu       sync.Mutex
	inFlight map[string]*flight
}

// do returns the result of fetch for key, starting it only if no fetch for
// key is already running. Each caller stops waiting when its own ctx ends.
func (f *flights) do(ctx context.Context, key string, fetch func(context.Context) ([]geo.Feature, error)) ([]geo.Feature, error) {
	f.mu.Lock()
	fl, running := f.inFlight[key]
	if !running {
		fl = &flight{done: make(chan struct{})}
		if f.inFlight == nil {
			f.inFlight = make(map[string]*flight)
		}
		f.inFlight[key] = fl
		go f.run(ctx, key, fl, fetch)
	}
	f.mu.Unlock()

	select {
	case <-fl.done:
		return fl.feats, fl.err
	case <-ctx.Done():
		return nil, ctx.Err()
	}
}

func (f *flights) run(ctx context.Context, key string, fl *flight, fetch func(context.Context) ([]geo.Feature, error)) {
	// Detached from the first caller: if that client disconnects, the other
	// lookups waiting on this fetch must still get their result.
	ctx, cancel := context.WithTimeout(context.WithoutCancel(ctx), tileFetchTimeout)
	defer cancel()

	defer func() {
		// This goroutine is outside the HTTP recover middleware, so a panic
		// here would otherwise stop the whole server.
		if r := recover(); r != nil {
			fl.err = fmt.Errorf("reinfolib: tile fetch panicked: %v", r)
		}
		f.mu.Lock()
		delete(f.inFlight, key)
		f.mu.Unlock()
		close(fl.done)
	}()

	fl.feats, fl.err = fetch(ctx)
}
