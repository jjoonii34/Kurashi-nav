import { toHangul, toRomaji } from "./kana.ts";
import { normalise, search } from "./match.ts";
import type { Alias } from "./script.ts";

// One town in public/data/towns/<prefecture code>.json.
export type TownRecord = [name: string, kana: string, lat: number, lon: number];

export type Town = {
  name: string;
  alias?: Alias;
  lat: number;
  lon: number;
  names: string[];
};

// A reading with something other than katakana (a lot number, a list of two
// towns) cannot be converted; that town is found by its Japanese name only.
function aliasFor(kana: string): Alias | undefined {
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
  return search(towns, query, (a, b) => a.name.length - b.name.length);
}
