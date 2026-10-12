"use client";

import { useI18n } from "@/lib/i18n";
import type { Card, Level } from "@/lib/types";

const LEVEL_STARS: Record<Level, number> = { easy: 1, medium: 2, hard: 3 };

function CornerIndex({
  level,
  label,
  rotated,
}: {
  level: Level;
  label: string;
  rotated?: boolean;
}) {
  const count = LEVEL_STARS[level];
  return (
    <div
      className={`relative flex items-start justify-between gap-4 text-left ${rotated ? "rotate-180" : ""}`}
    >
      <span role="img" aria-label={`${count} / 3`} className="flex text-xl leading-none">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="text-accent">
            ★
          </span>
        ))}
      </span>
      <span className="pt-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-muted">
        {label}
      </span>
    </div>
  );
}

export default function CardView({ card, lang }: { card: Card; lang: "ru" | "en" }) {
  const { t } = useI18n();
  const body = lang === "en" ? (card.bodyEn ?? card.body) : card.body;
  const label = t(`card_${card.kind}`);

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
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(245,245,244,0.06)_0_1px,transparent_1px_12px)]"
        />
        <CornerIndex level={card.level} label={label} />
        <div className="relative my-auto flex flex-col items-center gap-8 py-8">
          <div aria-hidden className="h-0.5 w-12 rounded-full bg-accent" />
          <p className="max-w-md break-words text-2xl font-medium leading-relaxed text-foreground sm:text-3xl sm:leading-relaxed">
            {body}
          </p>
        </div>
        <CornerIndex level={card.level} label={label} rotated />
      </article>
    </div>
  );
}
