create or replace function next_card(p_room_code text, p_host_secret text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_room rooms%rowtype; v_deck room_decks%rowtype; v_card uuid;
begin
  select * into v_room from rooms where code = p_room_code for update;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.host_secret <> p_host_secret then raise exception 'forbidden'; end if;

  select * into v_deck from room_decks
    where room_code = p_room_code and level = v_room.current_level for update;
  if not found then raise exception 'deck_not_found'; end if;

  if jsonb_array_length(v_deck.remaining_ids) > 0 then
    v_card := (v_deck.remaining_ids ->> 0)::uuid;
    update room_decks
      set remaining_ids = v_deck.remaining_ids - 0,
          used_ids = v_deck.used_ids || to_jsonb(v_card)
      where room_code = p_room_code and level = v_room.current_level;
  end if;

  update rooms
    set active_card_id = v_card,
        status = case when v_card is null then 'empty' else 'playing' end,
        updated_at = now()
    where code = p_room_code;

  return jsonb_build_object(
    'code', p_room_code,
    'status', case when v_card is null then 'empty' else 'playing' end,
    'current_level', v_room.current_level,
    'active_card_id', v_card,
    'counts', (
      select jsonb_object_agg(level, jsonb_build_object(
        'remaining', jsonb_array_length(remaining_ids),
        'used', jsonb_array_length(used_ids)))
      from room_decks where room_code = p_room_code
    )
  );
end; $$;
