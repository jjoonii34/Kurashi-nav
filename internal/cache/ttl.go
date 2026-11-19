// Package cache provides a small concurrency-safe in-memory TTL cache.
//
// It is deliberately simple (one mutex, arbitrary eviction when full).
// Replacing it with an LRU and measuring the difference with benchmarks is
// one of the follow-up exercises in docs/LEARNING.ko.md.
package cache

import (
	"sync"
	"time"
)

type entry[V any] struct {
	value     V
	expiresAt time.Time
}

// TTL is a map whose entries expire after a fixed duration.
// The zero value is not usable; call NewTTL.
type TTL[K comparable, V any] struct {
	mu    sync.Mutex
	items map[K]entry[V]
	ttl   time.Duration
	max   int
	now   func() time.Time // replaced in tests
}

// NewTTL returns a cache holding at most maxEntries items for ttl each.
func NewTTL[K comparable, V any](ttl time.Duration, maxEntries int) *TTL[K, V] {
	if maxEntries <= 0 {
		maxEntries = 1
	}
	return &TTL[K, V]{
		items: make(map[K]entry[V]),
		ttl:   ttl,
		max:   maxEntries,
		now:   time.Now,
	}
}

// Get returns the value for k if present and not expired.
func (c *TTL[K, V]) Get(k K) (V, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()

	e, ok := c.items[k]
	if !ok {
		var zero V
		return zero, false
	}
	if !c.now().Before(e.expiresAt) {
		delete(c.items, k)
		var zero V
		return zero, false
	}
	return e.value, true
}

// Set stores v under k, evicting entries if the cache is full.
func (c *TTL[K, V]) Set(k K, v V) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if _, exists := c.items[k]; !exists && len(c.items) >= c.max {
		c.evictLocked()
	}
	c.items[k] = entry[V]{value: v, expiresAt: c.now().Add(c.ttl)}
}

// Len returns the number of stored entries, including expired ones not yet swept.
func (c *TTL[K, V]) Len() int {
	c.mu.Lock()
	defer c.mu.Unlock()
	return len(c.items)
}

// evictLocked drops expired entries; if none expired it drops one arbitrary
// entry (Go map iteration order is random). Caller must hold c.mu.
func (c *TTL[K, V]) evictLocked() {
	now := c.now()
	for k, e := range c.items {
		if !now.Before(e.expiresAt) {
			delete(c.items, k)
		}
	}
	if len(c.items) < c.max {
		return
	}
	for k := range c.items {
		delete(c.items, k)
		return
	}
}
