package housing

// LayerID names one piece of location information in a housing report.
type LayerID string

const (
	LayerFlood            LayerID = "flood"        // 洪水浸水想定区域 (想定最大規模)
	LayerStormSurge       LayerID = "storm_surge"  // 高潮浸水想定区域
	LayerTsunami          LayerID = "tsunami"      // 津波浸水想定
	LayerLandslide        LayerID = "landslide"    // 土砂災害警戒区域
	LayerLiquefaction     LayerID = "liquefaction" // 液状化の発生傾向
	LayerZoning           LayerID = "zoning"       // 用途地域
	LayerElementarySchool LayerID = "elementary_school_district"
	LayerJuniorHighSchool LayerID = "junior_high_school_district"
	LayerTransactions     LayerID = "transactions" // 不動産取引価格 (nearby points)
)

// Kind groups layers for display.
type Kind string

const (
	KindHazard Kind = "hazard"
	KindZoning Kind = "zoning"
	KindSchool Kind = "school"
	KindPrice  Kind = "price"
)

// LayerSpec is one row of the report: which layer, how to group it, and
// which data source (see package source) must be credited for it.
type LayerSpec struct {
	ID       LayerID
	Kind     Kind
	SourceID string
}

// DefaultLayers is the MVP report, in display order.
func DefaultLayers(sourceID string) []LayerSpec {
	spec := func(id LayerID, k Kind) LayerSpec { return LayerSpec{ID: id, Kind: k, SourceID: sourceID} }
	return []LayerSpec{
		spec(LayerFlood, KindHazard),
		spec(LayerStormSurge, KindHazard),
		spec(LayerTsunami, KindHazard),
		spec(LayerLandslide, KindHazard),
		spec(LayerLiquefaction, KindHazard),
		spec(LayerZoning, KindZoning),
		spec(LayerElementarySchool, KindSchool),
		spec(LayerJuniorHighSchool, KindSchool),
		spec(LayerTransactions, KindPrice),
	}
}
