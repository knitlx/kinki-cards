import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const db = supabaseAdmin();
  const { data: room } = await db
    .from("rooms").select("host_secret,current_level").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  const { error } = await db.rpc("reshuffle_deck", {
    p_room_code: roomCode, p_level: room.current_level,
  });
  if (error) return err(error.message, 500);

  await db.from("rooms").update({ status: "playing" }).eq("code", roomCode);
  const state = await pushRoomState(roomCode);
  return json(state);
}
