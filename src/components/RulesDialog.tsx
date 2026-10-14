"use client";

import { useEffect, useId, useRef } from "react";
import { useI18n } from "@/lib/i18n";

const RULE_KEYS = ["rule_1", "rule_2", "rule_3", "rule_4", "rule_5", "rule_6"] as const;

export default function RulesDialog({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 p-4 backdrop-blur-md"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        className="animate-card-in flex max-h-[90vh] w-full max-w-md flex-col gap-5 overflow-y-auto rounded-3xl border border-border/40 bg-surface p-6 shadow-2xl shadow-black/60"
      >
        <h2
          id={titleId}
          className="text-center text-2xl font-black uppercase tracking-tight text-foreground"
        >
          {t("rulesTitle")}
        </h2>
        <ol className="flex flex-col gap-3">
          {RULE_KEYS.map((key, i) => (
            <li key={key} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
              <span
                aria-hidden
                className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent"
              >
                {i + 1}
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
        <p className="rounded-2xl border border-accent/30 bg-accent/10 p-4 text-center text-base font-bold text-foreground">
          {t("rulesMain")}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="min-h-13 rounded-2xl bg-accent px-5 py-3 text-lg font-bold text-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent/90 active:scale-[0.98]"
        >
          {t("rulesGotIt")}
        </button>
      </section>
    </div>
  );
}
