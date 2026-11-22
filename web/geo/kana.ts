// Katakana readings → Hepburn romaji and Hangul, for the names of
// municipalities (scripts/build-names.ts) and towns (geo/towns.ts).
//
// Hangul follows the National Institute of Korean Language table for
// Japanese kana: k, t and ch are written differently at the start of a word
// (가, 다, 지) and inside it (카, 타, 치), ン and ッ become the final
// consonants ㄴ and ㅅ, and long vowels are not written.

type Sound = { romaji: string; start: string; inside: string };

// [kana, romaji, Hangul at the start of a word, Hangul inside a word]
const ROWS: [string, string, string, string][] = [
  ["ア イ ウ エ オ", "a i u e o", "아 이 우 에 오", "아 이 우 에 오"],
  ["カ キ ク ケ コ", "ka ki ku ke ko", "가 기 구 게 고", "카 키 쿠 케 코"],
  ["サ シ ス セ ソ", "sa shi su se so", "사 시 스 세 소", "사 시 스 세 소"],
  ["タ チ ツ テ ト", "ta chi tsu te to", "다 지 쓰 데 도", "타 치 쓰 테 토"],
  ["ナ ニ ヌ ネ ノ", "na ni nu ne no", "나 니 누 네 노", "나 니 누 네 노"],
  ["ハ ヒ フ ヘ ホ", "ha hi fu he ho", "하 히 후 헤 호", "하 히 후 헤 호"],
  ["マ ミ ム メ モ", "ma mi mu me mo", "마 미 무 메 모", "마 미 무 메 모"],
  ["ヤ ユ ヨ", "ya yu yo", "야 유 요", "야 유 요"],
  ["ラ リ ル レ ロ", "ra ri ru re ro", "라 리 루 레 로", "라 리 루 레 로"],
  ["ワ ヲ", "wa o", "와 오", "와 오"],
  ["ガ ギ グ ゲ ゴ", "ga gi gu ge go", "가 기 구 게 고", "가 기 구 게 고"],
  ["ザ ジ ズ ゼ ゾ", "za ji zu ze zo", "자 지 즈 제 조", "자 지 즈 제 조"],
  ["ダ ヂ ヅ デ ド", "da ji zu de do", "다 지 즈 데 도", "다 지 즈 데 도"],
  ["バ ビ ブ ベ ボ", "ba bi bu be bo", "바 비 부 베 보", "바 비 부 베 보"],
  ["パ ピ プ ペ ポ", "pa pi pu pe po", "파 피 푸 페 포", "파 피 푸 페 포"],
  ["キャ キュ キョ", "kya kyu kyo", "갸 규 교", "캬 큐 쿄"],
  ["ギャ ギュ ギョ", "gya gyu gyo", "갸 규 교", "갸 규 교"],
  ["シャ シュ ショ", "sha shu sho", "샤 슈 쇼", "샤 슈 쇼"],
  ["ジャ ジュ ジョ", "ja ju jo", "자 주 조", "자 주 조"],
  ["チャ チュ チョ", "cha chu cho", "자 주 조", "차 추 초"],
  ["ニャ ニュ ニョ", "nya nyu nyo", "냐 뉴 뇨", "냐 뉴 뇨"],
  ["ヒャ ヒュ ヒョ", "hya hyu hyo", "햐 휴 효", "햐 휴 효"],
  ["ビャ ビュ ビョ", "bya byu byo", "뱌 뷰 뵤", "뱌 뷰 뵤"],
  ["ピャ ピュ ピョ", "pya pyu pyo", "퍄 퓨 표", "퍄 퓨 표"],
  ["ミャ ミュ ミョ", "mya myu myo", "먀 뮤 묘", "먀 뮤 묘"],
  ["リャ リュ リョ", "rya ryu ryo", "랴 류 료", "랴 류 료"],
];

const SOUNDS = new Map<string, Sound>();
for (const [kana, romaji, start, inside] of ROWS) {
  const r = romaji.split(" ");
  const s = start.split(" ");
  const i = inside.split(" ");
  kana.split(" ").forEach((k, n) => {
    SOUNDS.set(k, { romaji: r[n], start: s[n], inside: i[n] });
  });
}

const VOWELS = "アイウエオ";
const HANGUL_BASE = 0xac00;
const FINAL_N = 4; // ㄴ
const FINAL_S = 19; // ㅅ

type Unit = { kana: string; sound: Sound } | { kana: "ン" | "ッ" };

function units(kana: string): Unit[] {
  const out: Unit[] = [];
  for (let i = 0; i < kana.length; i++) {
    const one = kana[i];
    if (one === "ン" || one === "ッ") {
      out.push({ kana: one });
      continue;
    }
    const two = kana.slice(i, i + 2);
    const pair = SOUNDS.get(two);
    if (pair !== undefined) {
      out.push({ kana: two, sound: pair });
      i++;
      continue;
    }
    const sound = SOUNDS.get(one);
    if (sound === undefined) {
      throw new Error(`kana: cannot read "${one}" in "${kana}"`);
    }
    out.push({ kana: one, sound });
  }
  return out;
}

// Marks each vowel kana that only lengthens the syllable before it: オウ,
// オオ, ウウ, and for `sameVowel` also アア, イイ, エエ. A syllable can be
// lengthened once, so in ゴオオ (bungo + ōno) the second オ is a new syllable.
function lengthening(list: Unit[], sameVowel: boolean): boolean[] {
  const marks: boolean[] = [];
  list.forEach((unit, index) => {
    const previous = list[index - 1];
    let mark = false;
    if (
      previous !== undefined &&
      "sound" in previous &&
      "sound" in unit &&
      VOWELS.includes(unit.kana) &&
      !marks[index - 1]
    ) {
      const before = previous.sound.romaji.slice(-1);
      const now = unit.sound.romaji;
      mark =
        (before === "o" && (now === "o" || now === "u")) ||
        (before === "u" && now === "u") ||
        (sameVowel && before === now);
    }
    marks.push(mark);
  });
  return marks;
}

// Hepburn the way Japan Post writes addresses: long o and u are not marked,
// ン is "m" before b, m and p, and ッ doubles the next consonant ("tch" for ch).
export function toRomaji(kana: string): string {
  const list = units(kana);
  const long = lengthening(list, false);
  let out = "";
  list.forEach((unit, index) => {
    const next = list[index + 1];
    const nextRomaji = next && "sound" in next ? next.sound.romaji : "";
    if (unit.kana === "ン") {
      out += /^[bmp]/.test(nextRomaji) ? "m" : "n";
    } else if (unit.kana === "ッ") {
      out += nextRomaji.startsWith("ch") ? "t" : nextRomaji.slice(0, 1);
    } else if ("sound" in unit && !long[index]) {
      out += unit.sound.romaji;
    }
  });
  return out;
}

function withFinal(text: string, final: number): string {
  const last = text.charCodeAt(text.length - 1) - HANGUL_BASE;
  if (text === "" || last < 0 || last % 28 !== 0) {
    throw new Error(`kana: nothing to attach a final consonant to in "${text}"`);
  }
  return text.slice(0, -1) + String.fromCharCode(HANGUL_BASE + last + final);
}

export function toHangul(kana: string): string {
  const list = units(kana);
  const long = lengthening(list, true);
  let out = "";
  list.forEach((unit, index) => {
    if (unit.kana === "ン") {
      out = withFinal(out, FINAL_N);
    } else if (unit.kana === "ッ") {
      out = withFinal(out, FINAL_S);
    } else if ("sound" in unit && !long[index]) {
      out += out === "" ? unit.sound.start : unit.sound.inside;
    }
  });
  return out;
}
