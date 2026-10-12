"use client";

import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["ru", "en"];

export default function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-black/10 p-0.5 dark:border-white/15">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-sm font-medium uppercase transition-colors ${
            lang === l
              ? "bg-foreground text-background"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
