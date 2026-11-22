package room

import "github.com/jjoonii34/kuramiru/internal/i18n"

// Furniture is a reference item the 3D preview can place in the room to give
// a sense of scale. Sizes are typical for Japan, not exact products.
type Furniture struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	WidthCM  int    `json:"width_cm"`
	DepthCM  int    `json:"depth_cm"`
	HeightCM int    `json:"height_cm"`
}

var furniture = []Furniture{
	{ID: "bed_single", WidthCM: 97, DepthCM: 195, HeightCM: 45},
	{ID: "bed_semi_double", WidthCM: 120, DepthCM: 195, HeightCM: 45},
	{ID: "futon_single", WidthCM: 100, DepthCM: 210, HeightCM: 10},
	{ID: "desk", WidthCM: 100, DepthCM: 60, HeightCM: 72},
	{ID: "sofa_2_seat", WidthCM: 150, DepthCM: 80, HeightCM: 80},
	{ID: "dining_table_2", WidthCM: 75, DepthCM: 75, HeightCM: 72},
	{ID: "fridge_small", WidthCM: 50, DepthCM: 60, HeightCM: 125},
	{ID: "washing_machine", WidthCM: 60, DepthCM: 60, HeightCM: 90},
	{ID: "tv_stand", WidthCM: 120, DepthCM: 40, HeightCM: 45},
}

// ReferenceFurniture returns the presets with localised names.
// It returns a fresh slice so callers cannot modify the shared presets.
func ReferenceFurniture(lang i18n.Lang) []Furniture {
	out := make([]Furniture, len(furniture))
	for i, f := range furniture {
		f.Name = messages.T(lang, "furniture_"+f.ID)
		out[i] = f
	}
	return out
}
