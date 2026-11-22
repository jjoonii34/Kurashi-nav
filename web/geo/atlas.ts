import type {
  GeometryCollection,
  MultiPolygon,
  Polygon,
  Topology,
} from "topojson-specification";
import { decodeOutlines, type Outline } from "./locate";
import {
  buildRegions,
  type BoundaryProperties,
  type Region,
  type RegionNames,
} from "./regions";
import { buildTowns, type Town, type TownRecord } from "./towns";

// Municipal boundaries as of 2021-01-01, simplified to 1% of the original
// points, and English and Korean names for the same municipalities. Both
// are served from our own origin, so nothing the user types leaves the page.
const BOUNDARIES_URL = "/data/municipalities-2021.topo.json";
const BOUNDARIES_OBJECT = "N03-21_210101";
const NAMES_URL = "/data/municipality-names.json";

// Both datasets ask for this credit wherever their names or shapes are shown.
export const PLACE_SOURCES = [
  {
    label: "国土数値情報（行政区域データ）を加工",
    url: "https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2021.html",
  },
  {
    label: "Geolonia 住所データ",
    url: "https://geolonia.github.io/japanese-addresses/",
  },
];

export type Boundary = (Polygon | MultiPolygon) & {
  properties: BoundaryProperties;
};
export type Atlas = {
  topology: Topology;
  boundaries: Boundary[];
  // Same order as `boundaries`.
  outlines: Outline[];
  regions: Region[];
};

async function load<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

let atlas: Promise<Atlas> | null = null;

// The boundary file is 1.5 MB, so it is fetched once, the first time a
// search box is focused or the map is tapped. A failed download is forgotten
// so the next try can work.
export function loadAtlas(): Promise<Atlas> {
  atlas ??= Promise.all([
    load<Topology>(BOUNDARIES_URL),
    load<RegionNames>(NAMES_URL),
  ])
    .then(([topology, names]) => {
      const collection = topology.objects[
        BOUNDARIES_OBJECT
      ] as GeometryCollection<BoundaryProperties>;
      const boundaries = collection.geometries as Boundary[];
      return {
        topology,
        boundaries,
        outlines: decodeOutlines(topology, boundaries),
        regions: buildRegions(
          boundaries.map((b) => b.properties),
          names,
        ),
      };
    })
    .catch((error: unknown) => {
      atlas = null;
      throw error;
    });
  return atlas;
}

const townFiles = new Map<string, Promise<Record<string, TownRecord[]>>>();

// Towns are split into one file per prefecture (the first two digits of the
// municipality code); a municipality with no file entry has no towns listed.
export async function loadTowns(code: string): Promise<Town[]> {
  const prefecture = code.slice(0, 2);
  let file = townFiles.get(prefecture);
  if (file === undefined) {
    file = load<Record<string, TownRecord[]>>(
      `/data/towns/${prefecture}.json`,
    ).catch((error: unknown) => {
      townFiles.delete(prefecture);
      throw error;
    });
    townFiles.set(prefecture, file);
  }
  return buildTowns((await file)[code] ?? []);
}
