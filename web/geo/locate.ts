import type {
  Feature,
  MultiPolygon as GeoMultiPolygon,
  Polygon as GeoPolygon,
} from "geojson";
import { feature } from "topojson-client";
import type { MultiPolygon, Polygon, Topology } from "topojson-specification";

// [lon, lat] rings of one boundary: polygons → rings → positions.
export type Outline = number[][][][];

// Turns every boundary into plain coordinates once, so finding the one under
// a tap does not decode the file again.
export function decodeOutlines(
  topology: Topology,
  boundaries: (Polygon | MultiPolygon)[],
): Outline[] {
  return boundaries.map((boundary) => {
    const { geometry } = feature(topology, boundary) as Feature<
      GeoPolygon | GeoMultiPolygon
    >;
    return geometry.type === "Polygon"
      ? [geometry.coordinates]
      : geometry.coordinates;
  });
}

// Ray casting: a point is inside a ring when a line going east from it
// crosses the ring an odd number of times.
function insideRing(ring: number[][], lon: number, lat: number): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[j];
    if (y1 > lat !== y2 > lat && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

// The first ring of a polygon is its edge; the others are holes in it.
function insideOutline(outline: Outline, lon: number, lat: number): boolean {
  return outline.some(
    ([edge, ...holes]) =>
      insideRing(edge, lon, lat) &&
      !holes.some((hole) => insideRing(hole, lon, lat)),
  );
}

// Index of the boundary that contains the point, or -1 (the sea, or outside
// Japan). Boundaries are simplified, so a point right on a border may land
// on the neighbour.
export function outlineAt(outlines: Outline[], lon: number, lat: number): number {
  return outlines.findIndex((outline) => insideOutline(outline, lon, lat));
}
