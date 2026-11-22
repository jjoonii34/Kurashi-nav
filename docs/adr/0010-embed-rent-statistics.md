# ADR-0010: Embed rent statistics as static data

- Status: proposed
- Date: 2026-11-22

## Context

Requirement R1 (`docs/requirements/v1.1-data-gaps.md`) compares the user's
rent with the average private rent of the municipality. The source is the
住宅・土地統計調査, published through the e-Stat API and updated every five
years (latest: as of 2023-10-01).

Options:

- **Call e-Stat at request time** — always the published figure, but adds an
  external dependency and latency to every check, and the user's
  municipality would be sent to a third party.
- **Embed a generated table** — a tool (`cmd/gen-rent`) downloads the table
  once into `internal/rent/data/`, and the server reads it with `go:embed`.

Things to weigh: response time, a new runtime dependency, ADR-0002 (no user
input to third parties), a five-year update cycle, repository size.

## Decision

TODO(human): choose an option and state the reason in your own words.

## Consequences

TODO(human): what gets easier, what gets harder, and how the data is
refreshed when the next survey is published.
