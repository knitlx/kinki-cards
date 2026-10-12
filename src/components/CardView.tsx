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
  const level = t(`level_${card.level}`);

  return (
    <div className="relative mx-3 pb-3">
      <div
        aria-hidden
        className="absolute inset-x-4 top-3 bottom-0 rounded-3xl border border-border/30 bg-surface-raised/50"
      />
      <div
        aria-hidden
        className="absolute inset-x-8 top-6 bottom-0 rounded-3xl border border-border/20 bg-surface-raised/25"
      />
      <article
        key={card.id}
        className="relative flex min-h-[52vh] animate-card-in flex-col justify-between overflow-hidden rounded-3xl border border-border/50 bg-surface p-6 text-center shadow-2xl shadow-black/60 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(245,245,244,0.035)_0_1px,transparent_1px_14px)]"
        />
        <div className="relative flex items-start justify-between gap-4 text-left">
          <span className="text-xl font-black tracking-widest text-accent">{level}</span>
          <span className="pt-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-muted">
            {t(`card_${kind}`)}
          </span>
        </div>
        <p className="relative my-auto max-w-md break-words py-8 text-2xl font-medium leading-relaxed text-foreground sm:text-3xl sm:leading-relaxed">
          {body}
        </p>
        <div className="relative flex rotate-180 items-start justify-between gap-4 text-left">
          <span className="text-xl font-black tracking-widest text-accent">{level}</span>
          <span className="pt-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-muted">
            {t(`card_${kind}`)}
          </span>
        </div>
      </article>
    </div>
  );
}
