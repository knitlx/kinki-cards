create or replace function reshuffle_deck(p_room_code text, p_level text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update room_decks
    set remaining_ids = remaining_ids || (select coalesce(jsonb_agg(value order by random()), '[]'::jsonb)
                           from jsonb_array_elements(used_ids) as value),
        used_ids = '[]'::jsonb
    where room_code = p_room_code and level = p_level;
end; $$;
