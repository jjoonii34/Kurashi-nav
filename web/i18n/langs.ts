export const LANGS = ["en", "ko", "ja"] as const;

export type Lang = (typeof LANGS)[number];

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  ko: "한국어",
  ja: "にほんご",
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export type ApiLang = "en" | "ko" | "ja-easy";

// The URL says "ja" (a real language tag, valid for <html lang>); the API
// names the same catalogue "ja-easy" because it serves simplified Japanese.
export function toApiLang(lang: Lang): ApiLang {
  return lang === "ja" ? "ja-easy" : lang;
}
