"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createRoom(e: FormEvent) {
    e.preventDefault();
    const trimmed = createName.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      setBusy(false);
      setError(t("genericError"));
      return;
    }
    const data = (await res.json()) as {
      code: string;
      hostSecret: string;
      participantId: string;
    };
    localStorage.setItem("party:name", trimmed);
    localStorage.setItem(`party:hostSecret:${data.code}`, data.hostSecret);
    localStorage.setItem(`party:participantId:${data.code}`, data.participantId);
    router.push(`/room/${data.code}`);
  }

  async function joinRoom(e: FormEvent) {
    e.preventDefault();
    const trimmed = joinName.trim();
    const roomCode = code.trim().toUpperCase();
    if (!trimmed || !roomCode || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomCode}/join`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.status === 404) {
      setBusy(false);
      setError(t("roomNotFound"));
      return;
    }
    if (!res.ok) {
      setBusy(false);
      setError(t("genericError"));
      return;
    }
    const data = (await res.json()) as { participantId: string };
    localStorage.setItem("party:name", trimmed);
    localStorage.setItem(`party:participantId:${roomCode}`, data.participantId);
    router.push(`/room/${roomCode}`);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 p-4 py-8">
      <h1 className="text-center text-3xl font-bold tracking-tight">{t("appTitle")}</h1>

      <form
        onSubmit={createRoom}
        className="flex flex-col gap-4 rounded-2xl border border-black/10 p-4 dark:border-white/15"
      >
        <h2 className="text-xl font-semibold">{t("createRoom")}</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("yourName")}
          <input
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-lg outline-none focus:border-foreground dark:border-white/20"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !createName.trim()}
          className="min-h-12 rounded-xl bg-foreground px-5 py-3 text-lg font-semibold text-background transition-opacity disabled:opacity-40"
        >
          {t("createRoom")}
        </button>
      </form>

      <form
        onSubmit={joinRoom}
        className="flex flex-col gap-4 rounded-2xl border border-black/10 p-4 dark:border-white/15"
      >
        <h2 className="text-xl font-semibold">{t("joinRoom")}</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("yourName")}
          <input
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-lg outline-none focus:border-foreground dark:border-white/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("enterCode")}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-3 text-lg uppercase tracking-widest outline-none focus:border-foreground dark:border-white/20"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !joinName.trim() || !code.trim()}
          className="min-h-12 rounded-xl bg-foreground px-5 py-3 text-lg font-semibold text-background transition-opacity disabled:opacity-40"
        >
          {t("joinRoom")}
        </button>
      </form>

      {error && <p className="text-center font-medium text-red-600">{error}</p>}
    </main>
  );
}
