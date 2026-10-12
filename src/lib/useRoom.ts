"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { RoomState } from "./types";

export function useRoom(code: string) {
  const [state, setState] = useState<RoomState | null>(null);
  const [online, setOnline] = useState<string[]>([]);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      setState(null);
      return;
    }
    if (res.ok) {
      setNotFound(false);
      setState((await res.json()) as RoomState);
    }
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;

    queueMicrotask(refresh);

    (async () => {
      const { supabaseBrowser } = await import("./supabase/browser");
      if (cancelled) return;
      client = supabaseBrowser;
      const ch = supabaseBrowser.channel(`room:${code}`, {
        config: { presence: { key: crypto.randomUUID() } },
      });
      channel = ch;
      ch.on("broadcast", { event: "room:state" }, ({ payload }) => {
        setState(payload as RoomState);
      });
      ch.on("presence", { event: "sync" }, () => {
        setOnline(
          Object.values(ch.presenceState<{ name: string }>())
            .flat()
            .map((p) => p.name),
        );
      });
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          ch.track({ name: localStorage.getItem("party:name") ?? "guest" });
          refresh();
        }
      });
    })();

    return () => {
      cancelled = true;
      if (client && channel) client.removeChannel(channel);
    };
  }, [code, refresh]);

  return { state, online, refresh, notFound };
}
