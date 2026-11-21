import { isLang, type Lang } from "./langs";

const KEY = "lang";

// localStorage throws in private windows or when site data is blocked;
// remembering the language is a convenience, so both failures are ignored.
export function rememberLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {}
}

export function rememberedLang(): Lang | null {
  try {
    const value = localStorage.getItem(KEY);
    return value !== null && isLang(value) ? value : null;
  } catch {
    return null;
  }
}
