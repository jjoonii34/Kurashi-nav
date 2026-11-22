"use client";

import { useRouter } from "next/navigation";
import { useId } from "react";
import { PlaceSearch } from "@/components/PlaceSearch";
import type { Dictionary } from "@/i18n/dictionary";
import type { Lang } from "@/i18n/langs";
import { useCheck } from "@/state/check";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

const STAY_MONTHS = [3, 6, 12, 24, 36];
const LONGEST = 36;

// The first questions on the home page: where, and for how long. Both are
// optional; the map opens either way.
export function HomeStart({ lang, dict }: Props) {
  const router = useRouter();
  const { stayMonths, setStayMonths } = useCheck();
  const stayId = useId();

  function stayLabel(months: number): string {
    if (months === LONGEST) {
      return dict.stayLong;
    }
    return months < 24
      ? dict.stayMonths.replace("{n}", String(months))
      : dict.stayYears.replace("{n}", String(months / 12));
  }

  return (
    <div className="rounded-3xl bg-white/10 p-4 lg:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:gap-3">
        <div>
          <p className="mb-2 text-sm font-semibold text-white">{dict.homeWhere}</p>
          <PlaceSearch dict={dict} />
        </div>
        <div>
          <label
            htmlFor={stayId}
            className="mb-2 block text-sm font-semibold text-white"
          >
            {dict.homeStay}
          </label>
          <select
            id={stayId}
            value={stayMonths ?? ""}
            onChange={(event) =>
              setStayMonths(
                event.target.value === "" ? null : Number(event.target.value),
              )
            }
            className="h-13 w-full rounded-2xl bg-white px-4 text-base text-ink outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">{dict.stayUnknown}</option>
            {STAY_MONTHS.map((months) => (
              <option key={months} value={months}>
                {stayLabel(months)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={() => router.push(`/${lang}/map`)}
        className="mt-4 h-14 w-full rounded-2xl bg-white text-[17px] font-bold text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-surface"
      >
        {dict.homeStart}
      </button>
    </div>
  );
}
