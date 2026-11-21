import type { Lang } from "./langs";

export type Dictionary = {
  tagline: string;
  languageLabel: string;
};

// Record<Lang, Dictionary> makes a missing language or key a compile error.
const dictionaries: Record<Lang, Dictionary> = {
  en: {
    tagline: "Should I sign this lease?",
    languageLabel: "Language",
  },
  ko: {
    tagline: "이 집, 계약해도 될까?",
    languageLabel: "언어",
  },
  ja: {
    tagline: "この へやを けいやく しても いいですか？",
    languageLabel: "ことば",
  },
};

export function dictionaryFor(lang: Lang): Dictionary {
  return dictionaries[lang];
}
