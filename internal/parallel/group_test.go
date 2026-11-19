package parallel

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"
)

func TestGroup_AllSucceed(t *testing.T) {
	g, _ := WithContext(context.Background())
	var n atomic.Int64
	for range 10 {
		g.Go(func() error { n.Add(1); return nil })
	}
	if err := g.Wait(); err != nil {
		t.Fatalf("Wait() = %v, want nil", err)
	}
	if n.Load() != 10 {
		t.Fatalf("ran %d functions, want 10", n.Load())
	}
}

func TestGroup_FirstErrorCancelsContext(t *testing.T) {
	boom := errors.New("boom")
	g, ctx := WithContext(context.Background())

	g.Go(func() error { return boom })
	g.Go(func() error {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(5 * time.Second):
			return errors.New("context was not cancelled")
		}
	})

	if err := g.Wait(); !errors.Is(err, boom) {
		t.Fatalf("Wait() = %v, want boom", err)
	}
	if !errors.Is(context.Cause(ctx), boom) {
		t.Fatalf("context cause = %v, want boom", context.Cause(ctx))
	}
}

func TestGroup_SetLimit(t *testing.T) {
	const limit = 3
	g, _ := WithContext(context.Background())
	g.SetLimit(limit)

	var running, peak atomic.Int64
	for range 20 {
		g.Go(func() error {
			cur := running.Add(1)
			for {
				old := peak.Load()
				if cur <= old || peak.CompareAndSwap(old, cur) {
					break
				}
			}
			time.Sleep(5 * time.Millisecond)
			running.Add(-1)
			return nil
		})
	}
	if err := g.Wait(); err != nil {
		t.Fatal(err)
	}
	if peak.Load() > limit {
		t.Fatalf("peak concurrency %d exceeded limit %d", peak.Load(), limit)
	}
}
