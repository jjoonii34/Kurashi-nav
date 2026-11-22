"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionary";
import type { Lang } from "@/i18n/langs";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

export function StepTabs({ lang, dict }: Props) {
  const pathname = usePathname();
  // A tab without a path is a screen that is not built yet.
  const tabs: { label: string; path?: string }[] = [
    { label: dict.tabMap, path: `/${lang}` },
    { label: dict.tabEstimate, path: `/${lang}/estimate` },
    { label: dict.tabResult },
    { label: dict.tabRoom },
  ];

  return (
    <nav
      aria-label={dict.stepsLabel}
      className="flex h-11 px-2 text-sm lg:order-2 lg:ml-10 lg:h-14 lg:px-0 lg:text-base"
    >
      {tabs.map(({ label, path }) => {
        if (path === undefined) {
          return (
            <span
              key={label}
              aria-disabled="true"
              className="flex flex-1 items-center justify-center text-ink-muted/50 lg:flex-none lg:px-5"
            >
              {label}
            </span>
          );
        }
        const current = pathname === path;
        return (
          <Link
            key={label}
            href={path}
            aria-current={current ? "page" : undefined}
            className={`flex flex-1 items-center justify-center border-b-2 lg:flex-none lg:px-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
              current
                ? "border-brand font-semibold text-brand"
                : "border-transparent text-ink-muted"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
