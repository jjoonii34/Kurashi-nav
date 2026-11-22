"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  checkHousing,
  type CheckFailure,
  type CostResult,
  type Report,
  type Section,
} from "@/api/client";
import type { Dictionary } from "@/i18n/dictionary";
import { toApiLang, type Lang } from "@/i18n/langs";
import { useCheck } from "@/state/check";
import { SelectedLocation } from "./SelectedLocation";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

type State =
  | { status: "loading" }
  | { status: "failed"; reason: CheckFailure }
  | { status: "done"; report: Report };

export function ResultView({ lang, dict }: Props) {
  const { point, estimate } = useCheck();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (point === null) {
      return;
    }
    // Leaving the page or retrying cancels the request still in flight.
    const controller = new AbortController();
    checkHousing(
      {
        lat: point.lat,
        lon: point.lon,
        lang: toApiLang(lang),
        cost: estimate?.input,
      },
      controller.signal,
    ).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      setState(
        result.ok
          ? { status: "done", report: result.report }
          : { status: "failed", reason: result.reason },
      );
    });
    return () => controller.abort();
  }, [point, estimate, lang, attempt]);

  if (point === null) {
    return <SelectedLocation lang={lang} dict={dict} />;
  }

  if (state.status === "loading") {
    return (
      <p role="status" className="mt-6 text-ink-muted">
        {dict.resultLoading}
      </p>
    );
  }

  if (state.status === "failed") {
    const failureText: Record<CheckFailure, string> = {
      network: dict.resultFailedNetwork,
      invalid: dict.resultFailedInvalid,
      server: dict.resultFailedServer,
    };
    return (
      <div role="alert" className="mt-6 rounded-xl bg-alert-surface p-4">
        <p>{failureText[state.reason]}</p>
        <button
          type="button"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt(attempt + 1);
          }}
          className="mt-3 h-11 rounded-lg bg-brand px-5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
        >
          {dict.retry}
        </button>
      </div>
    );
  }

  const { report } = state;
  const number = new Intl.NumberFormat(lang);
  const yen = (amount: number) => `${number.format(amount)} ${dict.unitYen}`;
  const ofKind = (...kinds: Section["kind"][]) =>
    report.sections.filter((section) => kinds.includes(section.kind));
  const prices = ofKind("price");

  return (
    <div className="mt-5 flex flex-col gap-4">
      {report.partial && (
        <p className="rounded-xl bg-alert-surface p-4 text-sm">
          {dict.partialNotice}
        </p>
      )}

      <Card title={dict.cardHazards}>
        {ofKind("hazard").map((section) => (
          <Row key={section.layer} label={section.title}>
            <HazardChip section={section} dict={dict} />
          </Row>
        ))}
      </Card>

      <Card title={dict.cardArea}>
        {ofKind("zoning", "school").map((section) => (
          <Row key={section.layer} label={section.title}>
            <AreaValue section={section} dict={dict} />
          </Row>
        ))}
      </Card>

      {prices.map((section) => (
        <Card key={section.layer} title={section.title}>
          <PriceBody section={section} dict={dict} format={number} />
        </Card>
      ))}

      <Card title={dict.cardCost}>
        {report.cost ? (
          <CostBody cost={report.cost} dict={dict} yen={yen} format={number} />
        ) : (
          <p className="py-3 text-sm text-ink-muted">{dict.noEstimate}</p>
        )}
      </Card>

      <footer className="mt-2 text-xs leading-relaxed text-ink-muted">
        <h2 className="font-semibold">{dict.sourcesTitle}</h2>
        <ul className="mt-1">
          {report.sources.map((source) => (
            <li key={source.id}>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {source.credit}
                </a>
              ) : (
                source.credit
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3">{report.disclaimer}</p>
      </footer>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line px-4 pb-2 pt-4">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-1 divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 text-right tabular-nums">{children}</span>
    </div>
  );
}

function Unavailable({ dict }: { dict: Dictionary }) {
  return (
    <span className="rounded-full border border-line px-2.5 py-1 text-sm text-ink-muted">
      {dict.chipUnavailable}
    </span>
  );
}

function HazardChip({ section, dict }: { section: Section; dict: Dictionary }) {
  if (section.status === "unavailable") {
    return <Unavailable dict={dict} />;
  }
  return section.hit ? (
    <span className="rounded-full bg-alert-surface px-2.5 py-1 text-sm font-semibold text-alert">
      {dict.chipInArea}
    </span>
  ) : (
    <span className="rounded-full bg-surface px-2.5 py-1 text-sm text-ink-muted">
      {dict.chipNotInArea}
    </span>
  );
}

// Field names per layer as listed in internal/reinfolib/endpoints.go. They
// are unverified until M1-3, so a missing field falls back to plain text.
const AREA_FIELD: Record<string, string> = {
  zoning: "use_area_ja",
  school: "name",
};

function AreaValue({ section, dict }: { section: Section; dict: Dictionary }) {
  if (section.status === "unavailable") {
    return <Unavailable dict={dict} />;
  }
  if (!section.hit) {
    return <span className="text-ink-muted">{dict.noAreaData}</span>;
  }
  const value = section.features?.[0]?.[AREA_FIELD[section.kind]];
  return typeof value === "string" ? (
    <span lang="ja" className="font-semibold">
      {value}
    </span>
  ) : (
    <span>{dict.chipInArea}</span>
  );
}

function PriceBody({
  section,
  dict,
  format,
}: {
  section: Section;
  dict: Dictionary;
  format: Intl.NumberFormat;
}) {
  if (section.status === "unavailable") {
    return (
      <div className="py-3">
        <Unavailable dict={dict} />
      </div>
    );
  }
  const summary = section.price_summary;
  if (summary === undefined) {
    return <p className="py-3 text-sm text-ink-muted">{dict.noPriceData}</p>;
  }
  const unit = `${dict.unitYen}/㎡`;
  const price = summary.unit_price_yen_per_sqm;
  return (
    <>
      <Row label={dict.priceMedian}>
        <span className="text-lg font-bold">
          {format.format(price.median)} {unit}
        </span>
      </Row>
      <Row label={dict.priceRange}>
        {format.format(price.q1)} – {format.format(price.q3)} {unit}
      </Row>
      <Row label={dict.priceCount}>{format.format(summary.count)}</Row>
      {summary.period_from && summary.period_to && (
        <Row label={dict.pricePeriod}>
          {summary.period_from} – {summary.period_to}
        </Row>
      )}
      <p className="py-3 text-sm text-ink-muted">{dict.priceNote}</p>
    </>
  );
}

type LineCode = CostResult["lines"][number]["code"];

// The word on a Japanese estimate, as in the form.
const LINE_TERM: Record<LineCode, string> = {
  deposit: "敷金",
  key_money: "礼金",
  brokerage: "仲介手数料",
  guarantee: "保証会社 初回保証料",
  fire_insurance: "火災保険",
  key_exchange: "鍵交換費",
  cleaning: "クリーニング費",
  first_month_rent: "前家賃",
  prorated_rent: "日割り家賃",
  next_month_rent: "翌月家賃",
  other: "その他",
};

function CostBody({
  cost,
  dict,
  yen,
  format,
}: {
  cost: CostResult;
  dict: Dictionary;
  yen: (amount: number) => string;
  format: Intl.NumberFormat;
}) {
  const lineGloss: Record<LineCode, string> = {
    deposit: dict.glossDeposit,
    key_money: dict.glossKeyMoney,
    brokerage: dict.lineBrokerage,
    guarantee: dict.lineGuarantee,
    fire_insurance: dict.glossFireInsurance,
    key_exchange: dict.glossKeyExchange,
    cleaning: dict.lineCleaning,
    first_month_rent: dict.lineFirstMonth,
    prorated_rent: dict.lineProrated,
    next_month_rent: dict.lineNextMonth,
    other: dict.lineOther,
  };
  // The API sends warning text in English and expects the frontend to
  // localise by code; an unknown code falls back to that English text.
  const warningText: Record<string, string> = {
    brokerage_over_legal_cap: dict.warnBrokerageOverCap,
    brokerage_above_half_month: dict.warnBrokerageAboveHalf,
    key_money_high: dict.warnKeyMoneyHigh,
    optional_fees: dict.warnOptionalFees,
    total_high: dict.warnTotalHigh,
  };

  return (
    <>
      {cost.lines.map((line, index) => (
        <Row
          key={`${line.code}-${index}`}
          label={
            <>
              <span lang="ja" className="font-semibold">
                {line.label ?? LINE_TERM[line.code]}
              </span>
              <span className="block text-sm text-ink-muted">
                {lineGloss[line.code]}
              </span>
            </>
          }
        >
          {yen(line.amount_yen)}
        </Row>
      ))}
      <Row label={<span className="font-bold">{dict.costTotal}</span>}>
        <span className="text-lg font-bold">{yen(cost.total_yen)}</span>
        <span className="block text-sm text-ink-muted">
          {dict.costRentMonths.replace(
            "{n}",
            format.format(cost.total_in_rent_months),
          )}
        </span>
      </Row>
      {cost.warnings.length > 0 && (
        <ul className="flex flex-col gap-2 py-3">
          {cost.warnings.map((warning) => (
            <li
              key={warning.code}
              className={`rounded-xl p-3 text-sm ${
                warning.severity === "warning"
                  ? "bg-alert-surface text-alert"
                  : "bg-surface"
              }`}
            >
              {warningText[warning.code] ?? warning.message}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
