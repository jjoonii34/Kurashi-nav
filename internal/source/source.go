// Package source is the catalogue of data sources and the attribution
// (クレジット表記) each one requires. Every API response carries the relevant
// entries so the frontend can render them under the result.
//
// Keep this file in sync with docs/DATA_SOURCES.md.
package source

// Attribution describes one data source and how it must be credited.
type Attribution struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Provider string `json:"provider"`
	Credit   string `json:"credit"` // text the UI must display
	URL      string `json:"url,omitempty"`
	Edited   bool   `json:"edited"` // true if this service processed the data (加工)
	Notice   string `json:"notice,omitempty"`
}

var (
	// Reinfolib is the MLIT Real Estate Information Library API.
	//
	// TODO(before public launch): replace Credit/Notice with the exact wording
	// required by the API terms of use (API利用規約), which you receive when
	// your API key is issued. Do not ship with this placeholder.
	Reinfolib = Attribution{
		ID:       "reinfolib",
		Name:     "不動産情報ライブラリ (Real Estate Information Library)",
		Provider: "国土交通省 (MLIT)",
		Credit:   "出典：国土交通省「不動産情報ライブラリ」（加工して作成）",
		URL:      "https://www.reinfolib.mlit.go.jp/",
		Edited:   true,
		Notice:   "Data is provided as-is; accuracy and freshness are not guaranteed by MLIT or this service.",
	}

	// GSITiles are the background map tiles rendered by the frontend.
	GSITiles = Attribution{
		ID:       "gsi_tiles",
		Name:     "地理院タイル (GSI Tiles)",
		Provider: "国土地理院 (GSI)",
		Credit:   "地理院タイル",
		URL:      "https://maps.gsi.go.jp/development/ichiran.html",
	}

	// Dummy marks responses generated in DATA_MODE=fake.
	Dummy = Attribution{
		ID:       "dummy",
		Name:     "Dummy data (development only)",
		Provider: "kuramiru",
		Credit:   "DUMMY DATA — not real. Do not use for any decision.",
	}
)
