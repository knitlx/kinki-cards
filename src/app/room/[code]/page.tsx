"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import CardView from "@/components/CardView";
import HostControls from "@/components/HostControls";
import { useI18n } from "@/lib/i18n";
import { useRoom } from "@/lib/useRoom";

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
  const { state, refresh, updateState, notFound } = useRoom(code);
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const isHost = useSyncExternalStore(
    noopSubscribe,
    () => !!localStorage.getItem(`party:hostSecret:${code}`),
    () => false,
  );

  async function startGame() {
    const secret = localStorage.getItem(`party:hostSecret:${code}`);
    if (!secret) return;
    await fetch(`/api/rooms/${code}/start`, {
      method: "POST",
      headers: { "x-host-secret": secret },
    });
    await refresh();
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
          <section className="flex flex-col items-center gap-3 rounded-3xl border border-red-950/40 bg-zinc-900/50 p-8 text-center shadow-xl backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t("roomCode")}
            </p>
            <p className="text-5xl font-black tracking-[0.3em] text-white">
              {state.code}
            </p>
          </section>
          <button
            type="button"
            onClick={copyLink}
            className="min-h-12 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-5 py-3 text-base font-bold text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white active:scale-[0.98]"
          >
            {copied ? t("linkCopied") : t("copyLink")}
          </button>
          {isHost ? (
            <button
              type="button"
              onClick={startGame}
              className="min-h-13 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-red-950/60 transition-all hover:brightness-110 active:scale-[0.98]"
            >
              {t("start")}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 text-center text-sm font-semibold text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              {t("waitingHost")}
            </div>
          )}
        </div>
      ) : (
        <>
          {state.activeCard ? (
            <CardView card={state.activeCard} lang={lang} />
          ) : (
            <div className="flex min-h-[48vh] items-center justify-center rounded-3xl border border-dashed border-red-950/50 bg-zinc-900/30 p-6 text-center text-lg font-medium text-zinc-400">
              {deckEmpty ? t("deckEmpty") : t("waitingHost")}
            </div>
          )}
          <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <span>
              {t("remaining")}: <strong className="text-zinc-300">{remaining}</strong>
            </span>
            <span>
              {t("used")}: <strong className="text-zinc-300">{used}</strong>
            </span>
          </div>
          {isHost && <HostControls code={code} state={state} onUpdateState={updateState} />}
        </>
      )}
    </main>
  );

}
