import { notFound } from "next/navigation";
import { EstimateForm } from "@/components/EstimateForm";
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
    <main className="mx-auto w-full max-w-md px-5 pb-10 pt-5 lg:max-w-xl lg:pt-10">
      <h1 className="text-2xl font-extrabold lg:text-3xl">{dict.estimateTitle}</h1>
      <SelectedLocation lang={lang} dict={dict} />
      <EstimateForm lang={lang} dict={dict} />
    </main>
  );
}
