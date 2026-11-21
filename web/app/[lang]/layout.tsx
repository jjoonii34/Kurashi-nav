import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LangSwitcher } from "@/components/LangSwitcher";
import { dictionaryFor } from "@/i18n/dictionary";
import { LANGS, isLang } from "@/i18n/langs";
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
      <body>
        <header className="mx-auto flex max-w-md justify-end p-4">
          <LangSwitcher current={lang} label={dict.languageLabel} />
        </header>
        {children}
      </body>
    </html>
  );
}
