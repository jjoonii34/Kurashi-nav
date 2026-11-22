import type { Metadata } from "next";
import type { ReactNode } from "react";
import { APP_NAME } from "@/i18n/app";
import "@fontsource-variable/noto-sans-kr";
import "pretendard-jp/dist/web/variable/pretendardvariable-jp-dynamic-subset.css";
import "../globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Housing check for foreign residents in Japan.",
};

export default function PickerLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
