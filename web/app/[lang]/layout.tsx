import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";
import { dictionaryFor } from "@/i18n/dictionary";
import { LANGS, isLang } from "@/i18n/langs";
import { LocationProvider } from "@/state/location";
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
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <Link href={`/${lang}`} className="text-base font-bold text-brand">
            Kurashi Nav
          </Link>
          <LangSwitcher current={lang} label={dict.languageLabel} />
        </header>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
