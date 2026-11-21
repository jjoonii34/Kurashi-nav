"use client";

import { usePathname } from "next/navigation";
import { LANGS, LANG_NAMES, type Lang } from "@/i18n/langs";
import { LangLink } from "./LangLink";

type Props = {
  current: Lang;
  label: string;
};

export function LangSwitcher({ current, label }: Props) {
  const pathname = usePathname();
  // "/ko/room" → "/room": keep the page, swap only the language segment.
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label={label} className="flex gap-3 text-sm">
      {LANGS.map((lang) => (
        <LangLink
          key={lang}
          lang={lang}
          href={rest ? `/${lang}/${rest}` : `/${lang}`}
          current={lang === current}
          className={lang === current ? "font-bold underline" : "underline"}
        >
          {LANG_NAMES[lang]}
        </LangLink>
      ))}
    </nav>
  );
}
