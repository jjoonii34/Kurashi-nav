package cost

import (
	"errors"
	"math"
	"slices"
	"strings"
	"testing"
)

// Table-driven tests: each row is one realistic estimate (見積書).
func TestCalculate(t *testing.T) {
	tests := []struct {
		name         string
		in           Input
		wantTotal    int64
		wantLines    map[LineCode]int64
		wantWarnings []string
	}{
		{
			name: "typical Tokyo 1K",
			in: Input{
				RentYen: 80_000, ManagementFeeYen: 5_000,
				DepositMonths: 1, KeyMoneyMonths: 1, BrokerageMonths: 1, GuaranteeRate: 0.5,
				FireInsuranceYen: 20_000, KeyExchangeYen: 16_500,
			},
			wantTotal: 412_000,
			wantLines: map[LineCode]int64{
				LineDeposit:        80_000,
				LineKeyMoney:       80_000,
				LineBrokerage:      88_000, // 80,000 + 10% tax
				LineGuarantee:      42_500, // 50% of 85,000
				LineFireInsurance:  20_000,
				LineKeyExchange:    16_500,
				LineFirstMonthRent: 85_000,
			},
			wantWarnings: []string{"brokerage_above_half_month"},
		},
		{
			name: "mid-month move-in with next month prepaid",
			in: Input{
				RentYen: 60_000, BrokerageMonths: 0.5,
				MoveInDate: "2026-04-16", PrepayNextMonth: true,
			},
			wantTotal: 123_000,
			wantLines: map[LineCode]int64{
				LineBrokerage:     33_000,
				LineProratedRent:  30_000, // 15 of 30 days
				LineNextMonthRent: 60_000,
			},
		},
		{
			name:      "leap year February proration",
			in:        Input{RentYen: 58_000, MoveInDate: "2028-02-15"},
			wantTotal: 30_000, // 15 of 29 days
			wantLines: map[LineCode]int64{LineProratedRent: 30_000},
		},
		{
			name:      "half-month deposit and tax truncation",
			in:        Input{RentYen: 73_333, DepositMonths: 0.5, BrokerageMonths: 1},
			wantTotal: 36_666 + 80_666 + 73_333,
			wantLines: map[LineCode]int64{
				LineDeposit:   36_666, // 36,666.5 truncated
				LineBrokerage: 80_666, // 73,333 + 7,333 (truncated)
			},
			wantWarnings: []string{"brokerage_above_half_month"},
		},
		{
			name:         "brokerage above the legal cap",
			in:           Input{RentYen: 100_000, BrokerageMonths: 1.5},
			wantTotal:    165_000 + 100_000,
			wantWarnings: []string{"brokerage_over_legal_cap"},
		},
		{
			name: "optional fees and high total",
			in: Input{
				RentYen: 50_000, DepositMonths: 2, KeyMoneyMonths: 2, BrokerageMonths: 1,
				OtherFees: []Fee{{Name: "消毒料", AmountYen: 16_500}, {Name: "安心サポート", AmountYen: 15_400}},
			},
			wantTotal: 100_000 + 100_000 + 55_000 + 50_000 + 16_500 + 15_400,
			wantWarnings: []string{
				"brokerage_above_half_month", "key_money_high", "optional_fees", "total_high",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Calculate(tt.in)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got.TotalYen != tt.wantTotal {
				t.Errorf("TotalYen = %d, want %d (lines: %+v)", got.TotalYen, tt.wantTotal, got.Lines)
			}
			for code, want := range tt.wantLines {
				if have := amountOf(got, code); have != want {
					t.Errorf("line %s = %d, want %d", code, have, want)
				}
			}
			var codes []string
			for _, w := range got.Warnings {
				codes = append(codes, w.Code)
			}
			if !slices.Equal(codes, tt.wantWarnings) {
				t.Errorf("warnings = %v, want %v", codes, tt.wantWarnings)
			}
		})
	}
}

func TestCalculate_DepositIsRefundable(t *testing.T) {
	got, err := Calculate(Input{RentYen: 70_000, DepositMonths: 1, KeyMoneyMonths: 1})
	if err != nil {
		t.Fatal(err)
	}
	for _, l := range got.Lines {
		if want := l.Code == LineDeposit; l.Refundable != want {
			t.Errorf("%s.Refundable = %v, want %v", l.Code, l.Refundable, want)
		}
	}
}

func TestCalculate_Invalid(t *testing.T) {
	tests := []struct {
		name    string
		in      Input
		wantMsg string
	}{
		{"zero rent", Input{}, "rent_yen"},
		{"negative management fee", Input{RentYen: 1, ManagementFeeYen: -1}, "management_fee_yen"},
		{"13 months deposit", Input{RentYen: 1, DepositMonths: 13}, "deposit_months"},
		{"NaN months", Input{RentYen: 1, KeyMoneyMonths: math.NaN()}, "key_money_months"},
		{"bad date format", Input{RentYen: 1, MoveInDate: "2026/04/01"}, "move_in_date"},
		{"impossible date", Input{RentYen: 1, MoveInDate: "2026-02-30"}, "move_in_date"},
		{"empty fee name", Input{RentYen: 1, OtherFees: []Fee{{AmountYen: 100}}}, "other_fees[0].name"},
		{"too many fees", Input{RentYen: 1, OtherFees: make([]Fee, 21)}, "at most 20"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := Calculate(tt.in)
			if !errors.Is(err, ErrInvalid) {
				t.Fatalf("err = %v, want ErrInvalid", err)
			}
			if !strings.Contains(err.Error(), tt.wantMsg) {
				t.Fatalf("err = %q, want it to mention %q", err, tt.wantMsg)
			}
		})
	}
}

func amountOf(r Result, code LineCode) int64 {
	for _, l := range r.Lines {
		if l.Code == code {
			return l.AmountYen
		}
	}
	return 0
}
