package geocode

import (
	"context"
	"errors"
	"testing"

	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

func TestNormalize(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"東京都千代田区丸の内1丁目", "東京都千代田区丸の内1丁目"},
		{"  東京都 千代田区　丸の内１丁目 ", "東京都千代田区丸の内1丁目"},
		{"渋谷区神南１－２－３", "渋谷区神南1-2-3"},
		{"渋谷区神南1ー2ー3", "渋谷区神南1-2-3"},
		{"渋谷区神南1−2−3", "渋谷区神南1-2-3"},
		{"センタービル1ー2", "センタービル1-2"}, // katakana ー is not a dash
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			if got := Normalize(tt.in); got != tt.want {
				t.Fatalf("Normalize(%q) = %q, want %q", tt.in, got, tt.want)
			}
		})
	}
}

func TestStaticGeocode(t *testing.T) {
	g := NewStatic(DemoEntries())

	p, err := g.Geocode(context.Background(), "東京都千代田区丸の内１丁目")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Lat < 35.6 || p.Lat > 35.7 {
		t.Fatalf("unexpected point %v", p)
	}

	if _, err := g.Geocode(context.Background(), "大阪府大阪市北区"); !errors.Is(err, housing.ErrAddressNotFound) {
		t.Fatalf("err = %v, want ErrAddressNotFound", err)
	}
}
