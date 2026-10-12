"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      setBusy(false);
      setError(t("genericError"));
      return;
    }
    const data = (await res.json()) as {
      code: string;
      hostSecret: string;
    };
    localStorage.setItem(`party:hostSecret:${data.code}`, data.hostSecret);
    router.push(`/room/${data.code}`);
  }

  async function joinRoom(e: FormEvent) {
    e.preventDefault();
    const roomCode = code.trim().toUpperCase();
    if (!roomCode || busy) return;
    setBusy(true);
    setError(null);
    router.push(`/room/${roomCode}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 p-4 py-10">
      <div className="flex flex-col items-center gap-2 pb-4 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tight text-foreground sm:text-5xl">
          KINKI <span className="text-accent">CARDS</span>
        </h1>
      </div>

      <form onSubmit={createRoom}>
        <button
          type="submit"
          disabled={busy}
          className="min-h-14 w-full rounded-2xl bg-accent px-5 py-3 text-lg font-bold text-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent/90 active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? t("loading") : t("createRoom")}
        </button>
      </form>

      <form
        onSubmit={joinRoom}
        className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface p-6 text-center shadow-lg shadow-black/30 backdrop-blur-md"
      >
        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          {t("enterCode")}
          <input
            name="roomCode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
            placeholder="ABCD"
            maxLength={6}
            className="w-full rounded-2xl border border-border/40 bg-background/80 px-4 py-3 text-center text-2xl font-bold tracking-[0.25em] text-foreground placeholder:text-muted/60 transition-colors focus-visible:border-accent"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="min-h-12 rounded-2xl border border-border/40 bg-surface-raised px-5 py-3 text-base font-bold text-foreground transition-colors hover:bg-surface-raised/70 active:scale-[0.98] disabled:opacity-40"
        >
          {t("join")}
        </button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className="text-center text-sm font-semibold text-accent"
      >
        {error}
      </p>
    </main>
  );
}
