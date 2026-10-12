import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";
import { LEVELS, type Level } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const { level } = await req.json().catch(() => ({}));
  if (!LEVELS.includes(level)) return err("bad_level");

  const db = supabaseAdmin();
  const { data: room } = await db.from("rooms").select("host_secret").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  await db.from("rooms")
    .update({ current_level: level as Level, active_card_id: null, status: "playing",
              updated_at: new Date().toISOString() })
    .eq("code", roomCode);

  const state = await pushRoomState(roomCode);
  return json(state);
}
