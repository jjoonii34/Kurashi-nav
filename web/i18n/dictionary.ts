import type { Lang } from "./langs";

export type Dictionary = {
  languageLabel: string;
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
};

// Record<Lang, Dictionary> makes a missing language or key a compile error.
const dictionaries: Record<Lang, Dictionary> = {
  en: {
    languageLabel: "Language",
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
  },
  ko: {
    languageLabel: "언어",
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
  },
  ja: {
    languageLabel: "ことば",
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
  },
};

export function dictionaryFor(lang: Lang): Dictionary {
  return dictionaries[lang];
}
