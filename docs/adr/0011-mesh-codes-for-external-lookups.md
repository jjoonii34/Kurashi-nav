# ADR-0011: Send mesh codes, not coordinates, to external APIs

- Status: proposed
- Date: 2026-11-22

## Context

Requirement R2 (`docs/requirements/v1.1-v1.2.md`) adds an earthquake
hazard lookup from the J-SHIS API, which accepts either a coordinate or a
地域メッシュ code (JIS X 0410). ADR-0002 forbids sending user input to third
parties, and the MLIT lookups already avoid it by requesting public map
tiles instead of the pin's coordinate.

Options:

- **Exact coordinate** — simplest call, but the pin leaves our server.
- **Mesh code** — the server converts the coordinate to the code of the
  cell that contains it; only the cell is sent, and it doubles as the cache key.
- **Rounded coordinate** — less precise than exact, but cells are not
  aligned with the data and cache keys are less stable.

Things to weigh: ADR-0002, cache hit rate, loss of precision at the chosen
mesh level, the cost of writing and testing the conversion (`internal/mesh`).

## Decision

TODO(human): choose an option and the mesh level, and state the reason.

## Consequences

TODO(human): what gets easier, what gets harder, and what precision the
result card can honestly claim.
