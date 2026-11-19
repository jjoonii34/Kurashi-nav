package reinfolib

import (
	"net/url"
	"strconv"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

// Geometry tells the adapter how to match features against the user's point.
type Geometry int

const (
	// Areas: keep features whose polygon contains the point.
	Areas Geometry = iota
	// Points: keep the nearest point features in the same tile.
	Points
)

// Endpoint describes how one housing layer maps onto an MLIT API.
type Endpoint struct {
	API      string
	Zoom     int // the MLIT tile APIs accept 11 (city) to 15 (detailed)
	Geometry Geometry
	// Keep lists the property keys passed through to the client.
	// nil keeps everything (useful while exploring a new API).
	Keep []string
	// MaxFeatures caps point results (nearest first). 0 = no cap.
	MaxFeatures int
	// Params adds API-specific query parameters.
	Params func(now time.Time) url.Values
}

// DefaultEndpoints maps every default housing layer to its MLIT API.
//
// API IDs and the zoom range were checked against the official API manual
// (https://www.reinfolib.mlit.go.jp/help/apiManual/) on 2026-11-19.
// Property keys marked "unverified" come from a third-party write-up; check
// them against the per-API manual page after your key is issued, and set
// Keep to nil temporarily to see every field the API returns.
func DefaultEndpoints() map[housing.LayerID]Endpoint {
	return map[housing.LayerID]Endpoint{
		// 国土数値情報（洪水浸水想定区域（想定最大規模））. A31a_205 = depth rank, A31a_202 = river name (unverified).
		housing.LayerFlood: {API: "XKT026", Zoom: 15, Geometry: Areas, Keep: []string{"A31a_205", "A31a_202"}},
		// 国土数値情報（高潮浸水想定区域）. A49_003 = depth class (unverified).
		housing.LayerStormSurge: {API: "XKT027", Zoom: 15, Geometry: Areas, Keep: []string{"A49_003"}},
		// 国土数値情報（津波浸水想定）. A40_003 = depth class (unverified).
		housing.LayerTsunami: {API: "XKT028", Zoom: 15, Geometry: Areas, Keep: []string{"A40_003"}},
		// 国土数値情報（土砂災害警戒区域）. A33_002: 1 = 警戒区域, 2 = 特別警戒区域 (unverified).
		housing.LayerLandslide: {API: "XKT029", Zoom: 15, Geometry: Areas, Keep: []string{"A33_002"}},
		// 国土交通省都市局（地形区分に基づく液状化の発生傾向図）. Fields not yet checked.
		housing.LayerLiquefaction: {API: "XKT025", Zoom: 15, Geometry: Areas, Keep: nil},
		// 都市計画決定GISデータ（用途地域）. Fields verified on the XKT002 manual page.
		housing.LayerZoning: {API: "XKT002", Zoom: 15, Geometry: Areas, Keep: []string{
			"use_area_ja", "u_building_coverage_ratio_ja", "u_floor_area_ratio_ja", "city_name",
		}},
		// 国土数値情報（小学校区）/（中学校区）. Fields not yet checked.
		housing.LayerElementarySchool: {API: "XKT004", Zoom: 15, Geometry: Areas, Keep: nil},
		housing.LayerJuniorHighSchool: {API: "XKT005", Zoom: 15, Geometry: Areas, Keep: nil},
		// 不動産価格（取引価格・成約価格）情報のポイント. Fields verified on the XPT001 manual page.
		// Points are placed at the nearest station, so many records share one point.
		housing.LayerTransactions: {
			API: "XPT001", Zoom: 14, Geometry: Points, MaxFeatures: 20,
			Keep: []string{
				"price_information_category_name_ja", "point_in_time_name_ja", "land_type_name_ja",
				"u_transaction_price_total_ja", "u_transaction_price_unit_price_square_meter_ja",
				"floor_plan_name_ja", "u_area_ja", "u_construction_year_ja", "building_structure_name_ja",
			},
			Params: lastYears(3),
		},
	}
}

// lastYears returns from/to parameters (format YYYYN, N = quarter 1-4)
// covering the previous n full calendar years.
func lastYears(n int) func(time.Time) url.Values {
	return func(now time.Time) url.Values {
		from := (now.Year()-n)*10 + 1
		to := (now.Year()-1)*10 + 4
		return url.Values{
			"from": {strconv.Itoa(from)},
			"to":   {strconv.Itoa(to)},
		}
	}
}
