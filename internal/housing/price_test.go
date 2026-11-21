package housing

import (
	"reflect"
	"testing"
)

func TestPercentile(t *testing.T) {
	seven := []int64{40, 45, 50, 55, 60, 70, 90}
	four := []int64{40, 50, 60, 70}

	tests := []struct {
		name   string
		sorted []int64
		p      int
		want   int64
	}{
		{"odd count, q1", seven, 25, 45},
		{"odd count, median", seven, 50, 55},
		{"odd count, q3", seven, 75, 70},
		{"even count, median is the lower middle value", four, 50, 50},
		{"even count, q1", four, 25, 40},
		{"even count, q3", four, 75, 60},
		{"single value, q1", []int64{42}, 25, 42},
		{"single value, q3", []int64{42}, 75, 42},
		{"100th percentile is the maximum", seven, 100, 90},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := percentile(tt.sorted, tt.p); got != tt.want {
				t.Errorf("percentile(%v, %d) = %d, want %d", tt.sorted, tt.p, got, tt.want)
			}
		})
	}
}

func sale(priceYen int64, areaSqm float64, period string) Properties {
	return Properties{PropPriceYen: priceYen, PropAreaSqm: areaSqm, PropPeriod: period}
}

func TestSummarizePrices(t *testing.T) {
	tests := []struct {
		name     string
		features []Properties
		want     *PriceSummary
	}{
		{"no features", nil, nil},
		{
			"features without numeric keys are skipped",
			[]Properties{{"u_transaction_price_total_ja": "3,200万円"}},
			nil,
		},
		{
			"zero area is skipped",
			[]Properties{sale(30_000_000, 0, "2025Q1")},
			nil,
		},
		{
			"unsorted input; unit price is price divided by area",
			[]Properties{
				sale(42_000_000, 60, "2024Q3"), // 700,000 yen/sqm
				sale(20_000_000, 50, "2025Q2"), // 400,000
				sale(30_000_000, 50, "2023Q1"), // 600,000
				sale(25_000_000, 50, "2024Q1"), // 500,000
			},
			&PriceSummary{
				Count:              4,
				UnitPriceYenPerSqm: Quartiles{Q1: 400_000, Median: 500_000, Q3: 600_000},
				PeriodFrom:         "2023Q1",
				PeriodTo:           "2025Q2",
			},
		},
		{
			"unusable records do not count",
			[]Properties{
				sale(30_000_000, 50, "2024Q4"),
				{PropPriceYen: int64(99_000_000), PropPeriod: "2020Q1"},
			},
			&PriceSummary{
				Count:              1,
				UnitPriceYenPerSqm: Quartiles{Q1: 600_000, Median: 600_000, Q3: 600_000},
				PeriodFrom:         "2024Q4",
				PeriodTo:           "2024Q4",
			},
		},
		{
			"unit price is rounded to whole yen",
			[]Properties{sale(10_000_000, 30, "")},
			&PriceSummary{
				Count:              1,
				UnitPriceYenPerSqm: Quartiles{Q1: 333_333, Median: 333_333, Q3: 333_333},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := summarizePrices(tt.features)
			if !reflect.DeepEqual(got, tt.want) {
				t.Errorf("summarizePrices() = %+v, want %+v", got, tt.want)
			}
		})
	}
}
