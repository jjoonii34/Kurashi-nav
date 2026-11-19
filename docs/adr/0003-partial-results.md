# ADR-0003: Partial results over all-or-nothing

- Status: accepted
- Date: 2026-11-19

## Context

One report needs nine independent upstream lookups. Any of them can be slow
or fail. If the whole request fails whenever one layer fails, availability is
roughly the product of nine availabilities.

## Decision

- Look up all layers concurrently (`internal/parallel`, limited fan-out).
- Give each layer its own deadline (`UPSTREAM_TIMEOUT`, default 5s) inside the
  overall request deadline (`REQUEST_TIMEOUT`, default 15s).
- A failed layer becomes a section with `status: "unavailable"` and a
  localised message; the goroutine returns `nil` so siblings are not cancelled.
- The report sets `partial: true` so the frontend can say "some information is
  missing — check the official source".
- If the client disconnects or the whole request times out, return the
  context error instead of a report made only of failures.

## Consequences

- The UI must handle `unavailable` sections.
- Errors are data inside the report, so monitoring should count
  `layer lookup failed` log lines per layer.
