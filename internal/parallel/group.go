// Package parallel is a minimal re-implementation of golang.org/x/sync/errgroup.
//
// Why re-implement it? It is ~60 lines, it is asked about in Go interviews,
// and writing it once makes WaitGroup, context cancellation and semaphores
// click. In a production code base you would simply import errgroup.
package parallel

import (
	"context"
	"sync"
)

// Group runs functions in goroutines and waits for all of them.
// The first non-nil error cancels the Group's context and is returned by Wait.
type Group struct {
	cancel  context.CancelCauseFunc
	wg      sync.WaitGroup
	sem     chan struct{}
	errOnce sync.Once
	err     error
}

// WithContext returns a Group and a context that is cancelled when any
// function returns an error or when Wait returns.
func WithContext(ctx context.Context) (*Group, context.Context) {
	ctx, cancel := context.WithCancelCause(ctx)
	return &Group{cancel: cancel}, ctx
}

// SetLimit caps the number of goroutines running at once. n <= 0 means no limit.
// It must be called before the first Go.
func (g *Group) SetLimit(n int) {
	if n <= 0 {
		g.sem = nil
		return
	}
	g.sem = make(chan struct{}, n) // a buffered channel is a counting semaphore
}

// Go runs f in a new goroutine. It blocks while the limit is reached.
func (g *Group) Go(f func() error) {
	if g.sem != nil {
		g.sem <- struct{}{}
	}
	g.wg.Add(1)
	go func() {
		defer func() {
			if g.sem != nil {
				<-g.sem
			}
			g.wg.Done()
		}()
		if err := f(); err != nil {
			g.errOnce.Do(func() {
				g.err = err
				if g.cancel != nil {
					g.cancel(err)
				}
			})
		}
	}()
}

// Wait blocks until every function has returned, then returns the first error.
func (g *Group) Wait() error {
	g.wg.Wait()
	if g.cancel != nil {
		g.cancel(g.err)
	}
	return g.err
}
