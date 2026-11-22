// Generates public/data/towns/<prefecture code>.json: the towns (大字・町)
// of every municipality with their katakana reading and a centre point,
// from the Geolonia address data (CC BY 4.0).
//
//   node scripts/build-towns.ts <path to latest.csv>
//
// 一丁目, 二丁目 … of one town are folded into a single entry at the average
// of their points: a town is narrow enough to find a home on the map.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const OUTPUT = "public/data/towns";
const CHOME = /[一二三四五六七八九十]+丁目$/;
const CHOME_KANA = / \d+$/;

type Sum = { kana: string; lat: number; lon: number; count: number };

function cells(line: string): string[] {
  return [...line.matchAll(/(?:"([^"]*)"|([^,]*))(?:,|$)/g)].map(
    (match) => match[1] ?? match[2] ?? "",
  );
}

const path = process.argv[2];
if (path === undefined) {
  throw new Error("usage: node scripts/build-towns.ts <latest.csv>");
}

// prefecture code → municipality code → town name → running sum
const prefectures = new Map<string, Map<string, Map<string, Sum>>>();

for (const line of readFileSync(path, "utf8").split("\n").slice(1)) {
  const row = cells(line);
  if (row.length < 14) {
    continue;
  }
  const lat = Number(row[12]);
  const lon = Number(row[13]);
  const name = row[8].replace(CHOME, "");
  if (name === "" || row[12] === "" || row[13] === "") {
    continue;
  }

  const municipalities = prefectures.get(row[0]) ?? new Map();
  prefectures.set(row[0], municipalities);
  const towns: Map<string, Sum> = municipalities.get(row[4]) ?? new Map();
  municipalities.set(row[4], towns);

  const sum = towns.get(name);
  if (sum === undefined) {
    towns.set(name, {
      kana: CHOME.test(row[8]) ? row[9].replace(CHOME_KANA, "") : row[9],
      lat,
      lon,
      count: 1,
    });
  } else {
    sum.lat += lat;
    sum.lon += lon;
    sum.count++;
  }
}

mkdirSync(OUTPUT, { recursive: true });
let total = 0;
for (const [prefecture, municipalities] of prefectures) {
  const out: Record<string, [string, string, number, number][]> = {};
  for (const [code, towns] of municipalities) {
    out[code] = [...towns].map(([name, sum]) => [
      name,
      sum.kana,
      Number((sum.lat / sum.count).toFixed(5)),
      Number((sum.lon / sum.count).toFixed(5)),
    ]);
    total += towns.size;
  }
  writeFileSync(`${OUTPUT}/${prefecture}.json`, JSON.stringify(out) + "\n");
}
console.log(`${total} towns in ${prefectures.size} files → ${OUTPUT}`);
