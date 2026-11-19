package ratelimit

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestNilLimiterIsUnlimited(t *testing.T) {
	var l *Limiter = New(0, 0)
	for range 1000 {
		if err := l.Wait(context.Background()); err != nil {
			t.Fatal(err)
		}
	}
}

func TestBurstIsImmediate(t *testing.T) {
	l := New(0.001, 5) // practically no refill
	start := time.Now()
	for range 5 {
		if err := l.Wait(context.Background()); err != nil {
			t.Fatal(err)
		}
	}
	if time.Since(start) > 100*time.Millisecond {
		t.Fatal("burst requests should not wait")
	}
}

func TestWaitRespectsDeadline(t *testing.T) {
	l := New(0.001, 1)
	_ = l.Wait(context.Background()) // drain the only token

	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()
	start := time.Now()
	err := l.Wait(ctx)
	if !errors.Is(err, context.DeadlineExceeded) {
		t.Fatalf("Wait() = %v, want DeadlineExceeded", err)
	}
	if time.Since(start) > 40*time.Millisecond {
		t.Fatal("should fail fast when the next token is beyond the deadline")
	}
}

func TestRefill(t *testing.T) {
	clk := time.Unix(0, 0)
	l := New(2, 1) // 2 tokens/s
	l.now = func() time.Time { return clk }

	if _, ok := l.reserve(); !ok {
		t.Fatal("first reserve should succeed")
	}
	if d, ok := l.reserve(); ok || d != 500*time.Millisecond {
		t.Fatalf("reserve() = %v, %v; want 500ms, false", d, ok)
	}
	clk = clk.Add(500 * time.Millisecond)
	if _, ok := l.reserve(); !ok {
		t.Fatal("token should be refilled after 500ms")
	}
}
