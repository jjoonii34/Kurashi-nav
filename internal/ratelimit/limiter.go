// Package ratelimit implements a token-bucket limiter.
//
// The MLIT API manual asks callers not to fire requests back-to-back and
// restricts clients that send too many in a short period. Every outgoing
// request waits on this limiter first.
// (golang.org/x/time/rate is the production-grade equivalent.)
package ratelimit

import (
	"context"
	"sync"
	"time"
)

// Limiter allows `burst` requests at once and refills at `rate` tokens per second.
// A nil *Limiter means "no limit".
type Limiter struct {
	mu     sync.Mutex
	rate   float64
	burst  float64
	tokens float64
	last   time.Time
	now    func() time.Time
}

// New returns a limiter, or nil (unlimited) when ratePerSec <= 0.
func New(ratePerSec float64, burst int) *Limiter {
	if ratePerSec <= 0 {
		return nil
	}
	if burst < 1 {
		burst = 1
	}
	return &Limiter{
		rate:   ratePerSec,
		burst:  float64(burst),
		tokens: float64(burst),
		now:    time.Now,
	}
}

// Wait blocks until a token is available or ctx is done.
func (l *Limiter) Wait(ctx context.Context) error {
	if l == nil {
		return ctx.Err()
	}
	for {
		delay, ok := l.reserve()
		if ok {
			return nil
		}
		// Fail fast if the deadline arrives before the token would.
		if deadline, has := ctx.Deadline(); has && time.Until(deadline) < delay {
			return context.DeadlineExceeded
		}
		timer := time.NewTimer(delay)
		select {
		case <-ctx.Done():
			timer.Stop()
			return ctx.Err()
		case <-timer.C:
		}
	}
}

// reserve takes a token if one is available; otherwise it reports how long
// until the next token.
func (l *Limiter) reserve() (time.Duration, bool) {
	l.mu.Lock()
	defer l.mu.Unlock()

	now := l.now()
	if !l.last.IsZero() {
		l.tokens = min(l.burst, l.tokens+now.Sub(l.last).Seconds()*l.rate)
	}
	l.last = now

	if l.tokens >= 1 {
		l.tokens--
		return 0, true
	}
	missing := 1 - l.tokens
	return time.Duration(missing / l.rate * float64(time.Second)), false
}
