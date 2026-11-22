// What the user types, kept as text so a half-typed value is never lost.
export type EstimateFields = {
  rent: string;
  management: string;
  deposit: string;
  keyMoney: string;
  brokerage: string;
  guaranteePercent: string;
  fireInsurance: string;
  keyExchange: string;
  cleaning: string;
  moveInDate: string;
  prepayNextMonth: boolean;
};

export type NumericField = Exclude<
  keyof EstimateFields,
  "moveInDate" | "prepayNextMonth"
>;

// The `cost` object of POST /v1/housing/check (CostInput in docs/openapi.json).
export type CostInput = {
  rent_yen: number;
  management_fee_yen: number;
  deposit_months: number;
  key_money_months: number;
  brokerage_months: number;
  guarantee_rate: number;
  fire_insurance_yen: number;
  key_exchange_yen: number;
  cleaning_fee_yen: number;
  move_in_date?: string;
  prepay_next_month?: boolean;
};

export type FieldError = "rent" | "yen" | "months" | "guarantee";

export type EstimateErrors = Partial<Record<NumericField, FieldError>>;

export const EMPTY_FIELDS: EstimateFields = {
  rent: "",
  management: "",
  deposit: "",
  keyMoney: "",
  brokerage: "",
  guaranteePercent: "",
  fireInsurance: "",
  keyExchange: "",
  cleaning: "",
  moveInDate: "",
  prepayNextMonth: false,
};

// The same limits as internal/cost/cost.go. The server still validates;
// these only let the form explain a mistake before sending anything.
const MAX_YEN = 10_000_000;
const MAX_MONTHS = 12;
const MAX_GUARANTEE_PERCENT = 200;

// NFKC turns full-width digits from a Japanese keyboard ("８００００") into
// ASCII; separators such as "80,000" are dropped.
function clean(text: string): string {
  return text.normalize("NFKC").replace(/[,\s]/g, "");
}

// An empty field means "not on my estimate" and counts as 0.
function wholeNumber(text: string, min: number, max: number): number | null {
  const value = clean(text);
  if (value === "") {
    return min === 0 ? 0 : null;
  }
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

function decimalNumber(text: string, max: number): number | null {
  const value = clean(text);
  if (value === "") {
    return 0;
  }
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return null;
  }
  const n = Number(value);
  return n <= max ? n : null;
}

export function parseEstimate(
  fields: EstimateFields,
): { input: CostInput } | { errors: EstimateErrors } {
  const errors: EstimateErrors = {};

  const rent = wholeNumber(fields.rent, 1, MAX_YEN);
  if (rent === null) {
    errors.rent = "rent";
  }

  const yen = (field: NumericField): number => {
    const n = wholeNumber(fields[field], 0, MAX_YEN);
    if (n === null) {
      errors[field] = "yen";
    }
    return n ?? 0;
  };
  const months = (field: NumericField): number => {
    const n = decimalNumber(fields[field], MAX_MONTHS);
    if (n === null) {
      errors[field] = "months";
    }
    return n ?? 0;
  };

  const management = yen("management");
  const deposit = months("deposit");
  const keyMoney = months("keyMoney");
  const brokerage = months("brokerage");
  const fireInsurance = yen("fireInsurance");
  const keyExchange = yen("keyExchange");
  const cleaning = yen("cleaning");

  const guaranteePercent = decimalNumber(
    fields.guaranteePercent,
    MAX_GUARANTEE_PERCENT,
  );
  if (guaranteePercent === null) {
    errors.guaranteePercent = "guarantee";
  }

  if (rent === null || guaranteePercent === null || Object.keys(errors).length > 0) {
    return { errors };
  }

  const input: CostInput = {
    rent_yen: rent,
    management_fee_yen: management,
    deposit_months: deposit,
    key_money_months: keyMoney,
    brokerage_months: brokerage,
    // The form asks for a percentage; the API takes a share (50% → 0.5).
    guarantee_rate: guaranteePercent / 100,
    fire_insurance_yen: fireInsurance,
    key_exchange_yen: keyExchange,
    cleaning_fee_yen: cleaning,
  };
  if (fields.moveInDate !== "") {
    input.move_in_date = fields.moveInDate;
  }
  if (fields.prepayNextMonth) {
    input.prepay_next_month = true;
  }
  return { input };
}
