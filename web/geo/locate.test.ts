import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { decodeOutlines, outlineAt } from "./locate.ts";

// The real boundary file the page loads.
const topology = JSON.parse(
  readFileSync("public/data/municipalities-2021.topo.json", "utf8"),
);
const boundaries = topology.objects["N03-21_210101"].geometries;
const outlines = decodeOutlines(topology, boundaries);

function codeAt(lat: number, lon: number): string | null | undefined {
  return boundaries[outlineAt(outlines, lon, lat)]?.properties.N03_007;
}

test("outlineAt finds the municipality under a point", () => {
  const cases: { name: string; lat: number; lon: number; code: string }[] = [
    { name: "Tokyo Station", lat: 35.6812, lon: 139.7671, code: "13101" },
    { name: "Tokyo Metropolitan Government", lat: 35.6895, lon: 139.6917, code: "13104" },
    { name: "Komae City Hall", lat: 35.6348, lon: 139.5787, code: "13219" },
    { name: "Osaka Castle", lat: 34.6873, lon: 135.5262, code: "27128" },
    { name: "Sapporo Clock Tower", lat: 43.0626, lon: 141.3536, code: "01101" },
    { name: "Naha City Hall", lat: 26.2124, lon: 127.6792, code: "47201" },
  ];
  for (const c of cases) {
    assert.equal(codeAt(c.lat, c.lon), c.code, c.name);
  }
});

test("outlineAt finds nothing in the sea", () => {
  assert.equal(outlineAt(outlines, 141.5, 33.0), -1);
});
