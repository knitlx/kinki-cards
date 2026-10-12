"use client";

import { useI18n, type Lang } from "@/lib/i18n";

const LANGS: Lang[] = ["en", "ru"];

export default function LangToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-all ${
            lang === l
              ? "bg-rose-600 text-white shadow-md shadow-rose-950/50"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );

}
