import Link from "next/link";
import { notFound } from "next/navigation";
import { FloorPlan } from "@/components/FloorPlan";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

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
      <section className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:px-10 lg:py-20">
          <div>
            <h1 className="text-balance break-keep text-4xl font-bold leading-[1.15] tracking-tight lg:text-6xl">
              {dict.homeTitle}
            </h1>
            <p className="mt-4 max-w-[34rem] break-keep text-base leading-relaxed text-ink-muted lg:mt-6 lg:text-lg">
              {dict.homeLead}
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href={`/${lang}/map`}
                className="inline-flex h-13 items-center justify-center rounded-xl bg-brand px-8 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed"
              >
                {dict.homeStart}
              </Link>
              <Link
                href={`/${lang}/room`}
                className="inline-flex h-12 items-center justify-center font-semibold text-brand underline decoration-brand/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                {dict.homeRoomOnly}
              </Link>
            </div>
          </div>
          <FloorPlan className="w-full max-w-[540px] justify-self-center lg:justify-self-end" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 py-10 lg:px-10 lg:py-16">
        <h2 className="text-xl font-bold lg:text-2xl">{dict.homeChecksTitle}</h2>
        <ul className="mt-5 border-t-2 border-ink">
          {checks.map((check) => (
            <li
              key={check.term}
              className="grid gap-x-10 gap-y-1 border-b border-line py-4 lg:grid-cols-[13rem_15rem_1fr] lg:items-baseline lg:py-6"
            >
              <span lang="ja" className="text-sm font-semibold text-brand lg:text-base">
                {check.term}
              </span>
              <span className="text-lg font-bold">{check.title}</span>
              <span className="break-keep text-ink-muted">{check.body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-5 pb-10 lg:px-10 lg:pb-16">
        <h2 className="text-xl font-bold lg:text-2xl">{dict.homeStepsTitle}</h2>
        <ol className="mt-5 grid gap-5 lg:grid-cols-3 lg:gap-10">
          {steps.map((step, index) => (
            <li key={step} className="flex items-baseline gap-4">
              <span className="text-3xl font-bold tabular-nums text-brand lg:text-4xl">
                {index + 1}
              </span>
              <span className="break-keep text-base lg:text-lg">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-[1280px] px-5 py-8 text-sm leading-relaxed text-ink-muted lg:px-10">
          <p className="font-semibold text-ink">{dict.homePrivacy}</p>
          <p className="mt-1">{dict.homeDisclaimer}</p>
        </div>
      </footer>
    </main>
  );
}
