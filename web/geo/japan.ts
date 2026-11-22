export type Point = { lat: number; lon: number };

// Same coarse box as internal/geo/point.go, so the map cannot offer a
// location the API would reject as outside Japan.
export const JAPAN_BOUNDS = {
  minLat: 20,
  maxLat: 46,
  minLon: 122,
  maxLon: 154,
} as const;

export const TOKYO_STATION: Point = { lat: 35.681236, lon: 139.767125 };

export function isInJapan(p: Point): boolean {
  return (
    p.lat >= JAPAN_BOUNDS.minLat &&
    p.lat <= JAPAN_BOUNDS.maxLat &&
    p.lon >= JAPAN_BOUNDS.minLon &&
    p.lon <= JAPAN_BOUNDS.maxLon
  );
}
