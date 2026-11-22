"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { LANGS, LANG_NAMES, type Lang } from "@/i18n/langs";
import { LangLink } from "./LangLink";

type Props = {
  current: Lang;
  label: string;
};

export function LangSwitcher({ current, label }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const menu = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function close(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  // "/ko/room" → "/room": keep the page, swap only the language segment.
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav
      ref={menu}
      aria-label={label}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-brand active:bg-surface"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z" />
        </svg>
        <span lang={current}>{LANG_NAMES[current]}</span>
      </button>
      <ul
        id={listId}
        hidden={!open}
        onClick={() => setOpen(false)}
        className="absolute right-0 top-full z-40 mt-1 min-w-36 rounded-2xl bg-white py-1.5 shadow-[0_2px_14px_rgba(0,0,0,0.18)]"
      >
        {LANGS.map((lang) => (
          <li key={lang}>
            <LangLink
              lang={lang}
              href={rest ? `/${lang}/${rest}` : `/${lang}`}
              current={lang === current}
              className={`block px-4 py-2.5 text-[15px] focus-visible:bg-surface focus-visible:outline-none active:bg-surface ${
                lang === current ? "font-bold text-brand" : "text-ink"
              }`}
            >
              {LANG_NAMES[lang]}
            </LangLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
