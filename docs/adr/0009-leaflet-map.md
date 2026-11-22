# ADR-0009: Leaflet, used directly, for the location map

- Status: accepted
- Date: 2026-11-22

## Context

The first screen asks the user to choose the home's location on a map
(ADR-0005). The map shows 地理院タイル, which are raster (PNG) tiles, and one
pin. Nothing else is drawn on it in the MVP.

Options considered:

- **Leaflet** — small, built for raster tiles, a few lines for this use.
- **MapLibre GL** — WebGL engine for vector tiles, rotation and large data
  sets; much larger, and most of it would go unused here.
- **react-leaflet** on top of Leaflet — a React wrapper; one more dependency
  for a screen with a single map.

## Decision

- Use Leaflet 1.9 directly inside one client component
  (`web/components/LocationPicker.tsx`), created in a `useEffect` and removed
  in its cleanup. Leaflet reads `window` on load, so it is imported
  dynamically and never during the static build.
- The pin is not a Leaflet marker. It is fixed at the centre of the screen
  and the user moves the map under it; the location is the map centre when
  movement ends.
- Tiles are the GSI 淡色地図 (`pale`) layer, zoom 5–18, with the
  `地理院タイル` credit linked to the tile list page.
- Panning is limited to the same bounding box the API accepts
  (`web/geo/japan.ts` mirrors `internal/geo/point.go`).

## Consequences

- Two more npm packages: `leaflet` and `@types/leaflet`.
- The bounding box exists in two places and must be changed together.
- Place names on the map are Japanese only.
- Drawing hazard areas on the map later may justify MapLibre; that would be
  a new ADR.
