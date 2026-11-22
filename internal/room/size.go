// Package room explains Japanese room sizes (畳) and layout codes (1K, 2LDK…)
// to people who did not grow up with them, and gives the frontend what it
// needs to draw a to-scale 3D preview of an empty room with typical furniture.
//
// It works only from numbers the user types in from the listing — never from
// listing photos (docs/adr/0006). Pure functions, no I/O.
package room

import (
	"errors"
	"fmt"
	"math"

	"github.com/jjoonii34/kuramiru/internal/i18n"
)

const (
	// SqmPerJo is the area of one 畳 (also written 帖) in listings. Japanese
	// real-estate advertising rules (不動産の表示に関する公正競争規約) require
	// at least 1.62㎡ per 畳.
	SqmPerJo = 1.62
	// SqmPerPyeong is one 坪 (Korean 평): (6尺)² = (20/11 m)² = 400/121 ㎡.
	SqmPerPyeong = 400.0 / 121.0
	// SqFtPerSqm converts square metres to square feet.
	SqFtPerSqm = 10.763910417
	// DefaultCeilingM is a typical apartment ceiling height for the preview.
	DefaultCeilingM = 2.4

	// depthPerWidth shapes the suggested rectangle. 4:3 turns 6畳 into
	// 2.7m × 3.6m, the classic six-mat room.
	depthPerWidth = 4.0 / 3.0

	maxSqm = 1000.0
)

// ErrInvalid wraps every validation error in this package.
var ErrInvalid = errors.New("invalid room input")

// SizeInput takes exactly one of AreaSqm or Jo.
type SizeInput struct {
	AreaSqm float64
	Jo      float64
}

// TatamiCount says how many real mats of a regional size would cover the area.
type TatamiCount struct {
	ID    string  `json:"id"`
	Name  string  `json:"name"`
	MatMM string  `json:"mat_mm"`
	Count float64 `json:"count"`
}

// Shape is a suggested rectangle for the 3D preview.
type Shape struct {
	WidthM      float64 `json:"width_m"`
	DepthM      float64 `json:"depth_m"`
	CeilingM    float64 `json:"ceiling_m"`
	Approximate bool    `json:"approximate"` // the real shape is on the floor plan
}

// Size is the response of GET /v1/room/size.
type Size struct {
	AreaSqm   float64       `json:"area_sqm"`
	Jo        float64       `json:"jo"`     // listing 畳 (1.62㎡ each)
	Pyeong    float64       `json:"pyeong"` // 평 / 坪
	SqFt      float64       `json:"sq_ft"`
	ByTatami  []TatamiCount `json:"by_regional_tatami"`
	Shape     Shape         `json:"shape"`
	Furniture []Furniture   `json:"reference_furniture"`
	Note      string        `json:"note"`
}

// Regional tatami mat sizes in millimetres.
var tatamiSizes = []struct {
	id, name string
	widthMM  int
	lengthMM int
}{
	{"kyoma", "京間", 955, 1910},
	{"chukyoma", "中京間", 910, 1820},
	{"edoma", "江戸間", 880, 1760},
	{"danchima", "団地間", 850, 1700},
}

// Describe converts a room size into every unit a foreign resident might
// think in, plus a suggested shape and reference furniture for the 3D preview.
func Describe(in SizeInput, lang i18n.Lang) (Size, error) {
	area, err := in.area()
	if err != nil {
		return Size{}, err
	}

	width := math.Sqrt(area / depthPerWidth)
	return Size{
		AreaSqm:  round2(area),
		Jo:       round2(area / SqmPerJo),
		Pyeong:   round2(area / SqmPerPyeong),
		SqFt:     round2(area * SqFtPerSqm),
		ByTatami: byTatami(area),
		Shape: Shape{
			WidthM:      round2(width),
			DepthM:      round2(area / width),
			CeilingM:    DefaultCeilingM,
			Approximate: true,
		},
		Furniture: ReferenceFurniture(lang),
		Note:      messages.T(lang, "size_note"),
	}, nil
}

func (in SizeInput) area() (float64, error) {
	hasArea, hasJo := in.AreaSqm != 0, in.Jo != 0
	switch {
	case hasArea == hasJo:
		return 0, fmt.Errorf("%w: give exactly one of area_sqm or jo", ErrInvalid)
	case hasArea:
		if !inRange(in.AreaSqm, maxSqm) {
			return 0, fmt.Errorf("%w: area_sqm must be greater than 0 and at most %g", ErrInvalid, maxSqm)
		}
		return in.AreaSqm, nil
	default:
		if !inRange(in.Jo, maxSqm/SqmPerJo) {
			return 0, fmt.Errorf("%w: jo must be greater than 0 and at most %.0f", ErrInvalid, maxSqm/SqmPerJo)
		}
		return in.Jo * SqmPerJo, nil
	}
}

func inRange(v, upper float64) bool { return !math.IsNaN(v) && v > 0 && v <= upper }

func byTatami(area float64) []TatamiCount {
	out := make([]TatamiCount, 0, len(tatamiSizes))
	for _, t := range tatamiSizes {
		matSqm := float64(t.widthMM*t.lengthMM) / 1e6
		out = append(out, TatamiCount{
			ID:    t.id,
			Name:  t.name,
			MatMM: fmt.Sprintf("%d×%d", t.widthMM, t.lengthMM),
			Count: round2(area / matSqm),
		})
	}
	return out
}

func round2(v float64) float64 { return math.Round(v*100) / 100 }
