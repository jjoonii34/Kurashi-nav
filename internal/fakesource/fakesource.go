// Package fakesource is an in-memory housing.LayerSource for local
// development (DATA_MODE=fake) and tests. It can inject latency and errors
// per layer, which is how the timeout and partial-failure paths are tested.
//
// Every feature it returns carries "_dummy": true so fake data can never be
// mistaken for real data.
package fakesource

import (
	"context"
	"sync/atomic"
	"time"

	"github.com/jjoonii34/kurashi-nav/internal/geo"
	"github.com/jjoonii34/kurashi-nav/internal/housing"
)

// Source returns canned results. Configure the maps before first use;
// they are read-only afterwards, which makes Source safe for concurrent use.
type Source struct {
	Results map[housing.LayerID]housing.LayerResult
	Errors  map[housing.LayerID]error
	Delays  map[housing.LayerID]time.Duration

	calls atomic.Int64
}

// Lookup implements housing.LayerSource.
func (s *Source) Lookup(ctx context.Context, layer housing.LayerID, _ geo.Point) (housing.LayerResult, error) {
	s.calls.Add(1)

	if d := s.Delays[layer]; d > 0 {
		timer := time.NewTimer(d)
		defer timer.Stop()
		select {
		case <-ctx.Done():
			return housing.LayerResult{}, ctx.Err()
		case <-timer.C:
		}
	}
	if err := s.Errors[layer]; err != nil {
		return housing.LayerResult{}, err
	}
	return s.Results[layer], nil
}

// Calls reports how many lookups were made.
func (s *Source) Calls() int64 { return s.calls.Load() }

// NewDemo returns plausible-looking dummy data for every default layer.
// Field names mirror the real MLIT API so the frontend can be built against them.
func NewDemo() *Source {
	dummy := func(kv ...any) housing.Properties {
		p := housing.Properties{"_dummy": true}
		for i := 0; i+1 < len(kv); i += 2 {
			p[kv[i].(string)] = kv[i+1]
		}
		return p
	}
	hit := func(props ...housing.Properties) housing.LayerResult {
		return housing.LayerResult{Hit: true, Features: props}
	}
	sale := func(periodJA, period, priceJA string, priceYen int64, areaJA string, areaSqm float64) housing.Properties {
		return dummy(
			"point_in_time_name_ja", periodJA, "land_type_name_ja", "中古マンション等",
			"u_transaction_price_total_ja", priceJA, "u_area_ja", areaJA, "distance_m", 420,
			housing.PropPeriod, period, housing.PropPriceYen, priceYen, housing.PropAreaSqm, areaSqm,
		)
	}

	return &Source{
		Results: map[housing.LayerID]housing.LayerResult{
			housing.LayerFlood:            hit(dummy("A31a_205", 2, "A31a_202", "DUMMY川")),
			housing.LayerStormSurge:       {},
			housing.LayerTsunami:          {},
			housing.LayerLandslide:        {},
			housing.LayerLiquefaction:     hit(dummy("note", "dummy liquefaction tendency")),
			housing.LayerZoning:           hit(dummy("use_area_ja", "第一種住居地域", "u_building_coverage_ratio_ja", "60%", "u_floor_area_ratio_ja", "200%")),
			housing.LayerElementarySchool: hit(dummy("name", "DUMMY小学校")),
			housing.LayerJuniorHighSchool: hit(dummy("name", "DUMMY中学校")),
			housing.LayerTransactions: hit(
				sale("2025年第2四半期", "2025Q2", "3,200万円", 32_000_000, "60㎡", 60),
				sale("2025年第1四半期", "2025Q1", "2,800万円", 28_000_000, "55㎡", 55),
				sale("2024年第3四半期", "2024Q3", "4,500万円", 45_000_000, "70㎡", 70),
				sale("2024年第1四半期", "2024Q1", "1,980万円", 19_800_000, "25㎡", 25),
				sale("2023年第4四半期", "2023Q4", "5,200万円", 52_000_000, "80㎡", 80),
				sale("2023年第1四半期", "2023Q1", "3,600万円", 36_000_000, "65㎡", 65),
			),
		},
	}
}
