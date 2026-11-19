package room

import "github.com/jjoonii34/kurashi-nav/internal/i18n"

var messages = i18n.Catalog{
	i18n.EN: {
		"part_R":   "One room (ワンルーム): the kitchen is inside the room, with no door between them.",
		"part_K":   "Kitchen: a small kitchen separated from the room by a door or wall.",
		"part_DK":  "Dining-kitchen: a kitchen with space for a dining table.",
		"part_LDK": "Living-dining-kitchen: one larger space for cooking, eating and relaxing.",
		"part_S": "Service room (サービスルーム / 納戸): a room that does not meet the building code's " +
			"natural-light or ventilation standard for a habitable room. Often used for storage.",
		"summary_rooms":    "%d room(s) besides the kitchen area.",
		"summary_one_room": "A single room with the kitchen inside it.",
		"guideline_note": "Listing rule set by the real-estate fair trade councils: the minimum size for a " +
			"space to be advertised as DK or LDK, which depends on the number of rooms.",
		"size_note": "In listings, 1畳 (also written 帖) means at least 1.62㎡. Real tatami mats differ by region. " +
			"The room shape is an approximation for the 3D preview; check the floor plan (間取り図). " +
			"Furniture sizes are typical, not exact.",
		"furniture_bed_single":      "Single bed",
		"furniture_bed_semi_double": "Semi-double bed",
		"furniture_futon_single":    "Futon (single)",
		"furniture_desk":            "Desk",
		"furniture_sofa_2_seat":     "Two-seat sofa",
		"furniture_dining_table_2":  "Dining table for two",
		"furniture_fridge_small":    "Small fridge",
		"furniture_washing_machine": "Washing machine",
		"furniture_tv_stand":        "TV stand",
	},
	i18n.KO: {
		"part_R":   "원룸(ワンルーム): 방과 주방 사이에 문이 없는 하나의 공간입니다.",
		"part_K":   "K(키친): 방과 문이나 벽으로 분리된 작은 주방입니다.",
		"part_DK":  "DK(다이닝 키친): 식탁을 둘 수 있는 크기의 주방입니다.",
		"part_LDK": "LDK(리빙·다이닝·키친): 거실·식사·주방이 하나로 된 넓은 공간입니다.",
		"part_S": "S(서비스룸·納戸): 건축기준법의 채광·환기 기준을 채우지 못해 '거실(居室)'로 " +
			"표기할 수 없는 방입니다. 주로 수납용으로 씁니다.",
		"summary_rooms":    "주방 공간 외에 방이 %d개 있습니다.",
		"summary_one_room": "주방이 방 안에 있는 하나의 공간입니다.",
		"guideline_note":   "부동산공정거래협의회의 광고 기준: 방 개수에 따라 DK·LDK로 광고할 수 있는 최소 넓이가 정해져 있습니다.",
		"size_note": "매물 광고에서 1畳(帖로도 표기)는 1.62㎡ 이상을 뜻합니다. 실제 다다미 크기는 지역마다 다릅니다. " +
			"방 모양은 3D 미리보기를 위한 근사치이니 평면도(間取り図)로 확인하세요. 가구 크기는 일반적인 값입니다.",
		"furniture_bed_single":      "싱글 침대",
		"furniture_bed_semi_double": "세미더블 침대",
		"furniture_futon_single":    "이불 요(싱글)",
		"furniture_desk":            "책상",
		"furniture_sofa_2_seat":     "2인용 소파",
		"furniture_dining_table_2":  "2인용 식탁",
		"furniture_fridge_small":    "1인용 냉장고",
		"furniture_washing_machine": "세탁기",
		"furniture_tv_stand":        "TV 받침대",
	},
	i18n.JAEasy: {
		"part_R":   "ワンルーム：部屋とキッチンの間にドアがありません。",
		"part_K":   "K（キッチン）：部屋とキッチンがドアやかべで分かれています。キッチンは小さいです。",
		"part_DK":  "DK（ダイニングキッチン）：テーブルを置いてご飯を食べられるキッチンです。",
		"part_LDK": "LDK（リビング・ダイニング・キッチン）：料理・食事・休むことが一つの広い部屋でできます。",
		"part_S": "S（サービスルーム・納戸）：窓が小さいなどの理由で、法律では「居室」と言えない部屋です。" +
			"物を置く部屋として使うことが多いです。",
		"summary_rooms":    "キッチンのほかに部屋が%dつあります。",
		"summary_one_room": "キッチンが部屋の中にある、一つの部屋です。",
		"guideline_note":   "広告のルール（不動産公正取引協議会）：部屋の数によって、DK・LDKと書いてよい広さが決まっています。",
		"size_note": "広告の「1畳（1帖）」は1.62㎡以上という意味です。本当のたたみの大きさは地域でちがいます。" +
			"部屋の形は3Dで見るための目安です。間取り図で確認してください。家具の大きさも目安です。",
		"furniture_bed_single":      "シングルベッド",
		"furniture_bed_semi_double": "セミダブルベッド",
		"furniture_futon_single":    "ふとん（シングル）",
		"furniture_desk":            "机",
		"furniture_sofa_2_seat":     "2人用ソファ",
		"furniture_dining_table_2":  "2人用テーブル",
		"furniture_fridge_small":    "小さい冷蔵庫",
		"furniture_washing_machine": "洗濯機",
		"furniture_tv_stand":        "テレビ台",
	},
}
