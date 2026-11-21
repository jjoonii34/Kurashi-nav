package housing

import (
	"math"
	"slices"
)

// Keys an adapter adds to each transaction feature, so this package never
// parses source-specific text such as "3,200万円".
const (
	PropPriceYen = "price_yen" // int64
	PropAreaSqm  = "area_sqm"  // float64
	PropPeriod   = "period"    // "2025Q2"; sorts chronologically as a string
)

// Quartiles are the 25th, 50th and 75th percentiles.
type Quartiles struct {
	Q1     int64 `json:"q1"`
	Median int64 `json:"median"`
	Q3     int64 `json:"q3"`
}

// PriceSummary describes the nearby transactions that had a usable price and area.
type PriceSummary struct {
	Count              int       `json:"count"`
	UnitPriceYenPerSqm Quartiles `json:"unit_price_yen_per_sqm"`
	PeriodFrom         string    `json:"period_from,omitempty"`
	PeriodTo           string    `json:"period_to,omitempty"`
}

// summarizePrices returns nil when no feature has both a price and an area.
func summarizePrices(features []Properties) *PriceSummary {
	var (
		unitPrices []int64
		from, to   string
	)
	for _, f := range features {
		price, hasPrice := f[PropPriceYen].(int64)
		area, hasArea := f[PropAreaSqm].(float64)
		if !hasPrice || !hasArea || area <= 0 {
			continue
		}
		unitPrices = append(unitPrices, int64(math.Round(float64(price)/area)))

		if period, ok := f[PropPeriod].(string); ok {
			if from == "" || period < from {
				from = period
			}
			if period > to {
				to = period
			}
		}
	}
	if len(unitPrices) == 0 {
		return nil
	}

	slices.Sort(unitPrices)
	return &PriceSummary{
		Count: len(unitPrices),
		UnitPriceYenPerSqm: Quartiles{
			Q1:     percentile(unitPrices, 25),
			Median: percentile(unitPrices, 50),
			Q3:     percentile(unitPrices, 75),
		},
		PeriodFrom: from,
		PeriodTo:   to,
	}
}

// percentile uses the nearest-rank method: the smallest value that has at
// least p% of the data at or below it. The result is always an observed
// value, which keeps yen as whole numbers. sorted must be non-empty and
// ascending, and p must be 1-100.
func percentile(sorted []int64, p int) int64 {
	rank := (len(sorted)*p + 99) / 100 // ceil(n*p/100) in integer arithmetic
	return sorted[rank-1]
}
