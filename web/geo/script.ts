import {
  JAPANESE_TO_SIMPLIFIED,
  JAPANESE_TO_TRADITIONAL,
  SIMPLIFIED_ONLY,
  TRADITIONAL_ONLY,
} from "./hanzi.ts";

// The writing system a search was typed in. Results are shown in the same one.
export type Script = "ja" | "en" | "ko" | "zh-hans" | "zh-hant";

function pairs(text: string): Map<string, string> {
  const out = new Map<string, string>();
  for (let i = 0; i < text.length; i += 2) {
    out.set(text[i], text[i + 1]);
  }
  return out;
}

const SIMPLIFIED = pairs(JAPANESE_TO_SIMPLIFIED);
const TRADITIONAL = pairs(JAPANESE_TO_TRADITIONAL);
const FROM_TRADITIONAL = new Map(
  [...TRADITIONAL].map(([japanese, traditional]) => [traditional, japanese]),
);

// 新宿 is the same in Japanese and Chinese, so a kanji query counts as
// Chinese only when it has a form Japanese place names never use (滨, 濱).
export function scriptOf(query: string): Script {
  if (/[가-힣]/.test(query)) {
    return "ko";
  }
  if (/[぀-ヿ]/.test(query)) {
    return "ja";
  }
  for (const char of query) {
    if (SIMPLIFIED_ONLY.includes(char)) {
      return "zh-hans";
    }
    if (TRADITIONAL_ONLY.includes(char)) {
      return "zh-hant";
    }
  }
  return /[a-z]/i.test(query) ? "en" : "ja";
}

// A Japanese place name written with Chinese characters. Kana has no
// Chinese form and stays as it is.
export function toChinese(japanese: string, script: "zh-hans" | "zh-hant"): string {
  const table = script === "zh-hans" ? SIMPLIFIED : TRADITIONAL;
  return [...japanese].map((char) => table.get(char) ?? char).join("");
}

// 浜, 濱 and 滨 become the same character, so a name matches however the
// query writes it.
export function sameHanzi(text: string): string {
  let out = "";
  for (const char of text) {
    const japanese = FROM_TRADITIONAL.get(char) ?? char;
    out += SIMPLIFIED.get(japanese) ?? japanese;
  }
  return out;
}

// The name to show for a place: in the script of the query, or undefined
// when that is the Japanese name itself.
export function nameIn(
  script: Script,
  japanese: string,
  alias: { en: string; ko: string } | undefined,
): string | undefined {
  if (script === "ja") {
    return undefined;
  }
  if (script === "en" || script === "ko") {
    return alias?.[script];
  }
  const chinese = toChinese(japanese, script);
  return chinese === japanese ? undefined : chinese;
}
