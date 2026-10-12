export const LEVELS = ["easy", "medium", "hard"] as const;
export type Level = (typeof LEVELS)[number];

export type RoomStatus = "lobby" | "playing" | "empty";

export type CardKind = "action" | "question";

export type Card = {
  id: string;
  level: Level;
  body: string;
  bodyEn: string | null;
  sort: number;
  kind?: CardKind;
};

export type RoomState = {
  code: string;
  status: RoomStatus;
  currentLevel: Level;
  activeCard: Card | null;
  counts: Record<Level, { remaining: number; used: number }>;
};
