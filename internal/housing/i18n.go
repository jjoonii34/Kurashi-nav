package housing

import "github.com/jjoonii34/kurashi-nav/internal/i18n"

// messages is this package's part of the server-side catalogue.
var messages = i18n.Catalog{
	i18n.EN: {
		string(LayerFlood):            "Flood (river) inundation area",
		string(LayerStormSurge):       "Storm surge inundation area",
		string(LayerTsunami):          "Tsunami inundation area",
		string(LayerLandslide):        "Landslide warning area",
		string(LayerLiquefaction):     "Liquefaction tendency",
		string(LayerZoning):           "Zoning (use district)",
		string(LayerElementarySchool): "Public elementary school district",
		string(LayerJuniorHighSchool): "Public junior high school district",
		string(LayerTransactions):     "Nearby transaction prices",
		"unavailable":                 "Temporarily unavailable. Please check the official source.",
		"disclaimer": "For reference only. Hazard information comes from public data and does not guarantee " +
			"safety or danger. Cost figures are estimates. This is not legal or real-estate advice. " +
			"Always confirm with the official municipal hazard map and the 重要事項説明 before signing.",
	},
	i18n.KO: {
		string(LayerFlood):            "홍수(하천) 침수 예상 구역",
		string(LayerStormSurge):       "고조 침수 예상 구역",
		string(LayerTsunami):          "쓰나미 침수 예상 구역",
		string(LayerLandslide):        "토사재해 경계구역",
		string(LayerLiquefaction):     "액상화 발생 경향",
		string(LayerZoning):           "용도지역",
		string(LayerElementarySchool): "공립 초등학교 학구",
		string(LayerJuniorHighSchool): "공립 중학교 학구",
		string(LayerTransactions):     "주변 거래 가격",
		"unavailable":                 "일시적으로 조회할 수 없습니다. 공식 자료를 확인해 주세요.",
		"disclaimer": "참고용 정보입니다. 재해 정보는 공공데이터 기반이며 안전이나 위험을 보장하지 않습니다. " +
			"비용은 추정치입니다. 법률·부동산 자문이 아닙니다. 계약 전 반드시 지자체 공식 해저드맵과 " +
			"중요사항설명(重要事項説明)으로 확인하세요.",
	},
	i18n.JAEasy: {
		string(LayerFlood):            "川の水があふれたときに水が来る場所",
		string(LayerStormSurge):       "高潮で水が来る場所",
		string(LayerTsunami):          "津波で水が来る場所",
		string(LayerLandslide):        "土砂災害（がけくずれなど）に気をつける場所",
		string(LayerLiquefaction):     "地震で地面がやわらかくなる（液状化）かもしれない場所",
		string(LayerZoning):           "用途地域（どんな建物を建ててよいか）",
		string(LayerElementarySchool): "公立小学校の校区",
		string(LayerJuniorHighSchool): "公立中学校の校区",
		string(LayerTransactions):     "近くの取引の値段",
		"unavailable":                 "今は見ることができません。市役所などの情報を見てください。",
		"disclaimer": "この結果は参考です。災害の情報は国などのデータです。安全かどうかを約束するものではありません。" +
			"お金は目安です。契約の前に、必ず市役所のハザードマップと重要事項説明を確認してください。",
	},
}

func t(lang i18n.Lang, key string) string { return messages.T(lang, key) }
