import { LangLink } from "@/components/LangLink";
import { RememberedLangRedirect } from "@/components/RememberedLangRedirect";
import { APP_NAME } from "@/i18n/app";
import { LANGS, LANG_NAMES } from "@/i18n/langs";

export default function LanguagePicker() {
  return (
    <main className="mx-auto max-w-md p-4">
      <RememberedLangRedirect />
      <h1 className="text-3xl font-extrabold text-brand">{APP_NAME}</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {LANGS.map((lang) => (
          <li key={lang}>
            <LangLink
              lang={lang}
              href={`/${lang}`}
              className="block rounded-2xl bg-surface p-5 text-lg font-semibold active:bg-line"
            >
              {LANG_NAMES[lang]}
            </LangLink>
          </li>
        ))}
      </ul>
    </main>
  );
}
