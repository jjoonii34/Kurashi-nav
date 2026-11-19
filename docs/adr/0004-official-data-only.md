# ADR-0004: Official data sources only — no scraping

- Status: accepted
- Date: 2026-11-19

## Context

Listing portals hold the richest housing data, but their terms forbid
automated collection, and even low-rate crawling of public sites has led to
legal trouble in Japan (the 2010 岡崎市立中央図書館事件). Government open data
covers what this service needs: hazards, zoning, school districts and
aggregated transaction prices.

## Decision

- Use published APIs and open data only, with the credit each requires
  (`docs/DATA_SOURCES.md`, `internal/source`).
- Never scrape listing portals. The user types the rent and fees from the
  estimate they were given.
- Respect upstream limits: token-bucket rate limiting and tile caching.
- Translations of government guidelines are labelled as unofficial and edited.

## Consequences

- Users enter a few numbers by hand; the cost form must make that quick.
- No listing search or price comparison against current listings.
- The service is not a real-estate brokerage and does not advertise properties.
