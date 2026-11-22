// Name matching shared by the region and town search.
import { sameHanzi } from "./script.ts";

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
const PER_INITIAL = 588;
// Initial consonants people swap when writing Japanese in Hangul:
// ㅋ → ㄱ, ㅌ → ㄷ, and ㅆ, ㅉ, ㅊ → ㅈ.
const SAME_INITIAL: Record<number, number> = {
  15: 0,
  16: 3,
  10: 12,
  13: 12,
  14: 12,
};

// "Shin Juku", "ＳＨＩＮＪＵＫＵ" and "shinjuku" all compare equal, and so do
// 고마에 / 코마에, 하마마쓰 / 하마마츠 and 横浜 / 横滨 / 橫濱.
export function normalise(text: string): string {
  const plain = sameHanzi(
    text.normalize("NFKC").toLowerCase().replace(/[\s,-]/g, ""),
  );
  let out = "";
  for (const char of plain) {
    const code = char.charCodeAt(0);
    if (code < HANGUL_FIRST || code > HANGUL_LAST) {
      out += char;
      continue;
    }
    const offset = code - HANGUL_FIRST;
    const initial = Math.floor(offset / PER_INITIAL);
    out += String.fromCharCode(
      HANGUL_FIRST +
        (SAME_INITIAL[initial] ?? initial) * PER_INITIAL +
        (offset % PER_INITIAL),
    );
  }
  return out;
}

// Lower is better: the whole name, then a name that starts with the query,
// then a query that is a name plus more ("신주쿠구"), then a name that
// merely contains the query.
export const NO_MATCH = 4;

export function score(names: string[], q: string): number {
  let best = NO_MATCH;
  for (const name of names) {
    if (name === q) {
      return 0;
    }
    if (name.startsWith(q)) {
      best = Math.min(best, 1);
    } else if (name.length >= 2 && q.startsWith(name)) {
      best = Math.min(best, 2);
    } else if (name.includes(q)) {
      best = Math.min(best, 3);
    }
  }
  return best;
}
