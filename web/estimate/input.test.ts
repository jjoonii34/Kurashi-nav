import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_FIELDS,
  parseEstimate,
  type EstimateErrors,
  type EstimateFields,
} from "./input.ts";

function fields(overrides: Partial<EstimateFields>): EstimateFields {
  return { ...EMPTY_FIELDS, ...overrides };
}

test("parseEstimate accepts valid input", () => {
  const cases: {
    name: string;
    fields: EstimateFields;
    want: Record<string, unknown>;
  }[] = [
    {
      name: "rent only, everything else counts as zero",
      fields: fields({ rent: "80000" }),
      want: {
        rent_yen: 80000,
        management_fee_yen: 0,
        deposit_months: 0,
        key_money_months: 0,
        brokerage_months: 0,
        guarantee_rate: 0,
        fire_insurance_yen: 0,
        key_exchange_yen: 0,
        cleaning_fee_yen: 0,
      },
    },
    {
      name: "full estimate",
      fields: fields({
        rent: "80000",
        management: "5000",
        deposit: "1",
        keyMoney: "1",
        brokerage: "0.5",
        guaranteePercent: "50",
        fireInsurance: "20000",
        keyExchange: "16500",
        cleaning: "33000",
        moveInDate: "2027-04-15",
        prepayNextMonth: true,
      }),
      want: {
        rent_yen: 80000,
        management_fee_yen: 5000,
        deposit_months: 1,
        key_money_months: 1,
        brokerage_months: 0.5,
        guarantee_rate: 0.5,
        fire_insurance_yen: 20000,
        key_exchange_yen: 16500,
        cleaning_fee_yen: 33000,
        move_in_date: "2027-04-15",
        prepay_next_month: true,
      },
    },
    {
      name: "separators and full-width digits",
      fields: fields({ rent: "８０,０００", management: " 5,000 " }),
      want: {
        rent_yen: 80000,
        management_fee_yen: 5000,
        deposit_months: 0,
        key_money_months: 0,
        brokerage_months: 0,
        guarantee_rate: 0,
        fire_insurance_yen: 0,
        key_exchange_yen: 0,
        cleaning_fee_yen: 0,
      },
    },
    {
      name: "upper limits are allowed",
      fields: fields({
        rent: "10000000",
        deposit: "12",
        guaranteePercent: "200",
      }),
      want: {
        rent_yen: 10000000,
        management_fee_yen: 0,
        deposit_months: 12,
        key_money_months: 0,
        brokerage_months: 0,
        guarantee_rate: 2,
        fire_insurance_yen: 0,
        key_exchange_yen: 0,
        cleaning_fee_yen: 0,
      },
    },
  ];

  for (const c of cases) {
    const got = parseEstimate(c.fields);
    assert.deepEqual(got, { input: c.want }, c.name);
  }
});

test("parseEstimate reports each invalid field", () => {
  const cases: { name: string; fields: EstimateFields; want: EstimateErrors }[] =
    [
      { name: "empty rent", fields: fields({}), want: { rent: "rent" } },
      { name: "zero rent", fields: fields({ rent: "0" }), want: { rent: "rent" } },
      {
        name: "rent above the limit",
        fields: fields({ rent: "10000001" }),
        want: { rent: "rent" },
      },
      {
        name: "rent with a decimal point",
        fields: fields({ rent: "80000.5" }),
        want: { rent: "rent" },
      },
      {
        name: "negative fee",
        fields: fields({ rent: "80000", management: "-1" }),
        want: { management: "yen" },
      },
      {
        name: "letters in a fee",
        fields: fields({ rent: "80000", cleaning: "abc" }),
        want: { cleaning: "yen" },
      },
      {
        name: "too many months",
        fields: fields({ rent: "80000", deposit: "12.5" }),
        want: { deposit: "months" },
      },
      {
        name: "guarantee above 200%",
        fields: fields({ rent: "80000", guaranteePercent: "201" }),
        want: { guaranteePercent: "guarantee" },
      },
      {
        name: "several fields at once",
        fields: fields({ keyMoney: "x", keyExchange: "1.5" }),
        want: { rent: "rent", keyMoney: "months", keyExchange: "yen" },
      },
    ];

  for (const c of cases) {
    const got = parseEstimate(c.fields);
    assert.deepEqual(got, { errors: c.want }, c.name);
  }
});
