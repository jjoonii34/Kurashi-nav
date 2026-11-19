// Package cost explains the initial costs (初期費用) of a Japanese rental
// contract: what each line is, the total, and red flags worth asking about.
//
// It is pure computation — no I/O, no clock, no globals — so it is the
// easiest package to test and a good one to read first.
//
// Money is int64 yen. Months are accepted as float64 (e.g. 0.5) but are
// converted to hundredths before any arithmetic, so results never suffer
// from floating-point rounding. Fractions of a yen are truncated (切り捨て).
package cost

import (
	"errors"
	"fmt"
	"math"
	"strings"
	"time"
	"unicode/utf8"
)

// Input is what the user copies from the agent's estimate (見積書).
// Fixed-amount fees are entered tax-included, as printed on the estimate.
type Input struct {
	RentYen          int64   `json:"rent_yen"`           // 家賃 (monthly)
	ManagementFeeYen int64   `json:"management_fee_yen"` // 管理費・共益費 (monthly)
	DepositMonths    float64 `json:"deposit_months"`     // 敷金, in months of rent
	KeyMoneyMonths   float64 `json:"key_money_months"`   // 礼金, in months of rent
	BrokerageMonths  float64 `json:"brokerage_months"`   // 仲介手数料 before tax, in months of rent
	GuaranteeRate    float64 `json:"guarantee_rate"`     // 保証会社 initial fee as a share of rent+management (0.5 = 50%)
	FireInsuranceYen int64   `json:"fire_insurance_yen"` // 火災保険
	KeyExchangeYen   int64   `json:"key_exchange_yen"`   // 鍵交換費
	CleaningFeeYen   int64   `json:"cleaning_fee_yen"`   // クリーニング費 when charged up front
	OtherFees        []Fee   `json:"other_fees,omitempty"`

	// MoveInDate (YYYY-MM-DD) enables day-based proration (日割り) of the
	// first month. When empty, one full month of rent is assumed.
	MoveInDate string `json:"move_in_date,omitempty"`
	// PrepayNextMonth adds next month's rent, common when moving in late in a month.
	PrepayNextMonth bool `json:"prepay_next_month,omitempty"`
}

// Fee is any other line on the estimate (消毒料, 安心サポート, ...).
type Fee struct {
	Name      string `json:"name"`
	AmountYen int64  `json:"amount_yen"`
}

// LineCode identifies a cost line; the frontend localises it.
type LineCode string

const (
	LineDeposit        LineCode = "deposit"
	LineKeyMoney       LineCode = "key_money"
	LineBrokerage      LineCode = "brokerage"
	LineGuarantee      LineCode = "guarantee"
	LineFireInsurance  LineCode = "fire_insurance"
	LineKeyExchange    LineCode = "key_exchange"
	LineCleaning       LineCode = "cleaning"
	LineFirstMonthRent LineCode = "first_month_rent"
	LineProratedRent   LineCode = "prorated_rent"
	LineNextMonthRent  LineCode = "next_month_rent"
	LineOther          LineCode = "other"
)

// Line is one row of the breakdown.
type Line struct {
	Code      LineCode `json:"code"`
	Label     string   `json:"label,omitempty"` // user-entered name, only for "other"
	AmountYen int64    `json:"amount_yen"`
	// Refundable is true for 敷金: returned at move-out minus restoration
	// costs (原状回復) the tenant is responsible for.
	Refundable bool `json:"refundable"`
}

// Severity of a warning.
type Severity string

const (
	SeverityInfo    Severity = "info"
	SeverityWarning Severity = "warning"
)

// Warning is something worth asking the agent about before signing.
type Warning struct {
	Code     string   `json:"code"`
	Severity Severity `json:"severity"`
	Message  string   `json:"message"` // English; the frontend localises by Code
}

// Result is the full breakdown.
type Result struct {
	Lines             []Line    `json:"lines"`
	TotalYen          int64     `json:"total_yen"`
	MonthlyYen        int64     `json:"monthly_yen"`          // rent + management fee
	TotalInRentMonths float64   `json:"total_in_rent_months"` // total ÷ rent, a common rule of thumb
	Warnings          []Warning `json:"warnings"`
}

// ErrInvalid wraps every validation error from Calculate.
var ErrInvalid = errors.New("invalid cost input")

const (
	maxYen         = 10_000_000
	maxMonths      = 12.0
	maxGuarantee   = 2.0
	maxOtherFees   = 20
	maxFeeNameLen  = 50
	taxPercent     = 10 // 消費税
	highTotalRatio = 6.0
)

// Calculate validates in and returns the breakdown.
func Calculate(in Input) (Result, error) {
	moveIn, err := validate(in)
	if err != nil {
		return Result{}, err
	}

	monthly := in.RentYen + in.ManagementFeeYen
	lines := make([]Line, 0, 12)
	add := func(code LineCode, amount int64, refundable bool) {
		if amount > 0 {
			lines = append(lines, Line{Code: code, AmountYen: amount, Refundable: refundable})
		}
	}

	add(LineDeposit, ofMonths(in.RentYen, in.DepositMonths), true)
	add(LineKeyMoney, ofMonths(in.RentYen, in.KeyMoneyMonths), false)
	// The brokerage fee is based on rent only (not the management fee) and is taxable.
	add(LineBrokerage, withTax(ofMonths(in.RentYen, in.BrokerageMonths)), false)
	add(LineGuarantee, ofMonths(monthly, in.GuaranteeRate), false)
	add(LineFireInsurance, in.FireInsuranceYen, false)
	add(LineKeyExchange, in.KeyExchangeYen, false)
	add(LineCleaning, in.CleaningFeeYen, false)
	if moveIn.IsZero() {
		add(LineFirstMonthRent, monthly, false)
	} else {
		add(LineProratedRent, prorate(monthly, moveIn), false)
	}
	if in.PrepayNextMonth {
		add(LineNextMonthRent, monthly, false)
	}
	for _, f := range in.OtherFees {
		if f.AmountYen > 0 {
			lines = append(lines, Line{Code: LineOther, Label: strings.TrimSpace(f.Name), AmountYen: f.AmountYen})
		}
	}

	var total int64
	for _, l := range lines {
		total += l.AmountYen
	}
	ratio := math.Round(float64(total)/float64(in.RentYen)*100) / 100

	return Result{
		Lines:             lines,
		TotalYen:          total,
		MonthlyYen:        monthly,
		TotalInRentMonths: ratio,
		Warnings:          check(in, ratio),
	}, nil
}

