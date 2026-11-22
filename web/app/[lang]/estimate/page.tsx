import { notFound } from "next/navigation";
import { SelectedLocation } from "@/components/SelectedLocation";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Estimate({
  params,
}: PageProps<"/[lang]/estimate">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  return (
    <main className="mx-auto w-full max-w-md p-5">
      <h1 className="text-lg font-bold">{dict.estimateTitle}</h1>
      <SelectedLocation lang={lang} dict={dict} />
    </main>
  );
}
