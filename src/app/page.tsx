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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 p-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase bg-gradient-to-b from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          KINKI <span className="text-rose-600">CARDS</span>
        </h1>
        <p className="text-sm font-medium text-zinc-400">
          Party game • Synchronized in realtime
        </p>
      </div>

      <form
        onSubmit={createRoom}
        className="flex flex-col gap-4 rounded-3xl border border-red-950/40 bg-zinc-900/60 p-6 text-center shadow-xl backdrop-blur-md transition-all hover:border-red-900/60"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-100">{t("createRoom")}</h2>
          <p className="text-xs text-zinc-400">Start a new game as host</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="min-h-13 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3 text-lg font-bold text-white shadow-lg shadow-red-950/60 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
        >
          {busy ? t("loading") : t("createRoom")}
        </button>
      </form>

      <form
        onSubmit={joinRoom}
        className="flex flex-col gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 text-center shadow-lg backdrop-blur-md transition-all hover:border-zinc-700"
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-100">{t("joinRoom")}</h2>
          <p className="text-xs text-zinc-400">Join an existing room using code</p>
        </div>
        <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {t("enterCode")}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            placeholder="ABCD"
            maxLength={6}
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-center text-2xl font-bold tracking-[0.25em] text-white outline-none transition-all placeholder:text-zinc-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="min-h-12 rounded-2xl border border-zinc-700 bg-zinc-800/80 px-5 py-3 text-base font-bold text-zinc-100 transition-all hover:bg-zinc-700 active:scale-[0.98] disabled:opacity-40"
        >
          {t("join")}
        </button>
      </form>

      {error && <p className="text-center text-sm font-semibold text-rose-500">{error}</p>}
    </main>
  );

}
