package cache

import (
	"fmt"
	"sync"
	"testing"
	"time"
)

type fakeClock struct{ t time.Time }

func (f *fakeClock) now() time.Time          { return f.t }
func (f *fakeClock) advance(d time.Duration) { f.t = f.t.Add(d) }

func TestTTL_Expiry(t *testing.T) {
	clk := &fakeClock{t: time.Date(2026, 4, 1, 0, 0, 0, 0, time.UTC)}
	c := NewTTL[string, int](time.Minute, 10)
	c.now = clk.now

	c.Set("a", 1)
	if v, ok := c.Get("a"); !ok || v != 1 {
		t.Fatalf("Get(a) = %v, %v; want 1, true", v, ok)
	}

	clk.advance(59 * time.Second)
	if _, ok := c.Get("a"); !ok {
		t.Fatal("entry expired too early")
	}

	clk.advance(time.Second)
	if _, ok := c.Get("a"); ok {
		t.Fatal("entry should have expired")
	}
	if c.Len() != 0 {
		t.Fatalf("expired entry not removed, Len = %d", c.Len())
	}
}

func TestTTL_MaxEntries(t *testing.T) {
	c := NewTTL[int, int](time.Hour, 3)
	for i := range 10 {
		c.Set(i, i)
	}
	if c.Len() > 3 {
		t.Fatalf("Len = %d, want <= 3", c.Len())
	}
	if v, ok := c.Get(9); !ok || v != 9 {
		t.Fatal("most recent entry must be present")
	}
}

func TestTTL_PrefersEvictingExpired(t *testing.T) {
	clk := &fakeClock{t: time.Unix(0, 0)}
	c := NewTTL[string, int](time.Minute, 2)
	c.now = clk.now

	c.Set("old", 1)
	clk.advance(2 * time.Minute)
	c.Set("fresh", 2)
	c.Set("new", 3) // full: "old" is expired and must be the one evicted

	if _, ok := c.Get("fresh"); !ok {
		t.Fatal("fresh entry was evicted instead of the expired one")
	}
}

// Run with: go test -race ./internal/cache
func TestTTL_ConcurrentAccess(t *testing.T) {
	c := NewTTL[string, int](time.Minute, 100)
	var wg sync.WaitGroup
	for g := range 8 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for i := range 1000 {
				k := fmt.Sprintf("%d-%d", g, i%50)
				c.Set(k, i)
				c.Get(k)
			}
		}()
	}
	wg.Wait()
}
