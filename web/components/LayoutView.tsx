"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  getRoomLayout,
  type ApiFailure,
  type RoomLayout,
} from "@/api/client";
import type { Dictionary } from "@/i18n/dictionary";
import { toApiLang, type Lang } from "@/i18n/langs";

type Props = {
  lang: Lang;
  dict: Dictionary;
};

type State =
  | { status: "loading" }
  | { status: "failed"; reason: ApiFailure }
  | { status: "done"; layout: RoomLayout };

const COMMON_CODES = ["1R", "1K", "1DK", "1LDK", "2LDK"];

export function LayoutView({ lang, dict }: Props) {
  const [text, setText] = useState("1K");
  const [code, setCode] = useState("1K");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getRoomLayout(code, toApiLang(lang), controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      setState(
        result.ok
          ? { status: "done", layout: result.data }
          : { status: "failed", reason: result.reason },
      );
    });
    return () => controller.abort();
  }, [code, lang]);

  function show(next: string) {
    // NFKC turns full-width "１ＬＤＫ" from a Japanese keyboard into ASCII.
    const cleaned = next.normalize("NFKC").trim().toUpperCase();
    if (cleaned === "" || cleaned === code) {
      return;
    }
    setText(cleaned);
    setState({ status: "loading" });
    setCode(cleaned);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    show(text);
  }

  const failureText: Record<ApiFailure, string> = {
    network: dict.resultFailedNetwork,
    invalid: dict.layoutInvalid,
    server: dict.resultFailedServer,
  };

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="text-xl font-extrabold lg:text-2xl">{dict.layoutTitle}</h2>
      <p className="mt-2 text-sm text-ink-muted">{dict.layoutIntro}</p>

      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          aria-label={dict.layoutCodeLabel}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="h-14 min-w-0 flex-1 rounded-2xl bg-surface px-4 text-base outline-none ring-2 ring-transparent focus:ring-brand"
        />
        <button
          type="submit"
          className="h-14 shrink-0 rounded-2xl bg-brand px-6 text-[17px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
        >
          {dict.roomShow}
        </button>
      </form>
      <ul className="mt-3 flex flex-wrap gap-2">
        {COMMON_CODES.map((common) => (
          <li key={common}>
            <button
              type="button"
              onClick={() => show(common)}
              aria-pressed={common === code}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                common === code
                  ? "bg-brand text-white"
                  : "bg-surface active:bg-line"
              }`}
            >
              {common}
            </button>
          </li>
        ))}
      </ul>

      {state.status === "loading" && (
        <p role="status" className="mt-6 text-ink-muted">
          {dict.layoutLoading}
        </p>
      )}

      {state.status === "failed" && (
        <p role="status" className="mt-6 text-sm text-alert">
          {failureText[state.reason]}
        </p>
      )}

      {state.status === "done" && (
        <div className="mt-6">
          <p className="text-lg font-bold">
            {state.layout.code}
            <span className="ml-2 font-normal">{state.layout.summary}</span>
          </p>
          <dl className="mt-3 border-t border-line">
            {state.layout.parts.map((part) => (
              <div
                key={part.code}
                className="flex gap-4 border-b border-line py-3"
              >
                <dt className="w-12 shrink-0 font-bold text-brand">{part.code}</dt>
                <dd className="text-sm leading-relaxed">{part.explanation}</dd>
              </div>
            ))}
          </dl>
          {state.layout.min_size_guideline && (
            <p className="mt-4 rounded-2xl bg-surface p-4 text-sm leading-relaxed">
              <span className="font-semibold">
                {dict.layoutGuideline
                  .replace("{code}", state.layout.min_size_guideline.code)
                  .replace("{jo}", String(state.layout.min_size_guideline.min_jo))
                  .replace(
                    "{sqm}",
                    String(state.layout.min_size_guideline.min_sqm),
                  )}
              </span>
              <span className="mt-1 block text-ink-muted">
                {state.layout.min_size_guideline.note}
              </span>
            </p>
          )}
        </div>
      )}
    </section>
  );
}
