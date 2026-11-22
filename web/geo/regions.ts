import { normalise, search } from "./match.ts";
import { PREFECTURE_ALIASES } from "./regionAliases.ts";
import type { Alias } from "./script.ts";

// One record of 国土数値情報 行政区域データ (N03).
export type BoundaryProperties = {
  N03_001: string; // prefecture
  N03_003: string | null; // county, or the city a ward belongs to
  N03_004: string | null; // municipality or ward
  N03_007: string | null; // 5-digit code; null for land not assigned to one
};

// public/data/municipality-names.json: [English, Korean] for a municipality
// (by code) and for a city with wards (by its Japanese label).
export type RegionNames = {
  municipalities: Record<string, [string, string]>;
  cities: Record<string, [string, string]>;
};

export type RegionKind = "prefecture" | "city" | "municipality";

// `members` are indexes into the boundary records: one for a municipality,
// many for a prefecture or a city with wards.
export type Region = {
  id: string;
  kind: RegionKind;
  label: string;
  code?: string; // municipalities only
  alias?: Alias;
  members: number[];
  names: string[];
};

const KIND_ORDER: Record<RegionKind, number> = {
  prefecture: 0,
  city: 1,
  municipality: 2,
};

// "Shinjuku-ku" → "Shinjuku", "신주쿠구" → "신주쿠".
function stems([en, ko]: [string, string]): [string, string] {
  return [en.slice(0, en.lastIndexOf("-")), ko.slice(0, -1)];
}

function region(
  id: string,
  kind: RegionKind,
  label: string,
  searchable: string[],
  alias: [string, string] | undefined,
): Region {
  const names = [label, ...searchable];
  if (alias) {
    names.push(...alias);
  }
  return {
    id,
    kind,
    label,
    alias: alias && { en: alias[0], ko: alias[1] },
    members: [],
    names: [...new Set(names.map(normalise))],
  };
}

export function buildRegions(
  records: BoundaryProperties[],
  regionNames: RegionNames,
): Region[] {
  const prefectures = new Map<string, Region>();
  const cities = new Map<string, Region>();
  const municipalities: Region[] = [];

  records.forEach((record, index) => {
    const { N03_001: prefecture, N03_003: parent, N03_004: name } = record;
    if (record.N03_007 === null || name === null) {
      return;
    }

    let pref = prefectures.get(prefecture);
    if (pref === undefined) {
      // "東京都" is also found as "東京".
      const short = prefecture.replace(/[都府県]$/, "");
      pref = region(
        `pref:${prefecture}`,
        "prefecture",
        prefecture,
        [short],
        PREFECTURE_ALIASES[prefecture],
      );
      prefectures.set(prefecture, pref);
    }
    pref.members.push(index);

    // `parent` is a county (郡) or, for a ward, its city. The city becomes a
    // region too.
    let cityNames: [string, string] | undefined;
    if (parent !== null && parent.endsWith("市")) {
      const cityKey = prefecture + parent;
      cityNames = regionNames.cities[cityKey];
      let city = cities.get(cityKey);
      if (city === undefined) {
        city = region(
          `city:${cityKey}`,
          "city",
          cityKey,
          cityNames ? [parent, ...stems(cityNames)] : [parent],
          cityNames,
        );
        cities.set(cityKey, city);
      }
      city.members.push(index);
    }

    const ownNames = regionNames.municipalities[record.N03_007];
    const searchable = [name, (parent ?? "") + name];
    let alias = ownNames;
    if (ownNames) {
      const [en, ko] = stems(ownNames);
      searchable.push(...ownNames, en, ko);
      if (cityNames) {
        // A ward is also found as "yokohama naka" and shown with its city.
        const [cityEn, cityKo] = stems(cityNames);
        searchable.push(
          cityEn + en,
          cityEn + ownNames[0],
          cityKo + ko,
          cityKo + ownNames[1],
        );
        alias = [
          `${ownNames[0]}, ${cityNames[0]}`,
          `${cityNames[1]} ${ownNames[1]}`,
        ];
      }
    }
    const own = region(
      `muni:${record.N03_007}`,
      "municipality",
      prefecture + (parent ?? "") + name,
      searchable,
      alias,
    );
    own.code = record.N03_007;
    own.members.push(index);
    municipalities.push(own);
  });

  return [...prefectures.values(), ...cities.values(), ...municipalities];
}

export function searchRegions(regions: Region[], query: string): Region[] {
  return search(
    regions,
    query,
    (a, b) =>
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.label.length - b.label.length,
  );
}

// The municipality drawn by one boundary record. Every municipality in the
// bundled file has exactly one record, so its first member identifies it.
export function municipalityAt(
  regions: Region[],
  boundaryIndex: number,
): Region | undefined {
  return regions.find(
    (r) => r.kind === "municipality" && r.members[0] === boundaryIndex,
  );
}
