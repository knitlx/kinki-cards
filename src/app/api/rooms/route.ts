import { supabaseAdmin } from "@/lib/supabase/server";
import { json, err, randomCode, randomSecret } from "@/lib/api";

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) return err("name_required");

  const db = supabaseAdmin();
  let code = randomCode();
  for (let i = 0; i < 5; i++) {
    const { data } = await db.from("rooms").select("code").eq("code", code).maybeSingle();
    if (!data) break;
    code = randomCode();
  }
  const hostSecret = randomSecret();

  const { error } = await db.from("rooms").insert({ code, host_secret: hostSecret });
  if (error) return err("room_create_failed", 500);

  const { data: host } = await db
    .from("participants")
    .insert({ room_code: code, name: name.trim(), is_host: true })
    .select("id")
    .single();

  return json({ code, hostSecret, participantId: host?.id });
}
