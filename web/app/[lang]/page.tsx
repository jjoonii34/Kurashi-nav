import Link from "next/link";
import { notFound } from "next/navigation";
import { FloorPlan } from "@/components/FloorPlan";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

const SHELL = "mx-auto w-full max-w-[1280px] px-5 lg:px-10";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  const promises = [
    { title: dict.homeOfficialTitle, body: dict.homeOfficialBody },
    { title: dict.homeNoStoreTitle, body: dict.homeNoStoreBody },
    { title: dict.homeLangsTitle, body: dict.homeLangsBody },
    { title: dict.homeFreeTitle, body: dict.homeFreeBody },
  ];
  // `term` is the word the user will meet on Japanese paperwork.
  const checks = [
    { term: "ハザードマップ", title: dict.homeHazardTitle, body: dict.homeHazardBody },
    { term: "用途地域・学区", title: dict.homeAreaTitle, body: dict.homeAreaBody },
    { term: "初期費用", title: dict.homeCostTitle, body: dict.homeCostBody },
    { term: "畳・㎡", title: dict.homeRoomTitle, body: dict.homeRoomBody },
  ];
  const steps = [dict.homeStep1, dict.homeStep2, dict.homeStep3];

  return (
    <main className="flex-1">
      <section className="bg-brand-deep text-white">
        <div
          className={`${SHELL} grid gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-20 lg:py-24`}
        >
          <div>
            <h1 className="text-balance text-[2.5rem] font-extrabold leading-[1.12] lg:text-7xl">
              {dict.homeTitle}
            </h1>
            <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-white/75 lg:mt-7 lg:text-xl lg:leading-relaxed">
              {dict.homeLead}
            </p>
            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 lg:mt-10">
              <Link
                href={`/${lang}/map`}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-[17px] font-bold text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-surface lg:h-16 lg:px-10 lg:text-lg"
              >
                {dict.homeStart}
              </Link>
              <Link
                href={`/${lang}/room`}
                className="inline-flex h-12 items-center justify-center font-semibold text-white underline decoration-white/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {dict.homeRoomOnly}
              </Link>
            </div>
          </div>
          <FloorPlan className="w-full max-w-[560px] justify-self-center text-white lg:justify-self-end" />
        </div>
      </section>

      <section className="border-b border-line">
        <ul className={`${SHELL} grid grid-cols-2 gap-x-6 gap-y-7 py-9 lg:grid-cols-4 lg:py-12`}>
          {promises.map((promise) => (
            <li key={promise.title}>
              <p className="text-lg font-bold lg:text-xl">{promise.title}</p>
              <p className="mt-1 text-sm text-ink-muted lg:text-base">
                {promise.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${SHELL} py-12 lg:py-20`}>
        <h2 className="text-2xl font-extrabold lg:text-4xl">
          {dict.homeChecksTitle}
        </h2>
        <ul className="mt-6 border-t-2 border-ink lg:mt-10">
          {checks.map((check) => (
            <li
              key={check.term}
              className="grid gap-x-10 gap-y-1 border-b border-line py-5 lg:grid-cols-[14rem_17rem_1fr] lg:items-baseline lg:py-7"
            >
              <span lang="ja" className="text-sm font-semibold text-brand lg:text-base">
                {check.term}
              </span>
              <span className="text-xl font-bold lg:text-2xl">{check.title}</span>
              <span className="text-ink-muted lg:text-lg">{check.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface">
        <div className={`${SHELL} py-12 lg:py-20`}>
          <h2 className="text-2xl font-extrabold lg:text-4xl">
            {dict.homeStepsTitle}
          </h2>
          <ol className="mt-6 grid gap-3 lg:mt-10 lg:grid-cols-3 lg:gap-5">
            {steps.map((step, index) => (
              <li
                key={step}
                className="flex items-center gap-5 rounded-3xl bg-white p-6 lg:flex-col lg:items-start lg:gap-8 lg:p-8"
              >
                <span className="text-4xl font-extrabold tabular-nums text-brand lg:text-6xl">
                  {index + 1}
                </span>
                <span className="text-lg font-semibold lg:text-xl">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${SHELL} py-12 lg:py-20`}>
        <div className="rounded-3xl bg-brand-deep px-6 py-9 text-white lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
          <div>
            <h2 className="text-2xl font-extrabold lg:text-3xl">
              {dict.homeClosingTitle}
            </h2>
            <p className="mt-3 max-w-[40rem] text-sm leading-relaxed text-white/70 lg:text-base lg:leading-relaxed">
              {dict.homeDisclaimer}
            </p>
          </div>
          <Link
            href={`/${lang}/map`}
            className="mt-7 inline-flex h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-white px-8 text-[17px] font-bold text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-surface lg:mt-0 lg:w-auto"
          >
            {dict.homeStart}
          </Link>
        </div>
      </section>
    </main>
  );
}
