import type { Lang } from "./langs";

export type Dictionary = {
  languageLabel: string;
  stepsLabel: string;
  tabMap: string;
  tabEstimate: string;
  tabResult: string;
  tabRoom: string;
  mapLabel: string;
  pickerTitle: string;
  confirmLocation: string;
  locate: string;
  locateFailed: string;
  locateOutside: string;
  estimateTitle: string;
  selectedLocation: string;
  noLocation: string;
  chooseLocation: string;
  estimateIntro: string;
  groupMonthly: string;
  groupContract: string;
  groupOther: string;
  groupMoveIn: string;
  glossRent: string;
  glossManagement: string;
  glossDeposit: string;
  glossKeyMoney: string;
  glossBrokerage: string;
  glossGuarantee: string;
  glossFireInsurance: string;
  glossKeyExchange: string;
  glossCleaning: string;
  glossMoveIn: string;
  prepayNextMonth: string;
  unitYen: string;
  unitMonths: string;
  errRent: string;
  errYen: string;
  errMonths: string;
  errGuarantee: string;
  seeResult: string;
  skipEstimate: string;
  resultTitle: string;
};

// Record<Lang, Dictionary> makes a missing language or key a compile error.
const dictionaries: Record<Lang, Dictionary> = {
  en: {
    languageLabel: "Language",
    stepsLabel: "Steps",
    tabMap: "Map",
    tabEstimate: "Estimate",
    tabResult: "Result",
    tabRoom: "Room size",
    mapLabel: "Map for choosing the location",
    pickerTitle: "Move the map to the home you plan to rent",
    confirmLocation: "Check this location",
    locate: "Move to my current location",
    locateFailed: "Couldn't get your current location. Move the map instead.",
    locateOutside:
      "Your current location is outside Japan. Move the map to a place in Japan.",
    estimateTitle: "Enter the estimate",
    selectedLocation: "Selected location",
    noLocation: "No location is selected yet.",
    chooseLocation: "Choose a location",
    estimateIntro:
      "Copy the numbers from the estimate (見積書) the agent gave you. Leave a box empty if it is not on your estimate.",
    groupMonthly: "Paid every month",
    groupContract: "Paid when you sign",
    groupOther: "Other costs",
    groupMoveIn: "Moving in",
    glossRent: "Rent",
    glossManagement: "Management fee",
    glossDeposit: "Deposit, partly returned when you leave",
    glossKeyMoney: "Key money, not returned",
    glossBrokerage: "Agent's fee, before tax",
    glossGuarantee: "Guarantor company's first fee, as a share of rent + management fee",
    glossFireInsurance: "Fire insurance",
    glossKeyExchange: "Lock change",
    glossCleaning: "Cleaning fee, if charged at signing",
    glossMoveIn: "Move-in date (optional)",
    prepayNextMonth: "I also pay next month's rent in advance",
    unitYen: "yen",
    unitMonths: "months",
    errRent: "Enter the rent as a whole number from 1 to 10,000,000 yen.",
    errYen: "Enter a whole number from 0 to 10,000,000 yen.",
    errMonths: "Enter a number from 0 to 12.",
    errGuarantee: "Enter a number from 0 to 200.",
    seeResult: "See the result",
    skipEstimate: "See the result without an estimate",
    resultTitle: "Result",
  },
  ko: {
    languageLabel: "언어",
    stepsLabel: "단계",
    tabMap: "지도",
    tabEstimate: "견적",
    tabResult: "결과",
    tabRoom: "방 크기",
    mapLabel: "위치를 고르는 지도",
    pickerTitle: "계약하려는 집 위치로 지도를 옮겨 주세요",
    confirmLocation: "이 위치 확인하기",
    locate: "현재 위치로 이동",
    locateFailed: "현재 위치를 가져오지 못했습니다. 지도를 직접 옮겨 주세요.",
    locateOutside:
      "현재 위치가 일본 밖입니다. 지도를 일본 안의 위치로 옮겨 주세요.",
    estimateTitle: "견적 입력",
    selectedLocation: "선택한 위치",
    noLocation: "아직 위치를 고르지 않았습니다.",
    chooseLocation: "위치 고르기",
    estimateIntro:
      "부동산에서 받은 견적서(見積書)의 숫자를 그대로 옮겨 적어 주세요. 견적서에 없는 칸은 비워 두세요.",
    groupMonthly: "매달 내는 돈",
    groupContract: "계약할 때 내는 돈",
    groupOther: "그 밖의 비용",
    groupMoveIn: "입주",
    glossRent: "월세",
    glossManagement: "관리비·공익비",
    glossDeposit: "보증금, 나갈 때 일부 돌려받음",
    glossKeyMoney: "사례금, 돌려받지 않음",
    glossBrokerage: "중개수수료, 세금 제외",
    glossGuarantee: "보증회사 첫 비용, 월세+관리비 대비",
    glossFireInsurance: "화재보험",
    glossKeyExchange: "열쇠 교체비",
    glossCleaning: "청소비, 계약 때 내는 경우",
    glossMoveIn: "입주일 (선택)",
    prepayNextMonth: "다음 달 월세도 미리 냅니다",
    unitYen: "엔",
    unitMonths: "개월",
    errRent: "월세를 1엔에서 10,000,000엔 사이의 정수로 입력해 주세요.",
    errYen: "0엔에서 10,000,000엔 사이의 정수로 입력해 주세요.",
    errMonths: "0에서 12 사이의 숫자로 입력해 주세요.",
    errGuarantee: "0에서 200 사이의 숫자로 입력해 주세요.",
    seeResult: "결과 보기",
    skipEstimate: "견적 없이 결과 보기",
    resultTitle: "결과",
  },
  ja: {
    languageLabel: "ことば",
    stepsLabel: "すすめかた",
    tabMap: "ちず",
    tabEstimate: "みつもり",
    tabResult: "けっか",
    tabRoom: "へやの ひろさ",
    mapLabel: "ばしょを えらぶ ちず",
    pickerTitle: "かりたい へやの ばしょに ちずを うごかして ください",
    confirmLocation: "この ばしょを しらべます",
    locate: "いまの ばしょに うごかします",
    locateFailed:
      "いまの ばしょが わかりませんでした。ちずを うごかして ください。",
    locateOutside:
      "いまの ばしょは にほんの そとです。にほんの なかの ばしょに ちずを うごかして ください。",
    estimateTitle: "みつもりを いれます",
    selectedLocation: "えらんだ ばしょ",
    noLocation: "まだ ばしょを えらんで いません。",
    chooseLocation: "ばしょを えらびます",
    estimateIntro:
      "ふどうさんやに もらった みつもりしょ（見積書）の すうじを そのまま いれて ください。みつもりしょに ない ところは なにも いれないで ください。",
    groupMonthly: "まいつき はらう おかね",
    groupContract: "けいやくの ときに はらう おかね",
    groupOther: "そのほかの おかね",
    groupMoveIn: "ひっこし",
    glossRent: "やちん",
    glossManagement: "かんりひ・きょうえきひ",
    glossDeposit: "しききん。でる ときに すこし もどります",
    glossKeyMoney: "れいきん。もどりません",
    glossBrokerage: "ちゅうかい てすうりょう。ぜいきんは いれません",
    glossGuarantee: "ほしょうがいしゃに はじめに はらう おかね。やちん＋かんりひの なんパーセントか",
    glossFireInsurance: "かさい ほけん",
    glossKeyExchange: "かぎを かえる おかね",
    glossCleaning: "そうじの おかね。けいやくの ときに はらう ばあい",
    glossMoveIn: "すみはじめる ひ（いれなくても いいです）",
    prepayNextMonth: "つぎの つきの やちんも さきに はらいます",
    unitYen: "えん",
    unitMonths: "かげつ",
    errRent: "やちんは 1えんから 10,000,000えんまでの すうじで いれて ください。",
    errYen: "0えんから 10,000,000えんまでの すうじで いれて ください。",
    errMonths: "0から 12までの すうじで いれて ください。",
    errGuarantee: "0から 200までの すうじで いれて ください。",
    seeResult: "けっかを みます",
    skipEstimate: "みつもりを いれないで けっかを みます",
    resultTitle: "けっか",
  },
};

export function dictionaryFor(lang: Lang): Dictionary {
  return dictionaries[lang];
}
