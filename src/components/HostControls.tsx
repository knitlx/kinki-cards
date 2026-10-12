"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LEVELS, type RoomState } from "@/lib/types";

export default function HostControls({
  code,
  state,
  onDone,
}: {
  code: string;
  state: RoomState;
  onDone: () => void | Promise<void>;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);

  async function post(path: string, body?: unknown) {
    if (busy) return;
    const secret = localStorage.getItem(`party:hostSecret:${code}`) ?? "";
    setBusy(true);
    try {
      await fetch(`/api/rooms/${code}/${path}`, {
        method: "POST",
        headers: {
          "x-host-secret": secret,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      await onDone();
    } finally {
      setBusy(false);
    }
  }

  const deckEmpty = state.counts[state.currentLevel].remaining === 0;

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-black/10 p-4 dark:border-white/15">
      <button
        type="button"
        onClick={() => post("next")}
        disabled={busy || deckEmpty}
        className="min-h-12 rounded-xl bg-foreground px-5 py-3 text-lg font-semibold text-background transition-opacity disabled:opacity-40"
      >
        {t("next")}
      </button>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => post("level", { level: l })}
            disabled={busy}
            aria-pressed={state.currentLevel === l}
            className={`min-h-12 flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-40 ${
              state.currentLevel === l
                ? "bg-foreground text-background"
                : "border border-black/15 hover:bg-foreground/5 dark:border-white/20"
            }`}
          >
            {t(`level_${l}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => post("reshuffle")}
        disabled={busy}
        className="min-h-12 rounded-xl border border-black/15 px-5 py-3 text-lg font-semibold transition-colors hover:bg-foreground/5 disabled:opacity-40 dark:border-white/20"
      >
        {t("reshuffle")}
      </button>
    </section>
  );
}
