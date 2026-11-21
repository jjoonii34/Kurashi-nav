import { LangLink } from "@/components/LangLink";
import { RememberedLangRedirect } from "@/components/RememberedLangRedirect";
import { LANGS, LANG_NAMES } from "@/i18n/langs";

export default function LanguagePicker() {
  return (
    <main className="mx-auto max-w-md p-4">
      <RememberedLangRedirect />
      <h1 className="text-2xl font-bold">Kurashi Nav</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {LANGS.map((lang) => (
          <li key={lang}>
            <LangLink
              lang={lang}
              href={`/${lang}`}
              className="block rounded border p-4 text-lg"
            >
              {LANG_NAMES[lang]}
            </LangLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
