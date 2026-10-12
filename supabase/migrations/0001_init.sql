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
