"use client";

import Link from "next/link";
import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";
import { useRules } from "@/lib/rules";


export default function Header() {
  const { t } = useI18n();
  const { openRules } = useRules();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(212,32,47,0.6)]"
          />
          <span className="text-lg font-black uppercase tracking-widest text-foreground">
            KINKI <span className="text-accent">CARDS</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openRules}
            aria-label={t("rules")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/40 bg-surface text-sm font-bold text-muted transition-colors hover:text-foreground active:scale-95"
          >
            ?
          </button>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
