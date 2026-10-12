import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) return err("name_required");

  const db = supabaseAdmin();
  const { data: room } = await db.from("rooms").select("code").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);

  const { data: p } = await db
    .from("participants")
    .insert({ room_code: roomCode, name: name.trim(), is_host: false })
    .select("id")
    .single();

  const state = await pushRoomState(roomCode);
  return json({ participantId: p?.id, state });
}
