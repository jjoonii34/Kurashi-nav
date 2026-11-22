import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { buildTowns, searchTowns, type TownRecord } from "./towns.ts";

// The real file the page loads for Tokyo; 13219 is 狛江市.
const tokyo: Record<string, TownRecord[]> = JSON.parse(
  readFileSync("public/data/towns/13.json", "utf8"),
);
const komae = buildTowns(tokyo["13219"]);

test("the bundled towns have 丁目 folded in, and buildTowns names them", () => {
  assert.equal(komae.filter((t) => t.name.includes("丁目")).length, 0);
  const town = komae.find((t) => t.name === "和泉本町");
  assert.deepEqual(town?.alias, { en: "Izumihoncho", ko: "이즈미혼초" });
  assert.ok(town.lat > 35.6 && town.lat < 35.7, String(town.lat));
  assert.ok(town.lon > 139.5 && town.lon < 139.6, String(town.lon));
});

test("searchTowns finds a town in any script", () => {
  const cases: { query: string; first: string }[] = [
    { query: "和泉本町", first: "和泉本町" },
    { query: "和泉", first: "和泉本町" },
    { query: "izumi", first: "和泉本町" },
    { query: "이즈미혼초", first: "和泉本町" },
    { query: "이즈미", first: "和泉本町" },
    { query: "inogata", first: "猪方" },
  ];
  for (const c of cases) {
    assert.equal(searchTowns(komae, c.query)[0]?.name, c.first, c.query);
  }
});

test("a town whose reading cannot be converted keeps its Japanese name", () => {
  const [town] = buildTowns([["穴明", "アナアケ22チワリ、アナアケ23チワリ", 39.3, 140.8]]);
  assert.equal(town.alias, undefined);
  assert.equal(searchTowns([town], "穴明")[0]?.name, "穴明");
});

test("searchTowns returns nothing for an empty or unknown query", () => {
  assert.deepEqual(searchTowns(komae, " "), []);
  assert.deepEqual(searchTowns(komae, "zzzz"), []);
});
