package reinfolib

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"testing"
	"testing/synctest"
	"time"

	"github.com/jjoonii34/kuramiru/internal/geo"
	"github.com/jjoonii34/kuramiru/internal/housing"
)

// These tests run inside synctest bubbles: synctest.Wait returns once every
// goroutine is blocked, and time is fake, so nothing sleeps or depends on
// scheduling luck.

var oneFeature = []geo.Feature{{Properties: map[string]any{"id": "tile"}}}

// blockingFetch counts calls and waits for release before answering.
func blockingFetch(calls *atomic.Int64, release <-chan struct{}) func(context.Context) ([]geo.Feature, error) {
	return func(context.Context) ([]geo.Feature, error) {
		calls.Add(1)
		<-release
		return oneFeature, nil
	}
}

func TestFlights_ConcurrentCallersShareOneFetch(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		var calls atomic.Int64
		release := make(chan struct{})

		const callers = 10
		errs := make([]error, callers)
		got := make([][]geo.Feature, callers)
		var wg sync.WaitGroup
		for i := range callers {
			wg.Go(func() {
				got[i], errs[i] = f.do(context.Background(), "tile", blockingFetch(&calls, release))
			})
		}

		synctest.Wait() // all ten are waiting; the fetch is blocked on release
		if n := calls.Load(); n != 1 {
			t.Fatalf("fetch ran %d times while %d callers waited, want 1", n, callers)
		}

		close(release)
		wg.Wait()
		for i := range callers {
			if errs[i] != nil || len(got[i]) != 1 {
				t.Errorf("caller %d: got %v, %v", i, got[i], errs[i])
			}
		}
	})
}

func TestFlights_DifferentKeysFetchSeparately(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		var calls atomic.Int64
		release := make(chan struct{})

		var wg sync.WaitGroup
		for _, key := range []string{"a", "b"} {
			wg.Go(func() {
				if _, err := f.do(context.Background(), key, blockingFetch(&calls, release)); err != nil {
					t.Error(err)
				}
			})
		}

		synctest.Wait()
		if n := calls.Load(); n != 2 {
			t.Errorf("fetch ran %d times for two keys, want 2", n)
		}
		close(release)
		wg.Wait()
	})
}

// The caller that started the fetch leaves; the one still waiting gets the result.
func TestFlights_FirstCallerCancelling(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		var calls atomic.Int64
		release := make(chan struct{})

		firstCtx, cancelFirst := context.WithCancel(context.Background())
		firstDone := make(chan error, 1)
		go func() {
			_, err := f.do(firstCtx, "tile", blockingFetch(&calls, release))
			firstDone <- err
		}()
		synctest.Wait()

		var second []geo.Feature
		var secondErr error
		var wg sync.WaitGroup
		wg.Go(func() {
			second, secondErr = f.do(context.Background(), "tile", blockingFetch(&calls, release))
		})
		synctest.Wait()

		// The fetch is still blocked, so the first caller can only return
		// here because its own context ended.
		cancelFirst()
		if err := <-firstDone; !errors.Is(err, context.Canceled) {
			t.Errorf("first caller: err = %v, want context.Canceled", err)
		}

		close(release)
		wg.Wait()
		if secondErr != nil || len(second) != 1 {
			t.Errorf("second caller: got %v, %v; want the fetched tile", second, secondErr)
		}
		if n := calls.Load(); n != 1 {
			t.Errorf("fetch ran %d times, want 1", n)
		}
	})
}

func TestFlights_ErrorIsSharedButNotRemembered(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		var calls atomic.Int64
		release := make(chan struct{})
		upstream := errors.New("upstream 503")
		failing := func(context.Context) ([]geo.Feature, error) {
			calls.Add(1)
			<-release
			return nil, upstream
		}

		errs := make([]error, 3)
		var wg sync.WaitGroup
		for i := range errs {
			wg.Go(func() { _, errs[i] = f.do(context.Background(), "tile", failing) })
		}
		synctest.Wait()
		close(release)
		wg.Wait()
		for i, err := range errs {
			if !errors.Is(err, upstream) {
				t.Errorf("caller %d: err = %v, want the upstream error", i, err)
			}
		}

		feats, err := f.do(context.Background(), "tile", func(context.Context) ([]geo.Feature, error) {
			calls.Add(1)
			return oneFeature, nil
		})
		if err != nil || len(feats) != 1 {
			t.Errorf("after a failure: got %v, %v; want a fresh fetch to succeed", feats, err)
		}
		if n := calls.Load(); n != 2 {
			t.Errorf("fetch ran %d times, want 2 (one failed, one retried)", n)
		}
	})
}

func TestFlights_PanicBecomesAnError(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		_, err := f.do(context.Background(), "tile", func(context.Context) ([]geo.Feature, error) {
			panic("boom")
		})
		if err == nil || !strings.Contains(err.Error(), "panicked") {
			t.Fatalf("err = %v, want a panic turned into an error", err)
		}

		feats, err := f.do(context.Background(), "tile", func(context.Context) ([]geo.Feature, error) {
			return oneFeature, nil
		})
		if err != nil || len(feats) != 1 {
			t.Errorf("after a panic: got %v, %v; want the key to be usable again", feats, err)
		}
	})
}

func TestFlights_FetchIsCutOffAfterTimeout(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var f flights
		start := time.Now()
		_, err := f.do(context.Background(), "tile", func(ctx context.Context) ([]geo.Feature, error) {
			<-ctx.Done() // an upstream that never answers
			return nil, ctx.Err()
		})
		if !errors.Is(err, context.DeadlineExceeded) {
			t.Errorf("err = %v, want context.DeadlineExceeded", err)
		}
		if elapsed := time.Since(start); elapsed != tileFetchTimeout {
			t.Errorf("gave up after %v, want %v", elapsed, tileFetchTimeout)
		}
	})
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) { return f(r) }

// End to end through LayerSource, with the network replaced by a transport
// that holds every request until release is closed.
func TestLookup_ConcurrentColdLookupsCallTheAPIOnce(t *testing.T) {
	synctest.Test(t, func(t *testing.T) {
		var calls atomic.Int64
		release := make(chan struct{})
		transport := roundTripFunc(func(*http.Request) (*http.Response, error) {
			calls.Add(1)
			<-release
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(zoningTile)),
			}, nil
		})
		client := NewClient(ClientConfig{
			BaseURL:    "http://mlit.invalid",
			APIKey:     "test-key",
			HTTPClient: &http.Client{Transport: transport},
		})
		src := NewLayerSource(client, DefaultEndpoints(), time.Hour, 100)

		const lookups = 5
		results := make([]housing.LayerResult, lookups)
		errs := make([]error, lookups)
		var wg sync.WaitGroup
		for i := range lookups {
			wg.Go(func() {
				results[i], errs[i] = src.Lookup(context.Background(), housing.LayerZoning, tokyoStation)
			})
		}

		synctest.Wait()
		if n := calls.Load(); n != 1 {
			t.Fatalf("API called %d times for %d concurrent lookups of one tile, want 1", n, lookups)
		}
		close(release)
		wg.Wait()

		for i := range lookups {
			if errs[i] != nil || !results[i].Hit {
				t.Errorf("lookup %d: got %+v, %v", i, results[i], errs[i])
			}
		}
		if _, err := src.Lookup(context.Background(), housing.LayerZoning, tokyoStation); err != nil {
			t.Fatal(err)
		}
		if n := calls.Load(); n != 1 {
			t.Errorf("API called %d times, want 1 (the later lookup is a cache hit)", n)
		}
	})
}
