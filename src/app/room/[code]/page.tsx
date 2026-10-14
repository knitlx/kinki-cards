"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import CardView from "@/components/CardView";
import HostControls from "@/components/HostControls";
import RoomQr from "@/components/RoomQr";
import { useI18n } from "@/lib/i18n";
import { useRules } from "@/lib/rules";
import { useRoom } from "@/lib/useRoom";
import type { RoomState } from "@/lib/types";

const noopSubscribe = () => () => {};

function Loading() {
  const { t } = useI18n();
  return <p className="p-8 text-center text-foreground/60">{t("loading")}</p>;
}

export default function RoomPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Room />
    </Suspense>
  );
}

function Room() {
  const { code } = useParams<{ code: string }>();
  const { state, updateState, notFound } = useRoom(code);
  const { t, lang } = useI18n();
  const { openRules } = useRules();
  const [copied, setCopied] = useState(false);
  const isHost = useSyncExternalStore(
    noopSubscribe,
    () => !!localStorage.getItem(`party:hostSecret:${code}`),
    () => false,
  );
  const rulesOpened = useRef(false);

  useEffect(() => {
    if (state?.status === "lobby" && !rulesOpened.current) {
      rulesOpened.current = true;
      openRules();
    }
  }, [state?.status, openRules]);

  async function startGame() {
    const secret = localStorage.getItem(`party:hostSecret:${code}`);
    if (!secret) return;
    const res = await fetch(`/api/rooms/${code}/start`, {
      method: "POST",
      headers: { "x-host-secret": secret },
    });
    if (res.ok) updateState((await res.json()) as RoomState);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (notFound) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-xl font-semibold">{t("roomNotFound")}</p>
      </main>
    );
  }

  if (!state) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 p-6">
        <Loading />
      </main>
    );
  }

  const remaining = state.counts[state.currentLevel].remaining;
  const used = state.counts[state.currentLevel].used;
  const deckEmpty = state.status === "empty" || remaining === 0;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4">
      {state.status === "lobby" ? (
        <div className="flex flex-col gap-6 py-6">
          <section className="flex flex-col items-center gap-3 rounded-3xl border border-border/40 bg-surface p-8 text-center shadow-xl shadow-black/40 backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              {t("roomCode")}
            </p>
            <p className="text-5xl font-black tracking-[0.3em] text-foreground">
              {state.code}
            </p>
            <RoomQr />
          </section>
          <button
            type="button"
            onClick={copyLink}
            className="min-h-12 rounded-2xl border border-border/40 bg-surface-raised px-5 py-3 text-base font-bold text-foreground transition-colors hover:bg-surface-raised/70 active:scale-[0.98]"
          >
            {copied ? t("linkCopied") : t("copyLink")}
          </button>
          {isHost ? (
            <button
              type="button"
              onClick={startGame}
              className="min-h-13 rounded-2xl bg-accent px-5 py-3 text-lg font-bold text-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent/90 active:scale-[0.98]"
            >
              {t("start")}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/40 bg-surface/60 p-6 text-center text-sm font-semibold text-muted">
              <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              {t("waitingHost")}
            </div>
          )}
        </div>
      ) : (
        <>
          {state.activeCard ? (
            <CardView card={state.activeCard} lang={lang} />
          ) : (
            <div className="flex min-h-[48vh] items-center justify-center rounded-3xl border border-dashed border-border/40 bg-surface/40 p-6 text-center text-lg font-medium text-muted">
              {deckEmpty ? t("deckEmpty") : t("waitingHost")}
            </div>
          )}
          <div
            role="progressbar"
            aria-label={t("used")}
            aria-valuemin={0}
            aria-valuemax={used + remaining}
            aria-valuenow={used}
            className="h-1 w-full overflow-hidden rounded-full bg-surface-raised"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-500"
              style={{ width: `${used + remaining ? (used / (used + remaining)) * 100 : 0}%` }}
            />
          </div>
          {isHost && <HostControls code={code} state={state} onUpdateState={updateState} />}
        </>
      )}
    </main>
  );

}
