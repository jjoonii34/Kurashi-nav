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
  resultLoading: string;
  resultFailedNetwork: string;
  resultFailedInvalid: string;
  resultFailedServer: string;
  retry: string;
  partialNotice: string;
  cardHazards: string;
  cardArea: string;
  cardCost: string;
  chipInArea: string;
  chipNotInArea: string;
  chipUnavailable: string;
  noAreaData: string;
  noPriceData: string;
  priceMedian: string;
  priceRange: string;
  priceCount: string;
  pricePeriod: string;
  priceNote: string;
  noEstimate: string;
  sourcesTitle: string;
  lineBrokerage: string;
  lineGuarantee: string;
  lineCleaning: string;
  lineFirstMonth: string;
  lineProrated: string;
  lineNextMonth: string;
  lineOther: string;
  costTotal: string;
  costRentMonths: string;
  warnBrokerageOverCap: string;
  warnBrokerageAboveHalf: string;
  warnKeyMoneyHigh: string;
  warnOptionalFees: string;
  warnTotalHigh: string;
  roomTitle: string;
  roomIntro: string;
  roomSizeLabel: string;
  roomUnitLabel: string;
  roomShow: string;
  roomInvalid: string;
  roomLoading: string;
  unitPyeong: string;
  roomShape: string;
  roomSceneLabel: string;
  furnitureTitle: string;
  furnitureHint: string;
  furnitureTurn: string;
  furnitureRemove: string;
  furnitureTooBig: string;
  furnitureCannotTurn: string;
  homeTitle: string;
  homeLead: string;
  homeStart: string;
  homeRoomOnly: string;
  homeChecksTitle: string;
  homeHazardTitle: string;
  homeHazardBody: string;
  homeAreaTitle: string;
  homeAreaBody: string;
  homeCostTitle: string;
  homeCostBody: string;
  homeRoomTitle: string;
  homeRoomBody: string;
  homeStepsTitle: string;
  homeStep1: string;
  homeStep2: string;
  homeStep3: string;
  homeDisclaimer: string;
  homeOfficialTitle: string;
  homeOfficialBody: string;
  homeNoStoreTitle: string;
  homeNoStoreBody: string;
  homeLangsTitle: string;
  homeLangsBody: string;
  homeFreeTitle: string;
  homeFreeBody: string;
  tagline: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchNoResult: string;
  searchLoadFailed: string;
  searchTownPlaceholder: string;
  searchClear: string;
  homeWhere: string;
  homeStay: string;
  stayUnknown: string;
  stayMonths: string;
  stayYears: string;
  stayLong: string;
  costPerStayMonth: string;
  stayShortNote: string;
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
    resultLoading: "Checking official data for this location…",
    resultFailedNetwork:
      "Couldn't reach the server. Check your connection and try again.",
    resultFailedInvalid:
      "The server couldn't use this location or estimate. Go back and check what you entered.",
    resultFailedServer: "The server had a problem. Try again in a moment.",
    retry: "Try again",
    partialNotice:
      "Some data couldn't be loaded. Check the items marked “Couldn't check” on the official hazard map.",
    cardHazards: "Hazard areas",
    cardArea: "Around this home",
    cardCost: "Initial cost",
    chipInArea: "Inside the area",
    chipNotInArea: "Not in the area",
    chipUnavailable: "Couldn't check",
    noAreaData: "No data",
    noPriceData: "No nearby sales with a price and a size.",
    priceMedian: "Middle price per ㎡",
    priceRange: "Half of the sales fall in",
    priceCount: "Sales counted",
    pricePeriod: "Period",
    priceNote: "These are sale prices of nearby homes, not rents.",
    noEstimate: "No estimate was entered, so the initial cost was not calculated.",
    sourcesTitle: "Sources",
    lineBrokerage: "Agent's fee, tax included",
    lineGuarantee: "Guarantor company's first fee",
    lineCleaning: "Cleaning fee",
    lineFirstMonth: "First month's rent and management fee",
    lineProrated: "Rent for the days left in the first month",
    lineNextMonth: "Next month's rent, paid in advance",
    lineOther: "Other",
    costTotal: "Total",
    costRentMonths: "About {n} months of rent",
    warnBrokerageOverCap:
      "The agent's fee is above one month's rent plus tax, the legal maximum for a rental. Ask the agent to explain.",
    warnBrokerageAboveHalf:
      "For a home, the agent may charge you more than half a month's rent plus tax only if you agreed in advance. Check whether you gave that consent.",
    warnKeyMoneyHigh:
      "Key money (礼金) of two months or more is on the high side. It is not returned; it may be negotiable.",
    warnOptionalFees:
      "Extra items such as disinfection (消毒) or support services are often optional. Ask whether each one is required.",
    warnTotalHigh:
      "Initial costs above about six months of rent are high by a common rule of thumb. Compare with similar homes.",
    roomTitle: "Room size",
    roomIntro: "Enter the size printed on the listing to see how big the room is and whether your furniture fits.",
    roomSizeLabel: "Room size",
    roomUnitLabel: "Unit",
    roomShow: "Show",
    roomInvalid: "Enter a size greater than 0 that a room can have.",
    roomLoading: "Drawing the room…",
    unitPyeong: "pyeong / tsubo",
    roomShape: "Drawn as {w} m × {d} m. The real shape may differ.",
    roomSceneLabel: "3D view of the room with the furniture you placed",
    furnitureTitle: "Try furniture",
    furnitureHint: "Tap a piece of furniture below to place it, then drag it around the room.",
    furnitureTurn: "Turn 90°",
    furnitureRemove: "Remove",
    furnitureTooBig: "{name} is larger than this room.",
    furnitureCannotTurn: "There is no space to turn it in this room.",
    homeTitle: "Should I sign this lease?",
    homeLead: "Pick the home on the map and copy the numbers from the agent's estimate. You get the hazard areas, the neighbourhood rules and the initial cost, explained from Japan's official open data.",
    homeStart: "Pick the home on the map",
    homeRoomOnly: "Just check a room size",
    homeChecksTitle: "What you can check",
    homeHazardTitle: "Hazard areas",
    homeHazardBody: "Whether the home is inside a flood, storm surge, tsunami, landslide or liquefaction area.",
    homeAreaTitle: "Around the home",
    homeAreaBody: "The zoning of the land and the public elementary and junior high school districts.",
    homeCostTitle: "Initial cost",
    homeCostBody: "Adds up deposit, key money, agent's fee and the rest, and points out what to ask the agent.",
    homeRoomTitle: "Room size",
    homeRoomBody: "Turns 畳 into ㎡ and sq ft, draws the room in 3D and lets you try furniture in it.",
    homeStepsTitle: "How it goes",
    homeStep1: "Pick the home's location on the map",
    homeStep2: "Enter the numbers from the estimate, or skip this step",
    homeStep3: "Read the result",
    homeDisclaimer: "For reference only. This is not legal or real-estate advice. Always confirm with the official hazard map and the 重要事項説明 before you sign.",
    homeOfficialTitle: "Official data only",
    homeOfficialBody: "Open data published by Japan’s land ministry",
    homeNoStoreTitle: "Nothing is stored",
    homeNoStoreBody: "Your location and figures are discarded after the calculation",
    homeLangsTitle: "Four languages",
    homeLangsBody: "English · 한국어 · 日本語 · 中文",
    homeFreeTitle: "Free, no sign-up",
    homeFreeBody: "No account and no payment",
    tagline: "Check before you hanko.",
    searchLabel: "Go to a region",
    searchPlaceholder: "City, ward or town, e.g. Shinjuku, Komae",
    searchNoResult: "No city, ward, town or prefecture with that name.",
    searchLoadFailed: "Couldn't load the list of regions. Move the map by hand instead.",
    searchTownPlaceholder: "Town in this area, e.g. Izumihoncho",
    searchClear: "Clear the chosen area",
    homeWhere: "Where will you live?",
    homeStay: "For how long?",
    stayUnknown: "Not sure yet",
    stayMonths: "{n} months",
    stayYears: "{n} years",
    stayLong: "3 years or more",
    costPerStayMonth: "Spread over {n} months, the upfront cost is about {yen} a month on top of rent.",
    stayShortNote: "Leases usually run for two years. Before you sign, ask whether leaving early costs a fee (短期解約違約金).",
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
    resultLoading: "이 위치의 공공 데이터를 확인하고 있습니다…",
    resultFailedNetwork:
      "서버에 연결하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.",
    resultFailedInvalid:
      "서버가 이 위치나 견적을 처리하지 못했습니다. 돌아가서 입력한 내용을 확인해 주세요.",
    resultFailedServer: "서버에 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
    partialNotice:
      "일부 데이터를 불러오지 못했습니다. ‘확인 불가’로 표시된 항목은 지자체 공식 해저드맵에서 확인해 주세요.",
    cardHazards: "재해 위험 구역",
    cardArea: "이 집 주변",
    cardCost: "초기비용",
    chipInArea: "구역 안",
    chipNotInArea: "해당 없음",
    chipUnavailable: "확인 불가",
    noAreaData: "데이터 없음",
    noPriceData: "가격과 면적이 함께 있는 주변 거래가 없습니다.",
    priceMedian: "㎡당 가격 중앙값",
    priceRange: "거래의 절반이 속한 범위",
    priceCount: "집계한 거래 수",
    pricePeriod: "기간",
    priceNote: "주변 주택의 매매 가격입니다. 월세 시세가 아닙니다.",
    noEstimate: "견적을 입력하지 않아 초기비용은 계산하지 않았습니다.",
    sourcesTitle: "출처",
    lineBrokerage: "중개수수료, 세금 포함",
    lineGuarantee: "보증회사 첫 비용",
    lineCleaning: "청소비",
    lineFirstMonth: "첫 달 월세와 관리비",
    lineProrated: "첫 달 남은 날짜만큼의 월세",
    lineNextMonth: "미리 내는 다음 달 월세",
    lineOther: "기타",
    costTotal: "합계",
    costRentMonths: "월세 약 {n}개월분",
    warnBrokerageOverCap:
      "중개수수료가 임대 중개의 법정 상한인 ‘월세 1개월분 + 세금’보다 많습니다. 부동산에 이유를 물어보세요.",
    warnBrokerageAboveHalf:
      "주택 임대에서 중개수수료를 월세 반 달분(+세금)보다 많이 받으려면 사전에 동의를 받아야 합니다. 그런 동의를 했는지 확인해 보세요.",
    warnKeyMoneyHigh:
      "礼金(사례금)이 2개월분 이상이면 높은 편입니다. 돌려받지 못하는 돈이고, 협상할 수 있는 경우도 있습니다.",
    warnOptionalFees:
      "소독(消毒)이나 지원 서비스 같은 추가 항목은 선택 사항인 경우가 많습니다. 항목마다 꼭 필요한지 물어보세요.",
    warnTotalHigh:
      "초기비용이 월세 약 6개월분을 넘으면 흔히 높은 편으로 봅니다. 비슷한 집과 비교해 보세요.",
    roomTitle: "방 크기",
    roomIntro: "매물에 적힌 크기를 넣으면 방이 얼마나 넓은지, 가구가 들어가는지 볼 수 있습니다.",
    roomSizeLabel: "방 크기",
    roomUnitLabel: "단위",
    roomShow: "보기",
    roomInvalid: "0보다 크고 방으로 가능한 크기를 입력해 주세요.",
    roomLoading: "방을 그리고 있습니다…",
    unitPyeong: "평",
    roomShape: "가로 {w} m × 세로 {d} m로 그렸습니다. 실제 모양은 다를 수 있습니다.",
    roomSceneLabel: "놓은 가구가 보이는 방의 3D 화면",
    furnitureTitle: "가구 놓아 보기",
    furnitureHint: "아래에서 가구를 눌러 놓고, 방 안에서 끌어 옮겨 보세요.",
    furnitureTurn: "90° 돌리기",
    furnitureRemove: "빼기",
    furnitureTooBig: "{name}은(는) 이 방보다 큽니다.",
    furnitureCannotTurn: "이 방에서는 돌릴 공간이 없습니다.",
    homeTitle: "이 집, 계약해도 될까요?",
    homeLead: "지도에서 집 위치를 고르고 부동산이 준 견적서의 숫자를 넣어 보세요. 일본 공공 데이터로 재해 위험 구역과 주변 정보, 초기비용을 풀어서 보여 드립니다.",
    homeStart: "지도에서 집 위치 고르기",
    homeRoomOnly: "방 크기만 보기",
    homeChecksTitle: "확인할 수 있는 것",
    homeHazardTitle: "재해 위험 구역",
    homeHazardBody: "홍수·고조·쓰나미·토사재해·액상화 구역 안에 있는지 알려 드립니다.",
    homeAreaTitle: "이 집 주변",
    homeAreaBody: "땅의 용도지역과 공립 초등학교·중학교 학구를 보여 드립니다.",
    homeCostTitle: "초기비용",
    homeCostBody: "敷金·礼金·중개수수료 등을 합산하고, 부동산에 물어볼 점을 짚어 드립니다.",
    homeRoomTitle: "방 크기",
    homeRoomBody: "畳를 ㎡와 평으로 바꾸고, 방을 3D로 그려 가구를 놓아 볼 수 있습니다.",
    homeStepsTitle: "이렇게 진행됩니다",
    homeStep1: "지도에서 집 위치를 고릅니다",
    homeStep2: "견적서의 숫자를 넣습니다. 건너뛰어도 됩니다",
    homeStep3: "결과를 확인합니다",
    homeDisclaimer: "참고용 정보이며 법률·부동산 자문이 아닙니다. 계약 전에 반드시 지자체 공식 해저드맵과 重要事項説明으로 확인하세요.",
    homeOfficialTitle: "공공 데이터만",
    homeOfficialBody: "일본 국토교통성이 공개한 데이터",
    homeNoStoreTitle: "저장하지 않음",
    homeNoStoreBody: "위치와 금액은 계산 후 버립니다",
    homeLangsTitle: "4개 언어",
    homeLangsBody: "English · 한국어 · 日本語 · 中文",
    homeFreeTitle: "가입 없이 무료",
    homeFreeBody: "계정도 결제도 필요 없습니다",
    tagline: "도장 찍기 전에, 쿠라미루",
    searchLabel: "지역으로 이동",
    searchPlaceholder: "시·구·정·촌 이름 (예: 신주쿠, 고마에)",
    searchNoResult: "그 이름의 시구정촌이나 도도부현이 없습니다.",
    searchLoadFailed: "지역 목록을 불러오지 못했습니다. 지도를 직접 옮겨 주세요.",
    searchTownPlaceholder: "이 지역 안의 동 이름 (예: 이즈미혼초)",
    searchClear: "고른 지역 지우기",
    homeWhere: "어디에 살 예정인가요?",
    homeStay: "얼마나 살 예정인가요?",
    stayUnknown: "아직 모르겠어요",
    stayMonths: "{n}개월",
    stayYears: "{n}년",
    stayLong: "3년 이상",
    costPerStayMonth: "{n}개월 동안 나눠 보면, 초기 비용은 월세 외에 한 달 약 {yen}입니다.",
    stayShortNote: "임대 계약은 보통 2년입니다. 일찍 나가면 위약금(短期解約違約金)이 있는지 계약 전에 물어보세요.",
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
    resultLoading: "この ばしょの データを しらべて います…",
    resultFailedNetwork:
      "サーバーに つながりませんでした。インターネットを たしかめて、もういちど ためして ください。",
    resultFailedInvalid:
      "この ばしょ、または みつもりを しらべることが できませんでした。もどって、いれた ないようを たしかめて ください。",
    resultFailedServer:
      "サーバーで もんだいが おきました。すこし まってから、もういちど ためして ください。",
    retry: "もういちど ためします",
    partialNotice:
      "いくつかの データを よむことが できませんでした。「しらべられませんでした」と かいて ある ものは、しやくしょの ハザードマップで たしかめて ください。",
    cardHazards: "さいがいの きけんが ある ばしょ",
    cardArea: "この へやの まわり",
    cardCost: "はじめに はらう おかね",
    chipInArea: "はいって います",
    chipNotInArea: "はいって いません",
    chipUnavailable: "しらべられませんでした",
    noAreaData: "データが ありません",
    noPriceData: "ねだんと ひろさが わかる ちかくの とりひきが ありません。",
    priceMedian: "1㎡の ねだんの まんなか",
    priceRange: "とりひきの はんぶんが はいる はんい",
    priceCount: "かぞえた とりひきの かず",
    pricePeriod: "きかん",
    priceNote: "ちかくの いえを かった ときの ねだんです。やちんでは ありません。",
    noEstimate: "みつもりを いれなかったので、はじめに はらう おかねは けいさんして いません。",
    sourcesTitle: "データの でどころ",
    lineBrokerage: "ちゅうかい てすうりょう。ぜいきんを ふくみます",
    lineGuarantee: "ほしょうがいしゃに はじめに はらう おかね",
    lineCleaning: "そうじの おかね",
    lineFirstMonth: "さいしょの つきの やちんと かんりひ",
    lineProrated: "さいしょの つきの のこりの ひの やちん",
    lineNextMonth: "さきに はらう つぎの つきの やちん",
    lineOther: "そのほか",
    costTotal: "ぜんぶで",
    costRentMonths: "やちんの やく {n}かげつぶんです",
    warnBrokerageOverCap:
      "ちゅうかい てすうりょうが、ほうりつで きまって いる いちばん たかい きんがく（やちん 1かげつぶん＋ぜいきん）より たかいです。ふどうさんやに りゆうを きいて ください。",
    warnBrokerageAboveHalf:
      "すむ ための へやでは、ちゅうかい てすうりょうを やちんの はんつきぶん（＋ぜいきん）より たかく するには、さきに あなたの どういが ひつようです。どういしたか どうか たしかめて ください。",
    warnKeyMoneyHigh:
      "れいきん（礼金）が 2かげつぶん いじょうは たかい ほうです。もどらない おかねです。こうしょう できる ことも あります。",
    warnOptionalFees:
      "しょうどく（消毒）や サポートサービスなどは、えらべる ことが おおいです。ひとつずつ、かならず ひつようか きいて ください。",
    warnTotalHigh:
      "はじめに はらう おかねが やちんの やく 6かげつぶんより おおいと、たかい ほうです。にて いる へやと くらべて ください。",
    roomTitle: "へやの ひろさ",
    roomIntro: "へやの こうこくに かいて ある ひろさを いれて ください。へやの おおきさと、かぐが はいるか どうかが わかります。",
    roomSizeLabel: "へやの ひろさ",
    roomUnitLabel: "たんい",
    roomShow: "みます",
    roomInvalid: "0より おおきい、へやの ひろさを いれて ください。",
    roomLoading: "へやを かいて います…",
    unitPyeong: "つぼ（坪）",
    roomShape: "よこ {w} m × たて {d} m で かきました。ほんとうの かたちは ちがう ことが あります。",
    roomSceneLabel: "おいた かぐが みえる へやの 3Dの がめん",
    furnitureTitle: "かぐを おいて みます",
    furnitureHint: "したの かぐを おすと へやに おけます。へやの なかで うごかして ください。",
    furnitureTurn: "90° まわします",
    furnitureRemove: "とります",
    furnitureTooBig: "{name}は この へやより おおきいです。",
    furnitureCannotTurn: "この へやでは まわす ばしょが ありません。",
    homeTitle: "この へやを けいやく しても いいですか？",
    homeLead: "ちずで へやの ばしょを えらんで、ふどうさんやに もらった みつもりしょの すうじを いれて ください。くにの データを つかって、さいがいの きけん、まわりの ようす、はじめに はらう おかねを せつめいします。",
    homeStart: "ちずで へやの ばしょを えらびます",
    homeRoomOnly: "へやの ひろさだけ みます",
    homeChecksTitle: "しらべられる こと",
    homeHazardTitle: "さいがいの きけんが ある ばしょ",
    homeHazardBody: "こうずい、たかしお、つなみ、どしゃさいがい、えきじょうかの ばしょに はいって いるか どうかが わかります。",
    homeAreaTitle: "この へやの まわり",
    homeAreaBody: "とちの つかいかた（用途地域）と、しょうがっこう・ちゅうがっこうの がっく（学区）が わかります。",
    homeCostTitle: "はじめに はらう おかね",
    homeCostBody: "しききん、れいきん、ちゅうかい てすうりょうなどを たして、ふどうさんやに きく ことを おしえます。",
    homeRoomTitle: "へやの ひろさ",
    homeRoomBody: "じょう（畳）を ㎡に かえて、へやを 3Dで かきます。かぐを おいて みる ことが できます。",
    homeStepsTitle: "つかいかた",
    homeStep1: "ちずで へやの ばしょを えらびます",
    homeStep2: "みつもりしょの すうじを いれます。いれなくても いいです",
    homeStep3: "けっかを みます",
    homeDisclaimer: "さんこうの じょうほうです。ほうりつや ふどうさんの そうだんでは ありません。けいやくの まえに、しやくしょの ハザードマップと 重要事項説明（じゅうようじこうせつめい）で かならず たしかめて ください。",
    homeOfficialTitle: "くにの データだけ",
    homeOfficialBody: "こくどこうつうしょうが だして いる データです",
    homeNoStoreTitle: "ほぞんしません",
    homeNoStoreBody: "ばしょと おかねは けいさんの あと すてます",
    homeLangsTitle: "4つの ことば",
    homeLangsBody: "English · 한국어 · 日本語 · 中文",
    homeFreeTitle: "むりょうです",
    homeFreeBody: "とうろくも しはらいも いりません",
    tagline: "ハンコの前に、くらみる。",
    searchLabel: "ばしょの なまえで うごかします",
    searchPlaceholder: "まちの なまえ（れい：新宿区、狛江市）",
    searchNoResult: "その なまえの まちは ありません。かんじの なまえで さがして ください。",
    searchLoadFailed: "まちの リストを よむことが できませんでした。ちずを うごかして ください。",
    searchTownPlaceholder: "この まちの なかの ちめい（れい：和泉本町）",
    searchClear: "えらんだ ばしょを けします",
    homeWhere: "どこに すみますか？",
    homeStay: "どのくらい すみますか？",
    stayUnknown: "まだ わかりません",
    stayMonths: "{n}かげつ",
    stayYears: "{n}ねん",
    stayLong: "3ねん いじょう",
    costPerStayMonth: "{n}かげつで わけると、さいしょの おかねは やちんの ほかに 1かげつ やく {yen}です。",
    stayShortNote: "けいやくは ふつう 2ねんです。はやく でるとき おかね（短期解約違約金）が いるか、サインの まえに きいて ください。",
  },
  zh: {
    languageLabel: "语言",
    stepsLabel: "步骤",
    tabMap: "地图",
    tabEstimate: "报价",
    tabResult: "结果",
    tabRoom: "房间大小",
    mapLabel: "用来选择位置的地图",
    pickerTitle: "把地图移到您打算租的房子",
    confirmLocation: "查看这个位置",
    locate: "移到我现在的位置",
    locateFailed: "无法获取您现在的位置。请手动移动地图。",
    locateOutside: "您现在的位置不在日本。请把地图移到日本境内。",
    estimateTitle: "输入报价",
    selectedLocation: "已选位置",
    noLocation: "还没有选择位置。",
    chooseLocation: "选择位置",
    estimateIntro: "请照着中介给您的报价单（見積書）填写数字。报价单上没有的项目可以留空。",
    groupMonthly: "每月支付",
    groupContract: "签约时支付",
    groupOther: "其他费用",
    groupMoveIn: "入住",
    glossRent: "房租",
    glossManagement: "管理费",
    glossDeposit: "押金，退租时退还一部分",
    glossKeyMoney: "礼金，不退还",
    glossBrokerage: "中介费，不含税",
    glossGuarantee: "保证公司首次费用，占房租加管理费的比例",
    glossFireInsurance: "火灾保险",
    glossKeyExchange: "换锁费",
    glossCleaning: "清洁费（签约时收取的情况）",
    glossMoveIn: "入住日期（可不填）",
    prepayNextMonth: "还要预付下个月的房租",
    unitYen: "日元",
    unitMonths: "个月",
    errRent: "请输入 1 到 10,000,000 日元之间的整数。",
    errYen: "请输入 0 到 10,000,000 日元之间的整数。",
    errMonths: "请输入 0 到 12 之间的数字。",
    errGuarantee: "请输入 0 到 200 之间的数字。",
    seeResult: "查看结果",
    skipEstimate: "不填报价，直接查看结果",
    resultTitle: "结果",
    resultLoading: "正在查询这个位置的官方数据…",
    resultFailedNetwork: "无法连接服务器。请检查网络后重试。",
    resultFailedInvalid: "服务器无法使用这个位置或报价。请返回检查您输入的内容。",
    resultFailedServer: "服务器出了问题。请稍后重试。",
    retry: "重试",
    partialNotice: "有些数据没能加载。标有“无法确认”的项目，请在官方灾害地图上确认。",
    cardHazards: "灾害区域",
    cardArea: "房子周边",
    cardCost: "初期费用",
    chipInArea: "在区域内",
    chipNotInArea: "不在区域内",
    chipUnavailable: "无法确认",
    noAreaData: "没有数据",
    noPriceData: "附近没有同时标明价格和面积的成交记录。",
    priceMedian: "每㎡价格的中位数",
    priceRange: "一半的成交落在",
    priceCount: "成交件数",
    pricePeriod: "期间",
    priceNote: "这是附近住宅的买卖价格，不是房租。",
    noEstimate: "没有输入报价，所以没有计算初期费用。",
    sourcesTitle: "数据来源",
    lineBrokerage: "中介费，含税",
    lineGuarantee: "保证公司首次费用",
    lineCleaning: "清洁费",
    lineFirstMonth: "第一个月的房租和管理费",
    lineProrated: "第一个月剩余天数的房租",
    lineNextMonth: "预付的下个月房租",
    lineOther: "其他",
    costTotal: "合计",
    costRentMonths: "约 {n} 个月的房租",
    warnBrokerageOverCap: "中介费超过了一个月房租加消费税，这是租房的法定上限。请让中介说明。",
    warnBrokerageAboveHalf: "住宅的中介费超过半个月房租加消费税时，需要您事先同意。请确认您是否同意过。",
    warnKeyMoneyHigh: "礼金（礼金）达到两个月以上，偏高。礼金不退还，有时可以商量。",
    warnOptionalFees: "消毒（消毒）或支援服务等附加项目往往可以不选。请逐项问清是否必须。",
    warnTotalHigh: "按常见的经验标准，初期费用超过约六个月房租就算偏高。请和类似的房子比较。",
    roomTitle: "房间大小",
    roomIntro: "输入房源上写的面积，看看房间有多大、家具放不放得下。",
    roomSizeLabel: "房间面积",
    roomUnitLabel: "单位",
    roomShow: "显示",
    roomInvalid: "请输入大于 0、房间可能有的面积。",
    roomLoading: "正在画房间…",
    unitPyeong: "坪",
    roomShape: "按 {w} m × {d} m 绘制。实际形状可能不同。",
    roomSceneLabel: "房间和您摆放的家具的 3D 视图",
    furnitureTitle: "试放家具",
    furnitureHint: "点下面的家具把它放进房间，然后拖动它。",
    furnitureTurn: "旋转 90°",
    furnitureRemove: "移除",
    furnitureTooBig: "{name}比这个房间大。",
    furnitureCannotTurn: "这个房间里没有旋转它的空间。",
    homeTitle: "这套房子，可以签约吗？",
    homeLead: "在地图上选好房子，照着中介的报价单填写数字。我们用日本的官方公开数据，为您说明灾害区域、周边规定和初期费用。",
    homeStart: "在地图上选房子的位置",
    homeRoomOnly: "只看房间大小",
    homeChecksTitle: "可以确认的内容",
    homeHazardTitle: "灾害区域",
    homeHazardBody: "房子是否在洪水、风暴潮、海啸、滑坡或地基液化的区域内。",
    homeAreaTitle: "房子周边",
    homeAreaBody: "土地的用途分区，以及公立小学和初中的学区。",
    homeCostTitle: "初期费用",
    homeCostBody: "把押金、礼金、中介费等加在一起，并指出应该向中介问清的地方。",
    homeRoomTitle: "房间大小",
    homeRoomBody: "把 畳 换算成 ㎡ 和平方英尺，用 3D 画出房间，还可以试放家具。",
    homeStepsTitle: "使用步骤",
    homeStep1: "在地图上选房子的位置",
    homeStep2: "输入报价单上的数字，也可以跳过",
    homeStep3: "阅读结果",
    homeDisclaimer: "仅供参考。本服务不是法律或房地产咨询。签约前请务必通过官方灾害地图和重要事项说明（重要事項説明）确认。",
    homeOfficialTitle: "只用官方数据",
    homeOfficialBody: "日本国土交通省公开的开放数据",
    homeNoStoreTitle: "不保存任何内容",
    homeNoStoreBody: "位置和金额在计算后即被丢弃",
    homeLangsTitle: "四种语言",
    homeLangsBody: "English · 한국어 · 日本語 · 中文",
    homeFreeTitle: "免费，无需注册",
    homeFreeBody: "不需要账号，也不需要付款",
    tagline: "盖章之前，先看 kuramiru。",
    searchLabel: "移到某个地区",
    searchPlaceholder: "市、区、町、村的名字（例：新宿、狛江）",
    searchNoResult: "没有这个名字的市区町村或都道府县。",
    searchLoadFailed: "无法加载地区列表。请手动移动地图。",
    searchTownPlaceholder: "这个地区内的町名（例：和泉本町）",
    searchClear: "清除已选的地区",
    homeWhere: "您打算住在哪里？",
    homeStay: "打算住多久？",
    stayUnknown: "还不确定",
    stayMonths: "{n} 个月",
    stayYears: "{n} 年",
    stayLong: "3 年以上",
    costPerStayMonth: "按 {n} 个月平摊，初期费用相当于在房租之外每月约 {yen}。",
    stayShortNote: "租约通常为两年。签约前请问清提前退租是否要付违约金（短期解約違約金）。",
  },
};

export function dictionaryFor(lang: Lang): Dictionary {
  return dictionaries[lang];
}
