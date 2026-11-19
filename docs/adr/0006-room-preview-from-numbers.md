# ADR-0006: 3D room preview from numbers, not from listing photos

- Status: accepted
- Date: 2026-11-19

## Context

Foreign residents struggle to picture "6畳" or "1LDK". One idea was to turn
listing photos into a 3D model. Three problems:

- **Copyright.** Listing photos can be copyrighted works in Japan. In February
  2024 the Tokyo District Court held that posting another company's rental
  listing photos without permission infringed reproduction and public
  transmission rights. A 3D reconstruction is a further adaptation (翻案).
  It also contradicts ADR-0004.
- **Not a gap.** Major portals already offer 3D / VR viewings for some listings
  (e.g. SUUMO with Matterport since 2018).
- **Scope.** Good reconstruction needs many overlapping photos and GPU
  inference — a Python/ML project, away from this service's Go backend focus
  and its core question ("should I sign?").

## Decision

- The backend exposes `GET /v1/room/size` and `GET /v1/room/layout`: unit
  conversions (畳 at the listing standard of 1.62㎡, ㎡, 평/坪, sq ft, regional
  tatami sizes), a suggested rectangle, a typical ceiling height, and
  reference furniture with typical dimensions.
- The frontend draws an empty, to-scale room and lets the user place furniture.
- Input is only what the user types from the listing (e.g. "洋室 6.0帖", "1LDK").
- Everything is labelled approximate; the floor plan is the authority.

## Consequences

- No copyright exposure, no GPU, no image storage.
- The preview is generic (a rectangle), not the actual apartment. A later
  version can accept the user's own width/depth measurements from the floor plan.
- 3D reconstruction from photos may still be explored, but as a separate
  experiment outside this product.
