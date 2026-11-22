import { notFound } from "next/navigation";
import { RoomView } from "@/components/RoomView";
import { dictionaryFor } from "@/i18n/dictionary";
import { isLang } from "@/i18n/langs";

export default async function Room({ params }: PageProps<"/[lang]/room">) {
  const { lang } = await params;
  if (!isLang(lang)) {
    notFound();
  }
  const dict = dictionaryFor(lang);

  return (
    <main className="mx-auto w-full max-w-md px-5 pb-10 pt-5 lg:max-w-2xl lg:pt-10">
      <h1 className="text-lg font-bold lg:text-2xl">{dict.roomTitle}</h1>
      <RoomView lang={lang} dict={dict} />
    </main>
  );
}
