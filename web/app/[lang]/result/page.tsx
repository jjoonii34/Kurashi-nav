import { notFound } from "next/navigation";
import { SelectedLocation } from "@/components/SelectedLocation";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Result({ params }: PageProps<"/[lang]/result">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-10 pt-5 lg:max-w-xl lg:pt-10">
      <h1 className="text-lg font-bold lg:text-2xl">{dict.resultTitle}</h1>
      <SelectedLocation lang={lang} dict={dict} />
    </main>
  );
}
