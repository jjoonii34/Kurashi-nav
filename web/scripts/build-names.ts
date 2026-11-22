// Generates public/data/municipality-names.json: an English and a Korean
// name for every municipality, made from the katakana reading and Japan Post
// romaji in the Geolonia address data (CC BY 4.0).
//
//   node scripts/build-names.ts <path to latest.csv>
//
// latest.csv (52 MB) is not kept in the repository:
// https://github.com/geolonia/japanese-addresses/blob/master/data/latest.csv
import { readFileSync, writeFileSync } from "node:fs";
import { toHangul, toRomaji } from "../geo/kana.ts";

const OUTPUT = "public/data/municipality-names.json";

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

type Names = [en: string, ko: string];

function names(stemKana: string, suffix: string): Names {
  const romaji = toRomaji(stemKana);
  return [
    `${romaji[0].toUpperCase()}${romaji.slice(1)}-${suffix.toLowerCase()}`,
    toHangul(stemKana) + SUFFIXES[suffix][1],
  ];
}

function matches(stemKana: string, romaji: string): boolean {
  return stemKana !== "" && toRomaji(stemKana).toUpperCase() === romaji;
}

const path = process.argv[2];
if (path === undefined) {
  throw new Error("usage: node scripts/build-names.ts <latest.csv>");
}

const municipalities: Record<string, Names> = {};
const cities: Record<string, Names> = {};
const skipped: string[] = [];

for (const line of readFileSync(path, "utf8").split("\n").slice(1)) {
  // Columns 0-7 are always quoted: prefecture code, name, kana, romaji,
  // then municipality code, name, kana, romaji.
  const cells = line.match(/"[^"]*"/g)?.map((cell) => cell.slice(1, -1));
  if (cells === undefined || cells.length < 8) {
    continue;
  }
  const [, prefecture, , , code, name, kana, romaji] = cells;
  if (code in municipalities || skipped.includes(code)) {
    continue;
  }

  const tokens = romaji.split(" ");
  const ownSuffix = tokens[tokens.length - 1];
  const body = kana.slice(0, -SUFFIXES[ownSuffix][0].length);

  if (tokens.length === 2) {
    if (!matches(body, tokens[0])) {
      skipped.push(code);
      console.warn(`skipped ${code} ${name}: ${kana} is not ${romaji}`);
      continue;
    }
    municipalities[code] = names(body, ownSuffix);
    continue;
  }

  // "ヨコハマシナカク" has no gap between the city and the ward, so the gap
  // is put where both halves read the same as the romaji.
  const [parentRomaji, parentSuffix, ownRomaji] = tokens;
  const parentEnd = SUFFIXES[parentSuffix][0];
  let found = false;
  for (let i = 1; i < body.length && !found; i++) {
    const parent = body.slice(0, i);
    const own = body.slice(i + parentEnd.length);
    if (
      body.startsWith(parentEnd, i) &&
      matches(parent, parentRomaji) &&
      matches(own, ownRomaji)
    ) {
      found = true;
      municipalities[code] = names(own, ownSuffix);
      if (parentSuffix === "SHI") {
        const city = name.slice(0, name.indexOf("市") + 1);
        cities[prefecture + city] = names(parent, parentSuffix);
      }
    }
  }
  if (!found) {
    skipped.push(code);
    console.warn(`skipped ${code} ${name}: ${kana} is not ${romaji}`);
  }
}

writeFileSync(OUTPUT, JSON.stringify({ municipalities, cities }) + "\n");
console.log(
  `${Object.keys(municipalities).length} municipalities, ` +
    `${Object.keys(cities).length} cities, ${skipped.length} skipped → ${OUTPUT}`,
);
