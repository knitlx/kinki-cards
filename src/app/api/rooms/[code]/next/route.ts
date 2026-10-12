import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";
import type { Level } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const db = supabaseAdmin();
  const { data: room } = await db
    .from("rooms").select("host_secret,current_level").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  const level = room.current_level as Level;
  const { data: cardId, error } = await db.rpc("draw_card", { p_room_code: roomCode, p_level: level });
  if (error) return err(error.message, 500);

  if (!cardId) {
    await db.from("rooms").update({ status: "empty", active_card_id: null }).eq("code", roomCode);
    const state = await pushRoomState(roomCode);
    return json({ ...state, deckEmpty: true });
  }

  await db.from("rooms").update({ active_card_id: cardId, status: "playing" }).eq("code", roomCode);
  const state = await pushRoomState(roomCode);
  return json(state);
}
