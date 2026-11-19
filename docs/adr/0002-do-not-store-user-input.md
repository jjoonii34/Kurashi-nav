# ADR-0002: Do not store or log user input

- Status: accepted
- Date: 2026-11-19

## Context

A housing check reveals where someone is about to live and roughly how much
they pay. Japan's Act on the Protection of Personal Information (APPI) can
apply to services offered to people in Japan even when operated from abroad.
Storing nothing is the simplest way to carry no risk.

## Decision

- Request bodies (coordinates, address, cost estimate) live only in memory for
  the duration of one request.
- Access logs record method, path, status and timing — never the query
  string, the body or the client IP. Layer-failure logs never include the point.
- Caches are keyed by **public map tile address** (`XKT026|15/29105/12903|…`),
  never by the user's coordinate. Many homes share a tile, so this also raises
  the hit rate.
- User input is never sent to third parties, including AI APIs.
- Responses carry `Cache-Control: no-store`.

## Consequences

- No history or "saved homes" feature without a new decision (and a privacy
  policy, consent flow and deletion path).
- Debugging relies on `request_id`, which a user can share from an error message.
- A test (`TestHousingCheck_OK`) asserts the coordinate and rent never appear in logs.
