// Generates the place-search data from the Geolonia address data (CC BY 4.0):
//
//   public/data/municipality-names.json   English and Korean municipality names
//   public/data/towns/<prefecture>.json   towns with a reading and a centre point
//
//   node scripts/build-places.ts <path to latest.csv>
//
// latest.csv (52 MB) is not kept in the repository:
// https://github.com/geolonia/japanese-addresses/blob/master/data/latest.csv
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { toHangul, toRomaji } from "../geo/kana.ts";

const NAMES_OUTPUT = "public/data/municipality-names.json";
const TOWNS_OUTPUT = "public/data/towns";

// Romaji suffix → [katakana reading, Korean word]
const SUFFIXES: Record<string, [string, string]> = {
  SHI: ["シ", "시"],
  KU: ["ク", "구"],
  GUN: ["グン", "군"],
  CHO: ["チョウ", "정"],
  MACHI: ["マチ", "정"],
  MURA: ["ムラ", "촌"],
  SON: ["ソン", "촌"],
};
const CHOME = /[一二三四五六七八九十]+丁目$/;
const CHOME_KANA = / \d+$/;

type Names = [en: string, ko: string];
type TownSum = { kana: string; lat: number; lon: number; count: number };

function cells(line: string): string[] {
  return [...line.matchAll(/(?:"([^"]*)"|([^,]*))(?:,|$)/g)].map(
    (match) => match[1] ?? match[2] ?? "",
  );
}

function names(stemKana: string, suffix: string): Names {
  const romaji = toRomaji(stemKana);
  return [
    `${romaji[0].toUpperCase()}${romaji.slice(1)}-${suffix.toLowerCase()}`,
    toHangul(stemKana) + SUFFIXES[suffix][1],
  ];
}

function reads(stemKana: string, romaji: string): boolean {
  return stemKana !== "" && toRomaji(stemKana).toUpperCase() === romaji;
}

const path = process.argv[2];
if (path === undefined) {
  throw new Error("usage: node scripts/build-places.ts <latest.csv>");
}

const municipalities: Record<string, Names> = {};
const cities: Record<string, Names> = {};
// prefecture code → municipality code → town name → running sum
const prefectures = new Map<string, Map<string, Map<string, TownSum>>>();

// Fills `municipalities` and `cities` for one municipality. Throws when the
// katakana does not read as the published romaji, so a wrong name cannot ship.
function addNames(
  prefecture: string,
  code: string,
  name: string,
  kana: string,
  romaji: string,
) {
  const tokens = romaji.split(" ");
  const ownSuffix = tokens[tokens.length - 1];
  const body = kana.slice(0, -SUFFIXES[ownSuffix][0].length);

  if (tokens.length === 2) {
    if (!reads(body, tokens[0])) {
      throw new Error(`${code} ${name}: ${kana} is not ${romaji}`);
    }
    municipalities[code] = names(body, ownSuffix);
    return;
  }

  // "ヨコハマシナカク" has no gap between the city and the ward, so the gap
  // is put where both halves read the same as the romaji.
  const [parentRomaji, parentSuffix, ownRomaji] = tokens;
  const parentEnd = SUFFIXES[parentSuffix][0];
  for (let i = 1; i < body.length; i++) {
    const parent = body.slice(0, i);
    const own = body.slice(i + parentEnd.length);
    if (
      body.startsWith(parentEnd, i) &&
      reads(parent, parentRomaji) &&
      reads(own, ownRomaji)
    ) {
      municipalities[code] = names(own, ownSuffix);
      if (parentSuffix === "SHI") {
        const city = name.slice(0, name.indexOf("市") + 1);
        cities[prefecture + city] = names(parent, parentSuffix);
      }
      return;
    }
  }
  throw new Error(`${code} ${name}: ${kana} is not ${romaji}`);
}

// 一丁目, 二丁目 … of one town are folded into a single entry at the average
// of their points: a town is narrow enough to find a home on the map.
function addTown(
  prefectureCode: string,
  code: string,
  town: string,
  townKana: string,
  lat: string,
  lon: string,
) {
  const name = town.replace(CHOME, "");
  if (name === "" || lat === "" || lon === "") {
    return;
  }
  const inPrefecture = prefectures.get(prefectureCode) ?? new Map();
  prefectures.set(prefectureCode, inPrefecture);
  const towns: Map<string, TownSum> = inPrefecture.get(code) ?? new Map();
  inPrefecture.set(code, towns);

  const sum = towns.get(name);
  if (sum === undefined) {
    towns.set(name, {
      kana: CHOME.test(town) ? townKana.replace(CHOME_KANA, "") : townKana,
      lat: Number(lat),
      lon: Number(lon),
      count: 1,
    });
  } else {
    sum.lat += Number(lat);
    sum.lon += Number(lon);
    sum.count++;
  }
}

for (const line of readFileSync(path, "utf8").split("\n").slice(1)) {
  const row = cells(line);
  if (row.length < 14) {
    continue;
  }
  // Columns: prefecture code, name, kana, romaji; municipality code, name,
  // kana, romaji; town name, kana, romaji; 小字; latitude; longitude.
  const [prefectureCode, prefecture, , , code, name, kana, romaji] = row;
  if (!(code in municipalities)) {
    addNames(prefecture, code, name, kana, romaji);
  }
  addTown(prefectureCode, code, row[8], row[9], row[12], row[13]);
}

writeFileSync(NAMES_OUTPUT, JSON.stringify({ municipalities, cities }) + "\n");

mkdirSync(TOWNS_OUTPUT, { recursive: true });
let townCount = 0;
for (const [prefectureCode, inPrefecture] of prefectures) {
  const out: Record<string, [string, string, number, number][]> = {};
  for (const [code, towns] of inPrefecture) {
    out[code] = [...towns].map(([name, sum]) => [
      name,
      sum.kana,
      Number((sum.lat / sum.count).toFixed(5)),
      Number((sum.lon / sum.count).toFixed(5)),
    ]);
    townCount += towns.size;
  }
  writeFileSync(`${TOWNS_OUTPUT}/${prefectureCode}.json`, JSON.stringify(out) + "\n");
}

console.log(
  `${Object.keys(municipalities).length} municipalities, ` +
    `${Object.keys(cities).length} cities, ` +
    `${townCount} towns in ${prefectures.size} files`,
);
