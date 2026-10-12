"use client";

import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["en", "ru"];

export default function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-border/40 bg-surface p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-colors ${
            lang === l
              ? "bg-accent text-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

}
