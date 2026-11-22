package reinfolib

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/jjoonii34/kuramiru/internal/housing"
)

// normalizeTransaction adds numeric keys next to the MLIT display strings.
// A value that does not parse is left out, and the domain skips that record.
//
// The string formats below are assumptions taken from the dummy data. They
// have not been checked against a live XPT001 response yet (backlog M1-3).
func normalizeTransaction(p housing.Properties) {
	if s, ok := p["u_transaction_price_total_ja"].(string); ok {
		if yen, ok := parseYen(s); ok {
			p[housing.PropPriceYen] = yen
		}
	}
	if s, ok := p["u_area_ja"].(string); ok {
		if sqm, ok := parseSqm(s); ok {
			p[housing.PropAreaSqm] = sqm
		}
	}
	if s, ok := p["point_in_time_name_ja"].(string); ok {
		if period, ok := parsePeriod(s); ok {
			p[housing.PropPeriod] = period
		}
	}
}

// parseYen reads "3,200万円", "1億2,000万円" or "9,800円".
func parseYen(s string) (int64, bool) {
	s = strings.ReplaceAll(s, ",", "")
	s, ok := strings.CutSuffix(s, "円")
	if !ok {
		return 0, false
	}

	var total int64
	for _, unit := range []struct {
		kanji string
		yen   int64
	}{{"億", 100_000_000}, {"万", 10_000}} {
		digits, rest, found := strings.Cut(s, unit.kanji)
		if !found {
			continue
		}
		n, err := strconv.ParseInt(digits, 10, 64)
		if err != nil || n < 0 {
			return 0, false
		}
		total += n * unit.yen
		s = rest
	}
	if s != "" {
		n, err := strconv.ParseInt(s, 10, 64)
		if err != nil || n < 0 {
			return 0, false
		}
		total += n
	}
	return total, total > 0
}

// parseSqm reads "65㎡". Open-ended values such as "2,000㎡以上" are rejected
// because they are not an exact area.
func parseSqm(s string) (float64, bool) {
	s, ok := strings.CutSuffix(s, "㎡")
	if !ok {
		return 0, false
	}
	sqm, err := strconv.ParseFloat(strings.ReplaceAll(s, ",", ""), 64)
	if err != nil || sqm <= 0 {
		return 0, false
	}
	return sqm, true
}

// parsePeriod turns "2025年第2四半期" into "2025Q2".
func parsePeriod(s string) (string, bool) {
	yearText, rest, ok := strings.Cut(s, "年第")
	if !ok {
		return "", false
	}
	quarterText, ok := strings.CutSuffix(rest, "四半期")
	if !ok {
		return "", false
	}
	year, errYear := strconv.Atoi(yearText)
	quarter, errQuarter := strconv.Atoi(quarterText)
	if errYear != nil || errQuarter != nil || year < 1000 || year > 9999 || quarter < 1 || quarter > 4 {
		return "", false
	}
	return fmt.Sprintf("%dQ%d", year, quarter), true
}
