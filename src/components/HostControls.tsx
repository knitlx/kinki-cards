"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LEVELS, type RoomState } from "@/lib/types";

export default function HostControls({
  code,
  state,
  onUpdateState,
}: {
  code: string;
  state: RoomState;
  onUpdateState?: (next: RoomState) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [optimisticLevel, setOptimisticLevel] = useState<string | null>(null);

  const activeLevel = (optimisticLevel ?? state.currentLevel) as (typeof LEVELS)[number];

  async function changeLevel(newLevel: (typeof LEVELS)[number]) {
    if (activeLevel === newLevel) return;
    setOptimisticLevel(newLevel);
    try {
      const secret = localStorage.getItem(`party:hostSecret:${code}`) ?? "";
      const res = await fetch(`/api/rooms/${code}/level`, {
        method: "POST",
        headers: {
          "x-host-secret": secret,
          "content-type": "application/json",
        },
        body: JSON.stringify({ level: newLevel }),
      });
      if (res.ok) {
        const nextState = (await res.json()) as RoomState;
        if (nextState && onUpdateState) {
          onUpdateState(nextState);
        }
      }
    } finally {
      setOptimisticLevel(null);
    }
  }

  async function post(path: string, body?: unknown) {
    if (busy) return;
    const secret = localStorage.getItem(`party:hostSecret:${code}`) ?? "";
    setBusy(true);
    try {
      const res = await fetch(`/api/rooms/${code}/${path}`, {
        method: "POST",
        headers: {
          "x-host-secret": secret,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const nextState = (await res.json()) as RoomState;
        if (nextState && onUpdateState) {
          onUpdateState(nextState);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  const deckEmpty = state.counts[activeLevel].remaining === 0;

  return (
    <section className="flex flex-col gap-3 rounded-3xl border border-red-950/40 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-md">
      <button
        type="button"
        onClick={() => post("next")}
        disabled={busy || deckEmpty}
        className="min-h-13 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-lg font-bold tracking-wide text-white shadow-lg shadow-red-950/60 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
      >
        {busy ? t("loading") : t("next")}
      </button>
      <div className="flex gap-2">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => changeLevel(l)}
            aria-pressed={activeLevel === l}
            className={`min-h-12 flex-1 rounded-2xl px-3 py-2 text-lg font-bold tracking-widest transition-all active:scale-95 ${
              activeLevel === l
                ? "border border-rose-500/80 bg-rose-600 text-white shadow-md shadow-rose-950/50"
                : "border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
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
        className="min-h-11 rounded-2xl border border-zinc-800 bg-zinc-950/60 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 active:scale-[0.98] disabled:opacity-40"
      >
        {t("reshuffle")}
      </button>
    </section>
  );

}
