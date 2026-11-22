package room

import (
	"errors"
	"math"
	"strings"
	"testing"

	"github.com/jjoonii34/kuramiru/internal/i18n"
)

func TestDescribe(t *testing.T) {
	tests := []struct {
		name       string
		in         SizeInput
		wantArea   float64
		wantJo     float64
		wantPyeong float64
		wantSqFt   float64
		wantWidth  float64
		wantDepth  float64
	}{
		// 6畳 × 1.62 = 9.72㎡ → the classic 2.7m × 3.6m room.
		{"six mats", SizeInput{Jo: 6}, 9.72, 6, 2.94, 104.63, 2.7, 3.6},
		// A typical 1K: 25㎡ ≈ 15.43畳 ≈ 7.56평.
		{"25 square metres", SizeInput{AreaSqm: 25}, 25, 15.43, 7.56, 269.1, 4.33, 5.77},
		{"4.5 mats", SizeInput{Jo: 4.5}, 7.29, 4.5, 2.21, 78.47, 2.34, 3.12},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Describe(tt.in, i18n.EN)
			if err != nil {
				t.Fatal(err)
			}
			checks := []struct {
				field      string
				have, want float64
			}{
				{"area_sqm", got.AreaSqm, tt.wantArea},
				{"jo", got.Jo, tt.wantJo},
				{"pyeong", got.Pyeong, tt.wantPyeong},
				{"sq_ft", got.SqFt, tt.wantSqFt},
				{"width_m", got.Shape.WidthM, tt.wantWidth},
				{"depth_m", got.Shape.DepthM, tt.wantDepth},
			}
			for _, c := range checks {
				if c.have != c.want {
					t.Errorf("%s = %v, want %v", c.field, c.have, c.want)
				}
			}
			if len(got.Furniture) == 0 || got.Note == "" {
				t.Error("reference furniture and note must be present")
			}
		})
	}
}

func TestDescribe_RegionalTatami(t *testing.T) {
	got, err := Describe(SizeInput{Jo: 6}, i18n.EN)
	if err != nil {
		t.Fatal(err)
	}
	// Smaller regional mats → more of them in the same 9.72㎡.
	want := map[string]float64{"kyoma": 5.33, "chukyoma": 5.87, "edoma": 6.28, "danchima": 6.73}
	for _, tc := range got.ByTatami {
		if tc.Count != want[tc.ID] {
			t.Errorf("%s (%s) = %v, want %v", tc.ID, tc.Name, tc.Count, want[tc.ID])
		}
	}
}

func TestDescribe_Invalid(t *testing.T) {
	tests := map[string]SizeInput{
		"neither":       {},
		"both":          {AreaSqm: 20, Jo: 6},
		"negative area": {AreaSqm: -1},
		"NaN jo":        {Jo: math.NaN()},
		"too large":     {AreaSqm: 5000},
	}
	for name, in := range tests {
		t.Run(name, func(t *testing.T) {
			if _, err := Describe(in, i18n.EN); !errors.Is(err, ErrInvalid) {
				t.Fatalf("err = %v, want ErrInvalid", err)
			}
		})
	}
}

func TestParseLayout(t *testing.T) {
	tests := []struct {
		in          string
		wantCode    string
		wantRooms   int
		wantKitchen string
		wantService bool
		wantMinJo   float64 // 0 = no guideline
	}{
		{"1R", "1R", 1, "R", false, 0},
		{"ワンルーム", "1R", 1, "R", false, 0},
		{"1K", "1K", 1, "K", false, 0},
		{"1DK", "1DK", 1, "DK", false, 4.5},
		{"2DK", "2DK", 2, "DK", false, 6},
		{"1LDK", "1LDK", 1, "LDK", false, 8},
		{"３ＬＤＫ", "3LDK", 3, "LDK", false, 10},
		{" 2ldk+s ", "2SLDK", 2, "LDK", true, 10},
		{"2LDK+納戸", "2SLDK", 2, "LDK", true, 10},
		{"3SLDK", "3SLDK", 3, "LDK", true, 10},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, err := ParseLayout(tt.in, i18n.KO)
			if err != nil {
				t.Fatal(err)
			}
			if got.Code != tt.wantCode || got.Rooms != tt.wantRooms || got.Kitchen != tt.wantKitchen || got.ServiceRoom != tt.wantService {
				t.Errorf("got %s/%d/%s/%v, want %s/%d/%s/%v",
					got.Code, got.Rooms, got.Kitchen, got.ServiceRoom,
					tt.wantCode, tt.wantRooms, tt.wantKitchen, tt.wantService)
			}
			switch {
			case tt.wantMinJo == 0 && got.Guideline != nil:
				t.Errorf("unexpected guideline %+v", got.Guideline)
			case tt.wantMinJo != 0 && (got.Guideline == nil || got.Guideline.MinJo != tt.wantMinJo):
				t.Errorf("guideline = %+v, want min %v畳", got.Guideline, tt.wantMinJo)
			}
			if got.Summary == "" || len(got.Parts) == 0 || strings.Contains(got.Summary, "%!") {
				t.Errorf("bad explanation: %+v", got)
			}
		})
	}
}

func TestParseLayout_Invalid(t *testing.T) {
	for _, in := range []string{"", "LDK", "0K", "2R", "1SR", "1LK", "10LDK", "1LDK+S+S"} {
		t.Run(in, func(t *testing.T) {
			if _, err := ParseLayout(in, i18n.EN); !errors.Is(err, ErrInvalid) {
				t.Fatalf("ParseLayout(%q) err = %v, want ErrInvalid", in, err)
			}
		})
	}
}

func TestCatalogIsComplete(t *testing.T) {
	if missing := messages.Missing(); len(missing) > 0 {
		t.Errorf("untranslated messages: %v", missing)
	}
	for _, f := range ReferenceFurniture(i18n.JAEasy) {
		if strings.HasPrefix(f.Name, "furniture_") {
			t.Errorf("furniture %s has no name", f.ID)
		}
	}
}

// ReferenceFurniture must return a copy: editing it must not change the presets.
func TestReferenceFurnitureIsACopy(t *testing.T) {
	a := ReferenceFurniture(i18n.EN)
	a[0].WidthCM = 1
	if b := ReferenceFurniture(i18n.EN); b[0].WidthCM == 1 {
		t.Fatal("shared presets were modified")
	}
}
