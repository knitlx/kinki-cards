import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const db = supabaseAdmin();
  const { data: room } = await db.from("rooms").select("host_secret").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  const { error } = await db.rpc("start_game", { p_room_code: roomCode });
  if (error) return err(error.message, 500);

  const state = await pushRoomState(roomCode);
  return json(state);
}
