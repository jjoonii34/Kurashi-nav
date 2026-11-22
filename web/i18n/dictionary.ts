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
  homePrivacy: string;
  homeDisclaimer: string;
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
    homePrivacy: "What you enter is not stored. It is used for the calculation and then discarded.",
    homeDisclaimer: "For reference only. This is not legal or real-estate advice. Always confirm with the official hazard map and the 重要事項説明 before you sign.",
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
    homePrivacy: "입력한 위치와 금액은 저장하지 않습니다. 계산에만 쓰고 버립니다.",
    homeDisclaimer: "참고용 정보이며 법률·부동산 자문이 아닙니다. 계약 전에 반드시 지자체 공식 해저드맵과 重要事項説明으로 확인하세요.",
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
    homePrivacy: "いれた ばしょや おかねは ほぞんしません。けいさんに つかった あと、すてます。",
    homeDisclaimer: "さんこうの じょうほうです。ほうりつや ふどうさんの そうだんでは ありません。けいやくの まえに、しやくしょの ハザードマップと 重要事項説明（じゅうようじこうせつめい）で かならず たしかめて ください。",
  },
};

export function dictionaryFor(lang: Lang): Dictionary {
  return dictionaries[lang];
}
