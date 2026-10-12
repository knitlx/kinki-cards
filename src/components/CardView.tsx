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
    <article className="relative flex min-h-[48vh] flex-col items-center justify-center gap-8 overflow-hidden rounded-3xl border border-border/40 bg-surface p-6 text-center shadow-2xl shadow-accent/10 backdrop-blur-md sm:p-8">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5 text-base font-black tracking-widest text-accent">
          {t(`level_${card.level}`)}
        </span>
        <span className="inline-flex items-center rounded-full border border-border/40 bg-surface-raised px-4 py-1.5 text-xs font-black uppercase tracking-wider text-muted">
          {t(`card_${kind}`)}
        </span>
      </div>
      <p className="max-w-md break-words text-2xl font-medium leading-relaxed text-foreground sm:text-3xl sm:leading-relaxed">
        {body}
      </p>
    </article>
  );

}

