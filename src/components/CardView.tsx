"use client";

import { useI18n } from "@/lib/i18n";
import type { Card } from "@/lib/types";

function detectKind(body: string): "action" | "question" {
  const b = body.trim();
  if (
    b.startsWith("Расскажи") ||
    b.startsWith("Спроси") ||
    b.startsWith("Задай вопрос") ||
    b.startsWith("Был ли") ||
    b.startsWith("Как тебе") ||
    b.startsWith("Какой") ||
    b.startsWith("Какая") ||
    b.includes("и спроси") ||
    b.includes("Обсудите") ||
    b.includes("Поговорите с этим игроком")
  ) {
    return "question";
  }
  return "action";
}

export default function CardView({ card, lang }: { card: Card; lang: "ru" | "en" }) {
  const { t } = useI18n();
  const body = lang === "en" ? (card.bodyEn ?? card.body) : card.body;
  const kind = card.kind ?? detectKind(card.body);

  return (
    <article className="relative flex min-h-[48vh] flex-col items-center justify-center gap-8 rounded-3xl border border-red-950/50 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 text-center shadow-2xl shadow-red-950/30 backdrop-blur-md transition-all">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-base font-black tracking-widest text-amber-400 shadow-sm">
          {t(`level_${card.level}`)}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${
            kind === "question"
              ? "border border-zinc-700 bg-zinc-800/90 text-zinc-300"
              : "border border-rose-500/40 bg-rose-500/15 text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.25)]"
          }`}
        >
          {t(`card_${kind}`)}
        </span>
      </div>
      <p className="max-w-md text-2xl font-medium leading-relaxed text-zinc-100 sm:text-3xl sm:leading-relaxed">
        {body}
      </p>
    </article>
  );

}

