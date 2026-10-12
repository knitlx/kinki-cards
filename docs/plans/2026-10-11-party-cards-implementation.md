# Карточки для вечеринки — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Веб-приложение с общей колодой карточек для кинки-вечеринки: участники
вступают в комнату, все видят одну карточку, синхронизация мгновенная, карточки
не повторяются, три уровня, управляет ведущий, интерфейс на русском или английском.

**Architecture:** Next.js (App Router) + TypeScript. Вся игровая логика в Route
Handlers. Состояние комнат/колод — Supabase Postgres, атомарное взятие карточки —
Postgres-функция с `FOR UPDATE`. Рассылка изменений — Supabase Realtime Broadcast,
список онлайн — Presence. Вход без регистрации: код комнаты + имя, ведущий по
host-токену. Локализация RU/EN — лёгкий React-контекст, переключатель в постоянной
шапке на всех экранах.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, @supabase/supabase-js
v2, Vitest. Хостинг: Vercel (free) + Supabase (free).

**Политика коммитов:** по правилам проекта коммитить без явной просьбы нельзя.
Поэтому шаги «Commit» заменены на «lint + tests». Коммиты — отдельно, по команде
пользователя. Git-репозиторий проекта инициализируется отдельно от домашней
папки (Task 1).

---

## Phase 0: Предусловия (делает пользователь)

1. Завести бесплатный аккаунт Supabase → создать Project.
2. Завести бесплатный аккаунт Vercel (можно вход через GitHub).
3. Прислать текст карточек (уровни easy/medium/hard).

Пункты 1–2 можно отложить: локально всё разрабатывается и проверяется на local
Supabase или на облачном, но без ключей не запустить. До этого Task 1–4 и Task 13
(лендинг, без сети) делаются офлайн.

---

