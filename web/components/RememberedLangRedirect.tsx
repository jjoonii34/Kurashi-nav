"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { rememberedLang } from "@/i18n/remember";

// A static export has no server to redirect, so the browser does it after
// the picker has loaded. First-time visitors simply keep seeing the picker.
export function RememberedLangRedirect() {
  const router = useRouter();

  useEffect(() => {
    const lang = rememberedLang();
    if (lang !== null) {
      router.replace(`/${lang}`);
    }
  }, [router]);

  return null;
}
