# ADR-0005: Map pin first; geocoding is pluggable

- Status: accepted
- Date: 2026-11-19

## Context

Turning a Japanese address into a coordinate reliably is hard (丁目・番地・号,
old kanji, missing building numbers). The convenient GSI address-search
endpoint is not a published API and carries no availability guarantee.

## Decision

- The MVP frontend lets the user drop a pin on a map and sends `lat`/`lon`.
- `housing.Geocoder` is an interface. Today only `geocode.Static` (fixed
  entries, dev/test) exists. In live mode no geocoder is configured, and an
  address-only request returns `422 geocoding_unavailable`.
- A real geocoder built on the Digital Agency's Address Base Registry data is a
  later milestone and plugs in without touching the housing service.

## Consequences

- No dependency on an undocumented endpoint on the critical path.
- Slightly more effort for users (find the building on a map), which also
  makes them check the location visually.
