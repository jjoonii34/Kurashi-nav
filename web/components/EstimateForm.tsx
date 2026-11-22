"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  EMPTY_FIELDS,
  parseEstimate,
  type EstimateErrors,
  type EstimateFields,
  type FieldError,
  type NumericField,
} from "@/estimate/input";
import type { Dictionary } from "@/i18n/dictionary";
import type { Lang } from "@/i18n/langs";
import { useCheck } from "@/state/check";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

type FieldSpec = {
  name: NumericField;
  // The word printed on a Japanese estimate, shown as-is in every language
  // so the user can match it against the paper in their hand.
  term: string;
  gloss: string;
  unit: string;
  decimal?: boolean;
};

export function EstimateForm({ lang, dict }: Props) {
  const router = useRouter();
  const { point, estimate, setEstimate } = useCheck();
  const [fields, setFields] = useState<EstimateFields>(
    estimate?.fields ?? EMPTY_FIELDS,
  );
  const [errors, setErrors] = useState<EstimateErrors>({});

  if (point === null) {
    return null;
  }

  const errorText: Record<FieldError, string> = {
    rent: dict.errRent,
    yen: dict.errYen,
    months: dict.errMonths,
    guarantee: dict.errGuarantee,
  };

  const groups: { legend: string; fields: FieldSpec[] }[] = [
    {
      legend: dict.groupMonthly,
      fields: [
        { name: "rent", term: "家賃", gloss: dict.glossRent, unit: dict.unitYen },
        {
          name: "management",
          term: "管理費・共益費",
          gloss: dict.glossManagement,
          unit: dict.unitYen,
        },
      ],
    },
    {
      legend: dict.groupContract,
      fields: [
        {
          name: "deposit",
          term: "敷金",
          gloss: dict.glossDeposit,
          unit: dict.unitMonths,
          decimal: true,
        },
        {
          name: "keyMoney",
          term: "礼金",
          gloss: dict.glossKeyMoney,
          unit: dict.unitMonths,
          decimal: true,
        },
        {
          name: "brokerage",
          term: "仲介手数料",
          gloss: dict.glossBrokerage,
          unit: dict.unitMonths,
          decimal: true,
        },
        {
          name: "guaranteePercent",
          term: "保証会社 初回保証料",
          gloss: dict.glossGuarantee,
          unit: "%",
          decimal: true,
        },
      ],
    },
    {
      legend: dict.groupOther,
      fields: [
        {
          name: "fireInsurance",
          term: "火災保険",
          gloss: dict.glossFireInsurance,
          unit: dict.unitYen,
        },
        {
          name: "keyExchange",
          term: "鍵交換費",
          gloss: dict.glossKeyExchange,
          unit: dict.unitYen,
        },
        {
          name: "cleaning",
          term: "クリーニング費",
          gloss: dict.glossCleaning,
          unit: dict.unitYen,
        },
      ],
    },
  ];

  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = parseEstimate(fields);
    if ("errors" in parsed) {
      setErrors(parsed.errors);
      return;
    }
    setEstimate({ fields, input: parsed.input });
    router.push(`/${lang}/result`);
  }

  function skip() {
    setEstimate(null);
    router.push(`/${lang}/result`);
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6">
      <p className="text-sm text-ink-muted">{dict.estimateIntro}</p>

      {groups.map((group) => (
        <fieldset key={group.legend} className="mt-7">
          <legend className="text-sm font-semibold text-brand">
            {group.legend}
          </legend>
          {group.fields.map((field) => {
            const error = errors[field.name];
            return (
              <div key={field.name} className="mt-4">
                <label htmlFor={field.name} className="block">
                  <span lang="ja" className="font-semibold">
                    {field.term}
                  </span>
                  <span className="ml-2 text-sm text-ink-muted">
                    {field.gloss}
                  </span>
                </label>
                <div
                  className={`mt-1.5 flex h-12 items-center rounded-lg border px-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand ${
                    error ? "border-pin" : "border-line"
                  }`}
                >
                  <input
                    id={field.name}
                    type="text"
                    inputMode={field.decimal ? "decimal" : "numeric"}
                    autoComplete="off"
                    value={fields[field.name]}
                    onChange={(event) =>
                      setFields({ ...fields, [field.name]: event.target.value })
                    }
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${field.name}-error` : undefined}
                    className="min-w-0 flex-1 bg-transparent text-right text-base tabular-nums outline-none"
                  />
                  <span className="ml-2 shrink-0 text-sm text-ink-muted">
                    {field.unit}
                  </span>
                </div>
                {error && (
                  <p id={`${field.name}-error`} className="mt-1 text-sm text-pin">
                    {errorText[error]}
                  </p>
                )}
              </div>
            );
          })}
        </fieldset>
      ))}

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold text-brand">
          {dict.groupMoveIn}
        </legend>
        <label htmlFor="moveInDate" className="mt-4 block">
          <span lang="ja" className="font-semibold">
            入居日
          </span>
          <span className="ml-2 text-sm text-ink-muted">{dict.glossMoveIn}</span>
        </label>
        <input
          id="moveInDate"
          type="date"
          value={fields.moveInDate}
          onChange={(event) =>
            setFields({ ...fields, moveInDate: event.target.value })
          }
          className="mt-1.5 h-12 w-full rounded-lg border border-line bg-transparent px-3 text-base outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={fields.prepayNextMonth}
            onChange={(event) =>
              setFields({ ...fields, prepayNextMonth: event.target.checked })
            }
            className="size-5 accent-brand"
          />
          <span>{dict.prepayNextMonth}</span>
        </label>
      </fieldset>

      <button
        type="submit"
        className="mt-8 h-13 w-full rounded-xl bg-brand text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
      >
        {dict.seeResult}
      </button>
      <button
        type="button"
        onClick={skip}
        className="mt-2 h-12 w-full rounded-xl text-base font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-surface"
      >
        {dict.skipEstimate}
      </button>
    </form>
  );
}
