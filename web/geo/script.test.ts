import assert from "node:assert/strict";
import { test } from "node:test";
import { nameIn, scriptOf, toChinese, type Script } from "./script.ts";

test("scriptOf tells which writing system a query is in", () => {
  const cases: { query: string; want: Script }[] = [
    { query: "신주쿠", want: "ko" },
    { query: "shinjuku", want: "en" },
    { query: "しんじゅく", want: "ja" },
    { query: "新宿", want: "ja" },
    { query: "横浜", want: "ja" },
    { query: "横滨", want: "zh-hans" },
    { query: "东京", want: "zh-hans" },
    { query: "橫濱", want: "zh-hant" },
    { query: "", want: "ja" },
  ];
  for (const c of cases) {
    assert.equal(scriptOf(c.query), c.want, c.query);
  }
});

test("toChinese rewrites the kanji and leaves kana alone", () => {
  assert.equal(toChinese("神奈川県横浜市", "zh-hans"), "神奈川县横滨市");
  assert.equal(toChinese("神奈川県横浜市", "zh-hant"), "神奈川縣橫濱市");
  assert.equal(toChinese("東京都渋谷区", "zh-hans"), "东京都涩谷区");
  assert.equal(toChinese("埼玉県さいたま市", "zh-hans"), "埼玉县さいたま市");
});

test("nameIn picks the name for the script of the query", () => {
  const alias = { en: "Shinjuku-ku", ko: "신주쿠구" };
  assert.equal(nameIn("ko", "東京都新宿区", alias), "신주쿠구");
  assert.equal(nameIn("en", "東京都新宿区", alias), "Shinjuku-ku");
  assert.equal(nameIn("ja", "東京都新宿区", alias), undefined);
  assert.equal(nameIn("zh-hans", "東京都新宿区", alias), "东京都新宿区");
  assert.equal(nameIn("ko", "東京都利島村", undefined), undefined);
  // 大阪府 is written the same way in Chinese.
  assert.equal(nameIn("zh-hans", "大阪府", undefined), undefined);
});