## Task 1: Каркас проекта

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/*`, `tailwind`/`postcss`

**Step 1: Создать Next.js проект в текущей папке**

Run:
```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm
```
Expected: структура `src/app/layout.tsx`, `src/app/page.tsx`, `package.json`.

**Step 2: Инициализировать отдельный git-репозиторий**

Run:
```bash
git init && printf "node_modules\n.next\n.env*\n!.env.example\n" >> .gitignore
```
Expected: `.git` в папке проекта (вложен в домашний репо, но ведёт себя независимо).

**Step 3: Проверить запуск**

Run: `npm run dev`
Expected: сервер на `http://localhost:3000`, стартовая страница открывается. Остановить.

---

## Task 2: Логика колоды (TDD, чистая функция)

**Files:**
- Create: `src/lib/deck.ts`
- Test: `src/lib/deck.test.ts`
- Create: `vitest.config.ts`

**Step 1: Поставить Vitest и настроить**

Run:
```bash
npm i -D vitest
```
Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } });
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

**Step 2: Написать падающие тесты**

Create `src/lib/deck.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { shuffle, drawFromDeck, reshuffleDeck } from "./deck";

const seq = (nums: number[]) => { let i = 0; return () => nums[i++ % nums.length]; };

describe("shuffle", () => {
  it("returns a permutation of the same elements", () => {
    const out = shuffle([1, 2, 3, 4, 5], seq([0, 1, 2, 3]));
    expect(out.sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it("does not mutate the input", () => {
    const input = [1, 2, 3];
    shuffle(input, seq([0]));
    expect(input).toEqual([1, 2, 3]);
  });
});

describe("drawFromDeck", () => {
  it("moves the first card from remaining to used", () => {
    const r = drawFromDeck(["a", "b", "c"], []);
    expect(r.cardId).toBe("a");
    expect(r.remaining).toEqual(["b", "c"]);
    expect(r.used).toEqual(["a"]);
  });
  it("returns null when empty", () => {
    const r = drawFromDeck([], ["a", "b"]);
    expect(r.cardId).toBeNull();
    expect(r.remaining).toEqual([]);
    expect(r.used).toEqual(["a", "b"]);
  });
  it("never repeats a card", () => {
    let remaining = ["a", "b", "c"];
    let used: string[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = drawFromDeck(remaining, used);
      remaining = r.remaining; used = r.used; seen.push(r.cardId!);
    }
    expect(new Set(seen).size).toBe(3);
    expect(drawFromDeck(remaining, used).cardId).toBeNull();
  });
});

describe("reshuffleDeck", () => {
  it("moves used back into remaining and empties used", () => {
    const r = reshuffleDeck(["a", "b", "c"], seq([0, 1, 2]));
    expect(r.remaining.sort()).toEqual(["a", "b", "c"]);
    expect(r.used).toEqual([]);
  });
});
```

**Step 3: Запустить — убедиться, что падает**

Run: `npm test`
Expected: FAIL — `deck.ts` не найден / функции не экспортированы.

**Step 4: Реализация**

Create `src/lib/deck.ts`:
```ts
export type Rng = () => number;

export function shuffle<T>(input: readonly T[], rng: Rng = Math.random): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function drawFromDeck(remaining: readonly string[], used: readonly string[]) {
  if (remaining.length === 0) return { cardId: null, remaining: [...remaining], used: [...used] };
  const [cardId, ...rest] = remaining;
  return { cardId, remaining: rest, used: [...used, cardId] };
}

export function reshuffleDeck(used: readonly string[], rng: Rng = Math.random) {
  return { remaining: shuffle(used, rng), used: [] as string[] };
}
```

**Step 5: Прогнать тесты**

Run: `npm test`
Expected: PASS (все зелёные).

**Step 6: Lint**

Run: `npm run lint`
Expected: без ошибок.

---

## Task 3: Типы и конфигурация уровней

**Files:**
- Create: `src/lib/types.ts`

**Step 1: Описать типы**

Create `src/lib/types.ts`:
```ts
export const LEVELS = ["easy", "medium", "hard"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  easy: "Лёгкий",
  medium: "Средний",
  hard: "Хард",
};

export type RoomStatus = "lobby" | "playing" | "empty";

export type Card = { id: string; level: Level; body: string; bodyEn: string | null; sort: number };

export type Participant = { id: string; name: string; isHost: boolean };

export type RoomState = {
  code: string;
  status: RoomStatus;
  currentLevel: Level;
  activeCard: Card | null;
  counts: Record<Level, { remaining: number; used: number }>;
  participants: Participant[];
};
```

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: без ошибок.

---

## Task 4: Локализация RU/EN + постоянный переключатель

**Files:**
- Create: `src/lib/i18n.tsx`
- Create: `src/components/Header.tsx`
- Create: `src/components/LangToggle.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Контекст со словарями**

Create `src/lib/i18n.tsx`:
```tsx
"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ru" | "en";

const dict = {
  ru: {
    appTitle: "Карточки для вечеринки",
    createRoom: "Создать комнату",
    joinRoom: "Войти в комнату",
    yourName: "Ваше имя",
    roomCode: "Код комнаты",
    enterCode: "Введите код",
    create: "Создать",
    join: "Войти",
    start: "Начать игру",
    next: "Следующая карточка",
    reshuffle: "Замешать сброс",
    deckEmpty: "Колода закончилась",
    participants: "Участники",
    copyLink: "Скопировать ссылку",
    remaining: "Осталось",
    used: "Сыграно",
    lobby: "Ожидание участников",
    hostOnly: "Только ведущий",
    level_easy: "Лёгкий",
    level_medium: "Средний",
    level_hard: "Хард",
  },
  en: {
    appTitle: "Party Cards",
    createRoom: "Create room",
    joinRoom: "Join room",
    yourName: "Your name",
    roomCode: "Room code",
    enterCode: "Enter code",
    create: "Create",
    join: "Join",
    start: "Start game",
    next: "Next card",
    reshuffle: "Reshuffle discard",
    deckEmpty: "Deck is empty",
    participants: "Participants",
    copyLink: "Copy link",
    remaining: "Remaining",
    used: "Played",
    lobby: "Waiting for players",
    hostOnly: "Host only",
    level_easy: "Easy",
    level_medium: "Medium",
    level_hard: "Hard",
  },
} as const;

type Key = keyof typeof dict.ru;

const Ctx = createContext<{ lang: Lang; t: (k: Key) => string; setLang: (l: Lang) => void } | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "ru" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => { setLangState(l); localStorage.setItem("lang", l); };
  const t = (k: Key) => dict[lang][k];
  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
```

**Step 2: Переключатель**

Create `src/components/LangToggle.tsx`:
```tsx
"use client";
import { useI18n } from "@/lib/i18n";

export function LangToggle() {
  const { lang, setLang } = useI18n();
  const base = "px-3 py-1 rounded border text-sm";
  return (
    <div className="flex gap-1" role="group" aria-label="language">
      <button className={`${base} ${lang === "ru" ? "bg-black text-white" : ""}`} onClick={() => setLang("ru")}>RU</button>
      <button className={`${base} ${lang === "en" ? "bg-black text-white" : ""}`} onClick={() => setLang("en")}>EN</button>
    </div>
  );
}
```

**Step 3: Постоянная шапка**

Create `src/components/Header.tsx`:
```tsx
"use client";
import { useI18n } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

export function Header() {
  const { t } = useI18n();
  return (
    <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
      <span className="font-semibold">{t("appTitle")}</span>
      <LangToggle />
    </header>
  );
}
```

**Step 4: Подключить в layout**

Modify `src/app/layout.tsx`: обернуть приложение в `<I18nProvider>` и отрисовать
`<Header/>` перед `{children}`. Шапка обязана присутствовать на всех экранах —
это и обеспечивает «кнопка всегда активна во всех окнах».

**Step 5: Ручная проверка**

Run: `npm run dev`, открыть `http://localhost:3000`.
Expected: шапка видна, RU/EN переключаются мгновенно, выбор сохраняется после
перезагрузки. Перейти на другой маршрут (`/room/TEST`) — шапка и кнопка на месте.

---

## Task 5: Схема Supabase

**Files:**
- Create: `supabase/migrations/0001_init.sql`
- Create: `.env.example`

**Step 1: Написать SQL**

Create `supabase/migrations/0001_init.sql`:
```sql
create extension if not exists pgcrypto;

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('easy','medium','hard')),
  body text not null,
  body_en text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists rooms (
  code text primary key,
  host_secret text not null,
  current_level text not null default 'easy',
  active_card_id uuid references cards(id),
  status text not null default 'lobby' check (status in ('lobby','playing','empty')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists room_decks (
  room_code text not null references rooms(code) on delete cascade,
  level text not null,
  remaining_ids jsonb not null default '[]'::jsonb,
  used_ids jsonb not null default '[]'::jsonb,
  primary key (room_code, level)
);

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references rooms(code) on delete cascade,
  name text not null,
  is_host boolean not null default false,
  joined_at timestamptz not null default now()
);

alter table cards enable row level security;
alter table rooms enable row level security;
alter table room_decks enable row level security;
alter table participants enable row level security;
-- Политик нет: доступ только через service_role (сервер). Realtime-каналы
-- (broadcast/presence) работают независимо от этих таблиц.

create or replace function start_game(p_room_code text)
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  for r in select distinct level from cards loop
    insert into room_decks (room_code, level, remaining_ids, used_ids)
    values (
      p_room_code, r.level,
      (select coalesce(jsonb_agg(id order by random()), '[]'::jsonb)
         from cards where level = r.level),
      '[]'::jsonb
    )
    on conflict (room_code, level) do update
      set remaining_ids = excluded.remaining_ids, used_ids = '[]'::jsonb;
  end loop;
  update rooms set status = 'playing', active_card_id = null,
    updated_at = now() where code = p_room_code;
end; $$;

create or replace function draw_card(p_room_code text, p_level text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_row room_decks%rowtype; v_card uuid;
begin
  select * into v_row from room_decks
    where room_code = p_room_code and level = p_level for update;
  if not found then raise exception 'deck_not_found'; end if;
  if jsonb_array_length(v_row.remaining_ids) = 0 then return null; end if;
  v_card := (v_row.remaining_ids ->> 0)::uuid;
  update room_decks
    set remaining_ids = v_row.remaining_ids - 0,
        used_ids = v_row.used_ids || to_jsonb(v_card)
    where room_code = p_room_code and level = p_level;
  return v_card;
end; $$;

create or replace function reshuffle_deck(p_room_code text, p_level text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update room_decks
    set remaining_ids = (select coalesce(jsonb_agg(value order by random()), '[]'::jsonb)
                           from jsonb_array_elements(used_ids) as value),
        used_ids = '[]'::jsonb
    where room_code = p_room_code and level = p_level;
end; $$;
```

**Step 2: Применить в Supabase**

Способ А (SQL Editor): открыть Supabase → SQL Editor → вставить содержимое
`0001_init.sql` → Run.
Способ Б (CLI): `npx supabase link` затем `npx supabase db push`.
Expected: таблицы и функции созданы без ошибок.

**Step 3: `.env.example`**

Create `.env.example`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Task 6: Клиенты Supabase

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`

**Step 1: Установить SDK**

Run: `npm i @supabase/supabase-js`

**Step 2: Browser-клиент (для realtime)**

Create `src/lib/supabase/browser.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
);
```

**Step 3: Server-клиент (service_role)**

Create `src/lib/supabase/server.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("supabase_env_missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
```

**Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: без ошибок.

---

## Task 7: Общие хелперы роутов и broadcast

**Files:**
- Create: `src/lib/api.ts`
- Create: `src/lib/broadcast.ts`
- Create: `src/lib/roomState.ts`

**Step 1: Хелперы ответов и хост-токена**

Create `src/lib/api.ts`:
```ts
export const json = (data: unknown, status = 200) =>
  Response.json(data, { status });

export const err = (message: string, status = 400) =>
  Response.json({ error: message }, { status });

export function isHost(req: Request, hostSecret: string) {
  return req.headers.get("x-host-secret") === hostSecret;
}

export function randomCode(len = 5) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export const randomSecret = () =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(24))).toString("base64url");
```

**Step 2: Broadcast состояния через Realtime REST**

Create `src/lib/broadcast.ts`:
```ts
export async function broadcastRoomState(code: string, payload: unknown) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  await fetch(`${url}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      messages: [{ topic: `room:${code}`, event: "room:state", payload }],
    }),
  });
}
```

**Step 3: Сборка снапшота состояния**

Create `src/lib/roomState.ts`:
```ts
import { supabaseAdmin } from "./supabase/server";
import { broadcastRoomState } from "./broadcast";
import { LEVELS, type Card, type Level, type RoomState } from "./types";

export async function getRoomState(code: string): Promise<RoomState | null> {
  const db = supabaseAdmin();
  const { data: room } = await db.from("rooms").select("*").eq("code", code).maybeSingle();
  if (!room) return null;

  const { data: decks } = await db.from("room_decks").select("*").eq("room_code", code);
  const counts = Object.fromEntries(
    LEVELS.map((l) => {
      const d = decks?.find((x) => x.level === l);
      return [l, { remaining: d?.remaining_ids?.length ?? 0, used: d?.used_ids?.length ?? 0 }];
    }),
  ) as RoomState["counts"];

  let activeCard: Card | null = null;
  if (room.active_card_id) {
    const { data: c } = await db.from("cards").select("*").eq("id", room.active_card_id).maybeSingle();
    activeCard = (c as Card) ?? null;
  }

  const { data: parts } = await db
    .from("participants").select("id,name,is_host").eq("room_code", code).order("joined_at");

  return {
    code: room.code,
    status: room.status,
    currentLevel: room.current_level as Level,
    activeCard,
    counts,
    participants: (parts ?? []).map((p) => ({ id: p.id, name: p.name, isHost: p.is_host })),
  };
}

export async function pushRoomState(code: string) {
  const state = await getRoomState(code);
  if (state) await broadcastRoomState(code, state);
  return state;
}
```

**Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: без ошибок.

---

## Task 8: API — создание комнаты

**Files:**
- Create: `src/app/api/rooms/route.ts`

**Step 1: Реализовать**

```ts
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
```

**Step 2: Ручная проверка**

Run: `curl -s -X POST localhost:3000/api/rooms -H 'content-type: application/json' -d '{"name":"Хост"}'`
Expected: JSON `{ code, hostSecret, participantId }`.

---

## Task 9: API — вход в комнату и снапшот

**Files:**
- Create: `src/app/api/rooms/[code]/route.ts`
- Create: `src/app/api/rooms/[code]/join/route.ts`

**Step 1: Снапшот**

`src/app/api/rooms/[code]/route.ts`:
```ts
import { getRoomState } from "@/lib/roomState";
import { json, err } from "@/lib/api";

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const state = await getRoomState(code.toUpperCase());
  if (!state) return err("room_not_found", 404);
  return json(state);
}
```

**Step 2: Вход**

`src/app/api/rooms/[code]/join/route.ts`:
```ts
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
```

**Step 3: Ручная проверка**

Run:
```bash
curl -s localhost:3000/api/rooms/КОД
curl -s -X POST localhost:3000/api/rooms/КОД/join -H 'content-type: application/json' -d '{"name":"Гость"}'
```
Expected: снапшот комнаты; после join в `participants` двое, состояние разослано.

---

## Task 10: API — старт игры и вытягивание карты

**Files:**
- Create: `src/app/api/rooms/[code]/start/route.ts`
- Create: `src/app/api/rooms/[code]/next/route.ts`

**Step 1: Старт**

```ts
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
```

**Step 2: Следующая карта**

```ts
import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";
import type { Level } from "@/lib/types";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const db = supabaseAdmin();
  const { data: room } = await db
    .from("rooms").select("host_secret,current_level").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  const level = room.current_level as Level;
  const { data: cardId, error } = await db.rpc("draw_card", { p_room_code: roomCode, p_level: level });
  if (error) return err(error.message, 500);

  if (!cardId) {
    await db.from("rooms").update({ status: "empty", active_card_id: null }).eq("code", roomCode);
    const state = await pushRoomState(roomCode);
    return json({ ...state, deckEmpty: true });
  }

  await db.from("rooms").update({ active_card_id: cardId, status: "playing" }).eq("code", roomCode);
  const state = await pushRoomState(roomCode);
  return json(state);
}
```

**Step 3: Ручная проверка**

Run:
```bash
curl -s -X POST localhost:3000/api/rooms/КОД/start -H "x-host-secret: СЕКРЕТ"
curl -s -X POST localhost:3000/api/rooms/КОД/next  -H "x-host-secret: СЕКРЕТ"
```
Expected: старт → status playing; next → activeCard заполнен, counts.remaining уменьшился
на 1, used увеличился на 1. Повторный next даёт другую карту.

---

## Task 11: API — смена уровня и перемешивание сброса

**Files:**
- Create: `src/app/api/rooms/[code]/level/route.ts`
- Create: `src/app/api/rooms/[code]/reshuffle/route.ts`

**Step 1: Смена уровня**

```ts
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
```

**Step 2: Перемешать сброс**

```ts
import { supabaseAdmin } from "@/lib/supabase/server";
import { pushRoomState } from "@/lib/roomState";
import { json, err, isHost } from "@/lib/api";

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const roomCode = code.toUpperCase();
  const db = supabaseAdmin();
  const { data: room } = await db
    .from("rooms").select("host_secret,current_level").eq("code", roomCode).maybeSingle();
  if (!room) return err("room_not_found", 404);
  if (!isHost(req, room.host_secret)) return err("forbidden", 403);

  const { error } = await db.rpc("reshuffle_deck", {
    p_room_code: roomCode, p_level: room.current_level,
  });
  if (error) return err(error.message, 500);

  await db.from("rooms").update({ status: "playing" }).eq("code", roomCode);
  const state = await pushRoomState(roomCode);
  return json(state);
}
```

**Step 3: Ручная проверка**

Run:
```bash
curl -s -X POST localhost:3000/api/rooms/КОД/level -H 'content-type: application/json' -H "x-host-secret: СЕКРЕТ" -d '{"level":"hard"}'
curl -s -X POST localhost:3000/api/rooms/КОД/reshuffle -H "x-host-secret: СЕКРЕТ"
```
Expected: currentLevel меняется; после reshuffle used=0, remaining=прежнее число сыгранных.

---

## Task 12: Хук Realtime на клиенте

**Files:**
- Create: `src/lib/useRoom.ts`

**Step 1: Реализовать хук**

```ts
"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase/browser";
import type { RoomState } from "./types";

export function useRoom(code: string) {
  const [state, setState] = useState<RoomState | null>(null);
  const [online, setOnline] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/rooms/${code}`, { cache: "no-store" });
    if (res.ok) setState(await res.json());
  }, [code]);

  useEffect(() => {
    refresh();
    const ch = supabaseBrowser.channel(`room:${code}`, {
      config: { presence: { key: crypto.randomUUID() } },
    });
    ch.on("broadcast", { event: "room:state" }, ({ payload }) => setState(payload as RoomState));
    ch.on("presence", { event: "sync" }, () => {
      setOnline(Object.values(ch.presenceState()).flat().map((p: any) => p.name));
    });
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") { ch.track({ name: localStorage.getItem("name") ?? "гость" }); refresh(); }
    });
    return () => { supabaseBrowser.removeChannel(ch); };
  }, [code, refresh]);

  return { state, online, refresh };
}
```

**Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: без ошибок.

---

## Task 13: Лендинг

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Форма создать/войти**

Поля: имя (переведённая подпись `t("yourName")`); кнопка «Создать комнату»
(POST `/api/rooms`, сохранить `hostSecret` в localStorage, перейти на
`/room/<code>`); поле кода + кнопка «Войти» (сохранить имя, перейти на
`/room/<code>`). Все подписи через `useI18n`. Mobile-first, крупные кнопки.

**Step 2: Проверка**

Run: `npm run dev`, открыть `http://localhost:3000`, создать комнату.
Expected: переход на `/room/<code>` (страница появится в Task 14). Переключение
RU/EN меняет подписи формы.

---

## Task 14: Экран комнаты (лобби + игра)

**Files:**
- Create: `src/app/room/[code]/page.tsx`
- Create: `src/components/CardView.tsx`
- Create: `src/components/Participants.tsx`
- Create: `src/components/HostControls.tsx`

**Step 1: Страница комнаты**

`page.tsx` — клиентский компонент. Читает `hostSecret` из localStorage
(ведущий, если есть), использует `useRoom(code)`. Все подписи — через `useI18n`.

Состояния:
- `status === "lobby"` → код комнаты + ссылка для вступления + список участников;
  у ведущего кнопка «Начать».
- `status === "playing"` и есть `activeCard` → `<CardView/>`, счётчики уровня,
  `<Participants/>`; у ведущего `<HostControls/>`.
- `status === "empty"` или remaining==0 → экран «Колода закончилась» с кнопками
  «Замешать сброс» и переключением уровня.

**Step 2: CardView**

Крупный текст: бейдж уровня (переведённая подпись) и `body`/`bodyEn` по выбранному
языку. Заголовка нет.

**Step 3: HostControls**

Кнопки: «Следующая» (POST `/next`), переключатель уровня (POST `/level`),
«Замешать сброс» (POST `/reshuffle`). Все — с заголовком `x-host-secret`.

**Step 4: Проверка в двух вкладках**

Run: открыть комнату в двух вкладках (одна — ведущий, вторая — гость).
Expected: гость в списке; «Начать» → карточка у обоих; «Следующая» → одна и та же
новая карточка у обоих; смена уровня и reshuffle синхронны; переключатель языка
работает в обеих вкладках.

---

## Task 15: Seed реальной колоды

**Files:**
- Create: `supabase/seed.sql` (готово — 56 карточек, RU + EN)

**Step 1: Реальные карточки**

Источник — `Вопросы.rtf` в корне проекта: 21 easy / 18 medium / 17 hard.
Каждая карточка = текст задания; отдельного заголовка нет. У каждой карточки
есть русский `body` и английский `body_en` (переключаются вместе с языком
интерфейса). Заголовков не добавляем.

**Step 2: Применить**

Run: SQL Editor Supabase → вставить содержимое `supabase/seed.sql` → Run.
Expected: `select level, count(*) from cards group by level;` → easy 21, medium 18, hard 17.

---

## Task 16: Деплой на Vercel

**Files:**
- Modify: `README.md` (инструкция запуска и деплоя)

**Step 1: Проверка сборки**

Run: `npm run build`
Expected: сборка без ошибок.

**Step 2: Env на Vercel**

В Vercel → Project → Settings → Environment Variables добавить:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`.

**Step 3: Деплой**

Вариант А (CLI): `npx vercel` (затем `npx vercel --prod`).
Вариант Б: запушить проект на GitHub и Import в Vercel.
Expected: продовый URL открывается, создание комнаты работает.

**Step 4: Smoke-test на проде**

Создать комнату, войти со второго устройства (телефон), старт, next, смена уровня.
Expected: полная синхронизация, переключатель языка работает.

---

## Итоговая проверка (Definition of Done)

- [ ] Все юнит-тесты зелёные (`npm test`), lint чистый, `npm run build` проходит.
- [ ] Комната создаётся, участники входят, список обновляется.
- [ ] Ведущий стартует игру; у всех одинаковая карточка, обновление мгновенное.
- [ ] Карточки не повторяются; счётчики остаток/сыграно верны.
- [ ] Три уровня, переключение в любой момент.
- [ ] Конец колоды → экран «Колода закончилась» с перемешиванием сброса.
- [ ] Перезагрузка страницы не теряет активную карточку.
- [ ] Переключатель RU/EN всегда доступен на всех экранах, выбор сохраняется.
- [ ] Прод на Vercel работает.
