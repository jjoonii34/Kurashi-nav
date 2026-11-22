import assert from "node:assert/strict";
import { test } from "node:test";
import { clampToRoom, fits, footprint, type Rect } from "./placement.ts";

// 6畳 as the API returns it.
const room: Rect = { width: 2.7, depth: 3.6 };
const singleBed = { width_cm: 97, depth_cm: 195 };

test("footprint converts centimetres and swaps sides when rotated", () => {
  assert.deepEqual(footprint(singleBed, false), { width: 0.97, depth: 1.95 });
  assert.deepEqual(footprint(singleBed, true), { width: 1.95, depth: 0.97 });
});

test("fits compares each side with the room", () => {
  const cases: { name: string; item: Rect; want: boolean }[] = [
    { name: "smaller", item: { width: 1, depth: 2 }, want: true },
    { name: "exactly the room", item: { width: 2.7, depth: 3.6 }, want: true },
    { name: "too wide", item: { width: 2.8, depth: 1 }, want: false },
    { name: "too deep", item: { width: 1, depth: 3.7 }, want: false },
  ];
  for (const c of cases) {
    assert.equal(fits(c.item, room), c.want, c.name);
  }
});

test("clampToRoom keeps the whole item inside the walls", () => {
  const item: Rect = { width: 1, depth: 2 };
  // The centre may move 0.85 m sideways and 0.8 m front to back.
  const cases: {
    name: string;
    x: number;
    z: number;
    want: { x: number; z: number };
  }[] = [
    { name: "already inside", x: 0.5, z: -0.3, want: { x: 0.5, z: -0.3 } },
    { name: "past the right wall", x: 5, z: 0, want: { x: 0.85, z: 0 } },
    { name: "past the left wall", x: -5, z: 0, want: { x: -0.85, z: 0 } },
    { name: "past the far wall", x: 0, z: -9, want: { x: 0, z: -0.8 } },
    { name: "past a corner", x: 9, z: 9, want: { x: 0.85, z: 0.8 } },
  ];
  for (const c of cases) {
    const got = clampToRoom(c.x, c.z, item, room);
    assert.ok(Math.abs(got.x - c.want.x) < 1e-9, `${c.name}: x = ${got.x}`);
    assert.ok(Math.abs(got.z - c.want.z) < 1e-9, `${c.name}: z = ${got.z}`);
  }
});

test("clampToRoom centres an item wider than the room", () => {
  const got = clampToRoom(1, 1, { width: 3, depth: 1 }, room);
  assert.equal(got.x, 0);
  assert.equal(got.z, 1);
});
