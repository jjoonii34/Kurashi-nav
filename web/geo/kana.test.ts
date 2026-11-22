import assert from "node:assert/strict";
import { test } from "node:test";
import { toHangul, toRomaji } from "./kana.ts";

test("toRomaji writes readings the way Japan Post does", () => {
  const cases: { kana: string; want: string }[] = [
    { kana: "シンジュク", want: "shinjuku" },
    { kana: "トウキョウ", want: "tokyo" },
    { kana: "オオサカ", want: "osaka" },
    { kana: "ニイガタ", want: "niigata" },
    { kana: "サッポロ", want: "sapporo" },
    { kana: "キタグンマ", want: "kitagumma" },
    { kana: "カンオンジ", want: "kanonji" },
    { kana: "ブンゴオオノ", want: "bungoono" },
  ];
  for (const c of cases) {
    assert.equal(toRomaji(c.kana), c.want, c.kana);
  }
});

test("toHangul follows the Korean rules for Japanese kana", () => {
  const cases: { kana: string; want: string }[] = [
    { kana: "トウキョウ", want: "도쿄" },
    { kana: "キョウト", want: "교토" },
    { kana: "チヨダ", want: "지요다" },
    { kana: "イチカワ", want: "이치카와" },
    { kana: "ハママツ", want: "하마마쓰" },
    { kana: "サッポロ", want: "삿포로" },
    { kana: "シンジュク", want: "신주쿠" },
    { kana: "カンオンジ", want: "간온지" },
    { kana: "ニイガタ", want: "니가타" },
    { kana: "キタキュウシュウ", want: "기타큐슈" },
    { kana: "ブンゴオオノ", want: "분고오노" },
  ];
  for (const c of cases) {
    assert.equal(toHangul(c.kana), c.want, c.kana);
  }
});

test("a reading with an unknown character is an error", () => {
  assert.throws(() => toRomaji("トウキョウA"));
  assert.throws(() => toHangul("ン"));
});
