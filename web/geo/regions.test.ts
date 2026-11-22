import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildRegions,
  searchRegions,
  type BoundaryProperties,
  type RegionNames,
} from "./regions.ts";

// The real boundary file the page loads, so the tests cover the data too.
const topology = JSON.parse(
  readFileSync("public/data/municipalities-2021.topo.json", "utf8"),
);
const records: BoundaryProperties[] = topology.objects[
  "N03-21_210101"
].geometries.map((g: { properties: BoundaryProperties }) => g.properties);
const names: RegionNames = JSON.parse(
  readFileSync("public/data/municipality-names.json", "utf8"),
);
const regions = buildRegions(records, names);

test("buildRegions makes prefectures, cities with wards, and municipalities", () => {
  const count = (kind: string) => regions.filter((r) => r.kind === kind).length;
  assert.equal(count("prefecture"), 47);
  assert.equal(count("city"), 20);
  assert.equal(count("municipality"), 1902);
});

test("buildRegions skips land that belongs to no municipality", () => {
  const used = new Set(
    regions.filter((r) => r.kind === "municipality").flatMap((r) => r.members),
  );
  records.forEach((record, index) => {
    assert.equal(used.has(index), record.N03_007 !== null, String(index));
  });
});

test("a city with wards is made of all its wards", () => {
  const yokohama = regions.find((r) => r.label === "神奈川県横浜市");
  assert.equal(yokohama?.members.length, 18);
  const tokyo = regions.find((r) => r.label === "東京都");
  assert.equal(tokyo?.members.length, 62);
});

test("searchRegions finds a region in any script", () => {
  const cases: { query: string; first: string }[] = [
    { query: "新宿", first: "東京都新宿区" },
    { query: "新宿区", first: "東京都新宿区" },
    { query: "東京都新宿区", first: "東京都新宿区" },
    { query: "shinjuku", first: "東京都新宿区" },
    { query: "ＳＨＩＮ ＪＵＫＵ", first: "東京都新宿区" },
    { query: "신주쿠", first: "東京都新宿区" },
    { query: "신주쿠구", first: "東京都新宿区" },
    { query: "東京", first: "東京都" },
    { query: "오사카", first: "大阪府" },
    { query: "yokohama", first: "神奈川県横浜市" },
    { query: "横浜市中区", first: "神奈川県横浜市中区" },
    { query: "狛江", first: "東京都狛江市" },
    { query: "那覇", first: "沖縄県那覇市" },
    { query: "横滨", first: "神奈川県横浜市" },
    { query: "橫濱市", first: "神奈川県横浜市" },
    { query: "涩谷区", first: "東京都渋谷区" },
    { query: "广岛", first: "広島県" },
    { query: "komae", first: "東京都狛江市" },
    { query: "Komae-shi", first: "東京都狛江市" },
    { query: "고마에", first: "東京都狛江市" },
    { query: "코마에시", first: "東京都狛江市" },
    { query: "hakone", first: "神奈川県足柄下郡箱根町" },
    { query: "하코네마치", first: "神奈川県足柄下郡箱根町" },
    { query: "하마마츠", first: "静岡県浜松市" },
    { query: "yokohama naka", first: "神奈川県横浜市中区" },
    { query: "요코하마 나카구", first: "神奈川県横浜市中区" },
  ];
  for (const c of cases) {
    assert.equal(searchRegions(regions, c.query)[0]?.label, c.first, c.query);
  }
});

test("searchRegions lists every ward that shares a name", () => {
  const found = searchRegions(regions, "中央区").map((r) => r.label);
  assert.ok(found.includes("東京都中央区"), found.join(","));
  assert.ok(found.length > 1);
  const korean = searchRegions(regions, "주오구").map((r) => r.label);
  assert.ok(korean.includes("東京都中央区"), korean.join(","));
  assert.ok(korean.length > 1);
});

test("searchRegions returns nothing for an empty or unknown query", () => {
  assert.deepEqual(searchRegions(regions, ""), []);
  assert.deepEqual(searchRegions(regions, "   "), []);
  assert.deepEqual(searchRegions(regions, "zzzz"), []);
});

test("searchRegions returns at most eight regions", () => {
  assert.equal(searchRegions(regions, "市").length, 8);
});

test("almost every municipality has an English and a Korean name", () => {
  const unnamed = regions.filter(
    (r) => r.kind !== "prefecture" && r.alias === undefined,
  );
  // Six villages in the Northern Territories and two others have no
  // addresses in the source data.
  assert.equal(unnamed.length, 8, unnamed.map((r) => r.label).join(","));
});
