import { supabaseAdmin } from "./supabase/server";
import { broadcastRoomState } from "./broadcast";
import { LEVELS, type Card, type Level, type RoomState } from "./types";

export async function getRoomState(code: string): Promise<RoomState | null> {
  const db = supabaseAdmin();
  const { data: room } = await db.from("rooms").select("*").eq("code", code).maybeSingle();
  if (!room) return null;

  const { data: decks } = await db.from("room_decks").select("*").eq("room_code", code);
  const counts = Object.fromEntries(
    LEVELS.map((l) => {
      const d = decks?.find((x) => x.level === l);
      return [l, { remaining: d?.remaining_ids?.length ?? 0, used: d?.used_ids?.length ?? 0 }];
    }),
  ) as RoomState["counts"];

  let activeCard: Card | null = null;
  if (room.active_card_id) {
    const { data: c } = await db.from("cards").select("*").eq("id", room.active_card_id).maybeSingle();
    if (c) {
      activeCard = {
        id: c.id,
        level: c.level as Level,
        body: c.body,
        bodyEn: c.body_en ?? null,
        sort: c.sort,
      };
    }
  }

  const { data: parts } = await db
    .from("participants").select("id,name,is_host").eq("room_code", code).order("joined_at");

  return {
    code: room.code,
    status: room.status,
    currentLevel: room.current_level as Level,
    activeCard,
    counts,
    participants: (parts ?? []).map((p) => ({ id: p.id, name: p.name, isHost: p.is_host })),
  };
}

export async function pushRoomState(code: string) {
  const state = await getRoomState(code);
  if (state) await broadcastRoomState(code, state);
  return state;
}
