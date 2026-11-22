"use client";

import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionary";
import type { Lang } from "@/i18n/langs";
import { useCheck } from "@/state/check";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

export function SelectedLocation({ lang, dict }: Props) {
  const { point } = useCheck();

  if (point === null) {
    return (
      <div className="mt-4">
        <p className="text-sm text-ink-muted">{dict.noLocation}</p>
        <Link
          href={`/${lang}/map`}
          className="mt-3 inline-block font-semibold text-brand underline"
        >
          {dict.chooseLocation}
        </Link>
      </div>
    );
  }

  return (
    <dl className="mt-4 rounded-2xl bg-surface p-4">
      <dt className="text-sm text-ink-muted">{dict.selectedLocation}</dt>
      <dd className="mt-1 tabular-nums">
        {point.lat.toFixed(5)}, {point.lon.toFixed(5)}
      </dd>
    </dl>
  );
}
