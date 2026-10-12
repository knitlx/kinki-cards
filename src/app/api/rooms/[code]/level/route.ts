import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err } from "@/lib/api";
import { LEVELS, type Level } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const { level } = await req.json().catch(() => ({}));
  if (!LEVELS.includes(level)) return err("bad_level");

  const db = supabaseAdmin();
  const secret = req.headers.get("x-host-secret") ?? "";

  const { data: updatedRoom, error } = await db
    .from("rooms")
    .update({
      current_level: level as Level,
      updated_at: new Date().toISOString(),
    })
    .eq("code", roomCode)
    .eq("host_secret", secret)
    .select("code")
    .maybeSingle();

  if (error || !updatedRoom) return err("forbidden", 403);

  const state = await pushRoomState(roomCode);
  return json(state);
}

