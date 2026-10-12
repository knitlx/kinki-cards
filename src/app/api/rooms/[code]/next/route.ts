import { drawNextCard } from "@/lib/roomState";
import { json, err } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const secret = req.headers.get("x-host-secret") ?? "";

  try {
    return json(await drawNextCard(roomCode, secret));
  } catch (e) {
    const message = e instanceof Error ? e.message : "server_error";
    if (message === "room_not_found") return err(message, 404);
    if (message === "forbidden") return err(message, 403);
    return err(message, 500);
  }
}
