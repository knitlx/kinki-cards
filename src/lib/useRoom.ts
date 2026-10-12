"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { RoomState } from "./types";

export function useRoom(code: string) {
  const [state, setState] = useState<RoomState | null>(null);
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

  const updateState = useCallback((next: RoomState) => {
    setState(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let client: SupabaseClient | null = null;
    let channel: RealtimeChannel | null = null;

    queueMicrotask(refresh);

    (async () => {
      const { supabaseBrowser } = await import("./supabase/browser");
      if (cancelled) return;
      client = supabaseBrowser;
      const ch = supabaseBrowser.channel(`room:${code}`);
      channel = ch;
      ch.on("broadcast", { event: "room:state" }, ({ payload }) => {
        setState(payload as RoomState);
      });
      ch.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          refresh();
        }
      });
    })();

    return () => {
      cancelled = true;
      if (client && channel) client.removeChannel(channel);
    };
  }, [code, refresh]);

  return { state, refresh, updateState, notFound };
}
