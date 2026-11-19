# ADR-0001: Standard library first

- Status: accepted
- Date: 2026-11-19

## Context

The service is small (three endpoints) and is also a learning project. Go
1.22+ added method and wildcard patterns to `net/http`'s ServeMux, and Go
1.21 added `log/slog`, which removes the usual reasons to pull in a router
or logging framework.

## Decision

Use only the standard library until a concrete need appears:

- Routing: `http.ServeMux` with `"POST /v1/housing/check"` patterns.
- Logging: `log/slog` (JSON in production, with Cloud Logging field names).
- Concurrency helpers (`internal/parallel`, `internal/ratelimit`): small
  re-implementations of `golang.org/x/sync/errgroup` and `x/time/rate`.

## Consequences

- No dependency updates or supply-chain surface; there is no `go.sum` yet.
- Hand-rolled helpers must be tested carefully (they are, including with `-race`).
- When a real need arrives (e.g. `sqlc` + `pgx` for PostgreSQL, OpenTelemetry),
  add the dependency and replace the hand-rolled helper with the
  `golang.org/x` original where one exists.
