import { supabaseAdmin } from "@/lib/supabase/server";
import { json, err, randomSecret } from "@/lib/api";

export async function POST() {
  const db = supabaseAdmin();
  const hostSecret = randomSecret();

  const { data: code, error } = await db.rpc("create_room", { p_host_secret: hostSecret });
  if (error || !code) return err("room_create_failed", 500);

  return json({ code, hostSecret });
}
