"use client";

import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-background/80 backdrop-blur dark:border-white/15">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <span className="text-base font-semibold tracking-tight">{t("appTitle")}</span>
        <LangToggle />
      </div>
    </header>
  );
}
