"use client";

import { Suspense, useState, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import CardView from "@/components/CardView";
import HostControls from "@/components/HostControls";
import Participants from "@/components/Participants";
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
  const { state, online, refresh, notFound } = useRoom(code);
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
        <>
          <section className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-foreground/60">
              {t("roomCode")}
            </p>
            <p className="text-5xl font-bold tracking-[0.3em]">{state.code}</p>
          </section>
          <button
            type="button"
            onClick={copyLink}
            className="min-h-12 rounded-xl border border-black/15 px-5 py-3 text-lg font-semibold transition-colors hover:bg-foreground/5 dark:border-white/20"
          >
            {copied ? t("linkCopied") : t("copyLink")}
          </button>
          <Participants participants={state.participants} online={online} />
          {isHost && (
            <button
              type="button"
              onClick={startGame}
              className="min-h-12 rounded-xl bg-foreground px-5 py-3 text-lg font-semibold text-background"
            >
              {t("start")}
            </button>
          )}
        </>
      ) : (
        <>
          {state.activeCard ? (
            <CardView card={state.activeCard} lang={lang} />
          ) : (
            <div className="flex min-h-[45vh] items-center justify-center rounded-3xl border border-dashed border-black/15 p-6 text-center text-lg font-medium text-foreground/60 dark:border-white/20">
              {deckEmpty ? t("deckEmpty") : t("waitingHost")}
            </div>
          )}
          <div className="flex justify-center gap-6 text-sm font-medium text-foreground/70">
            <span>
              {t("remaining")}: {remaining}
            </span>
            <span>
              {t("used")}: {used}
            </span>
          </div>
          <Participants participants={state.participants} online={online} />
          {isHost && <HostControls code={code} state={state} onDone={refresh} />}
        </>
      )}
    </main>
  );
}