// ofMonths returns base × months, with months rounded to hundredths first.
func ofMonths(base int64, months float64) int64 {
	hundredths := int64(math.Round(months * 100))
	return base * hundredths / 100
}

func withTax(amount int64) int64 { return amount + amount*taxPercent/100 }

// prorate charges the days from moveIn (inclusive) to the end of that month.
func prorate(monthly int64, moveIn time.Time) int64 {
	days := daysIn(moveIn.Year(), moveIn.Month())
	remaining := days - moveIn.Day() + 1
	return monthly * int64(remaining) / int64(days)
}

func daysIn(year int, month time.Month) int {
	// Day 0 of the next month is the last day of this month.
	return time.Date(year, month+1, 0, 0, 0, 0, 0, time.UTC).Day()
}

// check returns heuristics, not legal judgements. Each message tells the user
// what to ask, never what to conclude.
func check(in Input, totalRatio float64) []Warning {
	ws := []Warning{}
	brokerage := int64(math.Round(in.BrokerageMonths * 100))

	switch {
	case brokerage > 100:
		ws = append(ws, Warning{
			Code:     "brokerage_over_legal_cap",
			Severity: SeverityWarning,
			Message: "The brokerage fee is above one month's rent plus tax, the legal maximum for a rental " +
				"brokerage (昭和45年建設省告示第1552号 第4). Ask the agent to explain.",
		})
	case brokerage > 50:
		ws = append(ws, Warning{
			Code:     "brokerage_above_half_month",
			Severity: SeverityInfo,
			Message: "For a residential lease the agent may charge you more than half a month's rent (plus tax) " +
				"only if you agreed in advance. Check whether you gave that consent.",
		})
	}
	if in.KeyMoneyMonths >= 2 {
		ws = append(ws, Warning{
			Code:     "key_money_high",
			Severity: SeverityInfo,
			Message:  "Key money (礼金) of two months or more is on the high side. It is not refunded; it may be negotiable.",
		})
	}
	if len(in.OtherFees) > 0 {
		ws = append(ws, Warning{
			Code:     "optional_fees",
			Severity: SeverityInfo,
			Message:  "Extra items such as disinfection (消毒) or support services are often optional. Ask whether each one is required.",
		})
	}
	if totalRatio > highTotalRatio {
		ws = append(ws, Warning{
			Code:     "total_high",
			Severity: SeverityInfo,
			Message:  "Initial costs above about six months of rent are high by a common rule of thumb. Compare with similar listings.",
		})
	}
	return ws
}

func validate(in Input) (time.Time, error) {
	var errs []error
	bad := func(format string, args ...any) { errs = append(errs, fmt.Errorf(format, args...)) }

	if in.RentYen <= 0 || in.RentYen > maxYen {
		bad("rent_yen must be between 1 and %d", maxYen)
	}
	yen := map[string]int64{
		"management_fee_yen": in.ManagementFeeYen,
		"fire_insurance_yen": in.FireInsuranceYen,
		"key_exchange_yen":   in.KeyExchangeYen,
		"cleaning_fee_yen":   in.CleaningFeeYen,
	}
	for _, name := range []string{"management_fee_yen", "fire_insurance_yen", "key_exchange_yen", "cleaning_fee_yen"} {
		if v := yen[name]; v < 0 || v > maxYen {
			bad("%s must be between 0 and %d", name, maxYen)
		}
	}
	months := []struct {
		name string
		v    float64
		max  float64
	}{
		{"deposit_months", in.DepositMonths, maxMonths},
		{"key_money_months", in.KeyMoneyMonths, maxMonths},
		{"brokerage_months", in.BrokerageMonths, maxMonths},
		{"guarantee_rate", in.GuaranteeRate, maxGuarantee},
	}
	for _, m := range months {
		if math.IsNaN(m.v) || m.v < 0 || m.v > m.max {
			bad("%s must be between 0 and %g", m.name, m.max)
		}
	}
	if len(in.OtherFees) > maxOtherFees {
		bad("other_fees: at most %d items", maxOtherFees)
	}
	for i, f := range in.OtherFees {
		name := strings.TrimSpace(f.Name)
		if name == "" || utf8.RuneCountInString(name) > maxFeeNameLen {
			bad("other_fees[%d].name must be 1-%d characters", i, maxFeeNameLen)
		}
		if f.AmountYen < 0 || f.AmountYen > maxYen {
			bad("other_fees[%d].amount_yen must be between 0 and %d", i, maxYen)
		}
	}

	var moveIn time.Time
	if in.MoveInDate != "" {
		d, err := time.Parse(time.DateOnly, in.MoveInDate)
		if err != nil {
			bad("move_in_date must be YYYY-MM-DD")
		}
		moveIn = d
	}

	if len(errs) > 0 {
		return time.Time{}, fmt.Errorf("%w: %w", ErrInvalid, errors.Join(errs...))
	}
	return moveIn, nil
}
