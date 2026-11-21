import { notFound } from "next/navigation";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold">Kurashi Nav</h1>
      <p className="mt-2">{dict.tagline}</p>
    </main>
  );
}
