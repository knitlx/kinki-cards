"use client";

import { useI18n } from "@/lib/i18n";
import type { Card } from "@/lib/types";

export default function CardView({ card, lang }: { card: Card; lang: "ru" | "en" }) {
  const { t } = useI18n();
  const body = lang === "en" ? (card.bodyEn ?? card.body) : card.body;

  return (
    <article className="flex min-h-[45vh] flex-col items-center justify-center gap-6 rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm dark:border-white/15 dark:bg-zinc-900">
      <span className="rounded-full bg-foreground px-4 py-1 text-sm font-semibold uppercase tracking-wide text-background">
        {t(`level_${card.level}`)}
      </span>
      <p className="text-2xl font-medium leading-snug sm:text-3xl">{body}</p>
    </article>
  );
}
