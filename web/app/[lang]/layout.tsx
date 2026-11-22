import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";
import { StepTabs } from "@/components/StepTabs";
import { dictionaryFor } from "@/i18n/dictionary";
import { LANGS, isLang } from "@/i18n/langs";
import { CheckProvider } from "@/state/check";
import "pretendard-jp/dist/web/variable/pretendardvariable-jp-dynamic-subset.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Kurashi Nav",
  description: "Housing check for foreign residents in Japan.",
};

// A static export can only serve the pages built here.
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  return (
    <html lang={lang}>
      <body className="flex min-h-dvh flex-col">
        {/* Phone: logo row above the tab row. Desktop: one row, tabs between. */}
        <header className="shrink-0 border-b border-line lg:flex lg:h-14 lg:items-center lg:px-6">
          <div className="flex h-14 items-center justify-between border-b border-line px-4 lg:contents">
            <Link
              href={`/${lang}`}
              className="text-lg font-extrabold text-brand lg:order-1 lg:text-xl"
            >
              Kurashi Nav
            </Link>
            <div className="lg:order-3 lg:ml-auto">
              <LangSwitcher current={lang} label={dict.languageLabel} />
            </div>
          </div>
          <StepTabs lang={lang} dict={dict} />
        </header>
        <CheckProvider>{children}</CheckProvider>
      </body>
    </html>
  );
}
