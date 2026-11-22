import { notFound } from "next/navigation";
import { LocationPicker } from "@/components/LocationPicker";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }

  return <LocationPicker lang={lang} dict={dictionaryFor(lang)} />;
}
