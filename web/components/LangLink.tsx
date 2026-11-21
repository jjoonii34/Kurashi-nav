"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/i18n/langs";
import { rememberLang } from "@/i18n/remember";

type Props = {
  lang: Lang;
  href: string;
  className?: string;
  current?: boolean;
  children: ReactNode;
};

export function LangLink({ lang, href, className, current, children }: Props) {
  return (
    <Link
      href={href}
      lang={lang}
      className={className}
      aria-current={current ? "true" : undefined}
      onClick={() => rememberLang(lang)}
    >
      {children}
    </Link>
  );
}
