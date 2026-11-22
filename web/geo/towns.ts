import { toHangul, toRomaji } from "./kana.ts";
import { NO_MATCH, normalise, score } from "./match.ts";

// One town in public/data/towns/<prefecture>.json (scripts/build-towns.ts).
export type TownRecord = [name: string, kana: string, lat: number, lon: number];

export type Town = {
  name: string;
  alias?: { en: string; ko: string };
  lat: number;
  lon: number;
  names: string[];
};

const MAX_RESULTS = 8;

// A reading with something other than katakana (a lot number, a list of two
// towns) cannot be converted; that town is found by its Japanese name only.
function aliasFor(kana: string): { en: string; ko: string } | undefined {
  if (kana === "") {
    return undefined;
  }
  try {
    const romaji = toRomaji(kana);
    return { en: romaji[0].toUpperCase() + romaji.slice(1), ko: toHangul(kana) };
  } catch {
    return undefined;
  }
}

export function buildTowns(records: TownRecord[]): Town[] {
  return records.map(([name, kana, lat, lon]) => {
    const alias = aliasFor(kana);
    const names = alias ? [name, alias.en, alias.ko] : [name];
    return { name, alias, lat, lon, names: names.map(normalise) };
  });
}

export function searchTowns(towns: Town[], query: string): Town[] {
  const q = normalise(query);
  if (q === "") {
    return [];
  }
  return towns
    .map((town) => ({ town, rank: score(town.names, q) }))
    .filter(({ rank }) => rank < NO_MATCH)
    .sort((a, b) => a.rank - b.rank || a.town.name.length - b.town.name.length)
    .slice(0, MAX_RESULTS)
    .map(({ town }) => town);
}
