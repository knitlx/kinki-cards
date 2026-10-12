import { getRoomState } from "@/lib/roomState";
import { json, err } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const state = await getRoomState(code.toUpperCase());
  if (!state) return err("room_not_found", 404);
  return json(state);
}
