import { supabaseAdmin } from "./supabase/server";
import { broadcastRoomState } from "./broadcast";
import { LEVELS, type Card, type CardKind, type Level, type RoomState } from "./types";

export function getCardKind(body: string): CardKind {
  const b = body.trim();
  if (
    b.startsWith("Расскажи") ||
    b.startsWith("Спроси") ||
    b.startsWith("Задай вопрос") ||
    b.startsWith("Был ли") ||
    b.startsWith("Как тебе") ||
    b.startsWith("Какой") ||
    b.startsWith("Какая") ||
    b.includes("и спроси") ||
    b.includes("Обсудите") ||
    b.includes("Поговорите с этим игроком")
  ) {
    return "question";
  }
  return "action";
}

let cardsCache: Map<string, Card> | null = null;

async function getCardsMap(): Promise<Map<string, Card>> {
  if (cardsCache) return cardsCache;
  const db = supabaseAdmin();
  const { data } = await db.from("cards").select("*");
  const map = new Map<string, Card>();
  for (const c of data ?? []) {
    map.set(c.id, {
      id: c.id,
      level: c.level as Level,
      body: c.body,
      bodyEn: c.body_en ?? null,
      sort: c.sort,
      kind: getCardKind(c.body),
    });
  }
  cardsCache = map;
  return map;
}


export async function getRoomState(code: string): Promise<RoomState | null> {
  const db = supabaseAdmin();
  const [roomRes, decksRes, cardsMap] = await Promise.all([
    db.from("rooms").select("*").eq("code", code).maybeSingle(),
    db.from("room_decks").select("*").eq("room_code", code),
    getCardsMap(),
  ]);

  const room = roomRes.data;
  if (!room) return null;

  const decks = decksRes.data;
  const counts = Object.fromEntries(
    LEVELS.map((l) => {
      const d = decks?.find((x) => x.level === l);
      return [l, { remaining: d?.remaining_ids?.length ?? 0, used: d?.used_ids?.length ?? 0 }];
    }),
  ) as RoomState["counts"];

  const activeCard = room.active_card_id ? (cardsMap.get(room.active_card_id) ?? null) : null;

  return {
    code: room.code,
    status: room.status,
    currentLevel: room.current_level as Level,
    activeCard,
    counts,
  };
}

type RoomRpcRow = {
  code: string;
  status: RoomState["status"];
  current_level: Level;
  active_card_id: string | null;
  counts: RoomState["counts"];
};

async function callRoomRpc(
  fn: "next_card" | "reshuffle_room" | "start_room",
  code: string,
  hostSecret: string,
): Promise<RoomState> {
  const db = supabaseAdmin();
  const { data, error } = await db.rpc(fn, {
    p_room_code: code,
    p_host_secret: hostSecret,
  });
  if (error) throw new Error(error.message);

  const row = data as RoomRpcRow;
  const cardsMap = await getCardsMap();
  const state: RoomState = {
    code: row.code,
    status: row.status,
    currentLevel: row.current_level,
    activeCard: row.active_card_id ? (cardsMap.get(row.active_card_id) ?? null) : null,
    counts: row.counts,
  };
  await broadcastRoomState(code, state).catch(console.error);
  return state;
}

export function drawNextCard(code: string, hostSecret: string) {
  return callRoomRpc("next_card", code, hostSecret);
}

export function reshuffleRoom(code: string, hostSecret: string) {
  return callRoomRpc("reshuffle_room", code, hostSecret);
}

export function startRoom(code: string, hostSecret: string) {
  return callRoomRpc("start_room", code, hostSecret);
}

export async function pushRoomState(code: string) {
  const state = await getRoomState(code);
  if (state) {
    await broadcastRoomState(code, state).catch(console.error);
  }
  return state;
}

