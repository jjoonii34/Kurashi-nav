package reinfolib

import (
	"reflect"
	"testing"

	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

func TestParseYen(t *testing.T) {
	tests := []struct {
		in     string
		want   int64
		wantOK bool
	}{
		{"3,200万円", 32_000_000, true},
		{"850万円", 8_500_000, true},
		{"1億2,000万円", 120_000_000, true},
		{"2億円", 200_000_000, true},
		{"9,800円", 9_800, true},
		{"", 0, false},
		{"3,200万", 0, false},
		{"0円", 0, false},
		{"約3,200万円", 0, false},
		{"-5万円", 0, false},
		{"near", 0, false},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, ok := parseYen(tt.in)
			if got != tt.want || ok != tt.wantOK {
				t.Errorf("parseYen(%q) = %d, %v; want %d, %v", tt.in, got, ok, tt.want, tt.wantOK)
			}
		})
	}
}

func TestParseSqm(t *testing.T) {
	tests := []struct {
		in     string
		want   float64
		wantOK bool
	}{
		{"65㎡", 65, true},
		{"1,200㎡", 1200, true},
		{"25.5㎡", 25.5, true},
		{"2,000㎡以上", 0, false},
		{"0㎡", 0, false},
		{"65", 0, false},
		{"", 0, false},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, ok := parseSqm(tt.in)
			if got != tt.want || ok != tt.wantOK {
				t.Errorf("parseSqm(%q) = %v, %v; want %v, %v", tt.in, got, ok, tt.want, tt.wantOK)
			}
		})
	}
}

func TestParsePeriod(t *testing.T) {
	tests := []struct {
		in     string
		want   string
		wantOK bool
	}{
		{"2025年第2四半期", "2025Q2", true},
		{"2023年第4四半期", "2023Q4", true},
		{"2025年第5四半期", "", false},
		{"2025年", "", false},
		{"25年第1四半期", "", false},
		{"", "", false},
	}
	for _, tt := range tests {
		t.Run(tt.in, func(t *testing.T) {
			got, ok := parsePeriod(tt.in)
			if got != tt.want || ok != tt.wantOK {
				t.Errorf("parsePeriod(%q) = %q, %v; want %q, %v", tt.in, got, ok, tt.want, tt.wantOK)
			}
		})
	}
}

func TestNormalizeTransaction(t *testing.T) {
	tests := []struct {
		name string
		in   housing.Properties
		want housing.Properties
	}{
		{
			"all three fields parse",
			housing.Properties{
				"u_transaction_price_total_ja": "3,200万円",
				"u_area_ja":                    "65㎡",
				"point_in_time_name_ja":        "2025年第2四半期",
			},
			housing.Properties{
				"u_transaction_price_total_ja": "3,200万円",
				"u_area_ja":                    "65㎡",
				"point_in_time_name_ja":        "2025年第2四半期",
				housing.PropPriceYen:           int64(32_000_000),
				housing.PropAreaSqm:            65.0,
				housing.PropPeriod:             "2025Q2",
			},
		},
		{
			"an unreadable value adds no key",
			housing.Properties{"u_transaction_price_total_ja": "3,200万円", "u_area_ja": "2,000㎡以上"},
			housing.Properties{
				"u_transaction_price_total_ja": "3,200万円",
				"u_area_ja":                    "2,000㎡以上",
				housing.PropPriceYen:           int64(32_000_000),
			},
		},
		{
			"a non-string value is ignored",
			housing.Properties{"u_area_ja": 65},
			housing.Properties{"u_area_ja": 65},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			normalizeTransaction(tt.in)
			if !reflect.DeepEqual(tt.in, tt.want) {
				t.Errorf("got %v, want %v", tt.in, tt.want)
			}
		})
	}
}
