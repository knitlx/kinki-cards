create or replace function reshuffle_room(p_room_code text, p_host_secret text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_room rooms%rowtype;
begin
  select * into v_room from rooms where code = p_room_code for update;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.host_secret <> p_host_secret then raise exception 'forbidden'; end if;

  perform reshuffle_deck(p_room_code, v_room.current_level);

  update rooms
    set status = 'playing', updated_at = now()
    where code = p_room_code
    returning * into v_room;

  return jsonb_build_object(
    'code', p_room_code,
    'status', v_room.status,
    'current_level', v_room.current_level,
    'active_card_id', v_room.active_card_id,
    'counts', (
      select jsonb_object_agg(level, jsonb_build_object(
        'remaining', jsonb_array_length(remaining_ids),
        'used', jsonb_array_length(used_ids)))
      from room_decks where room_code = p_room_code
    )
  );
end; $$;

revoke execute on function reshuffle_room(text, text) from public, anon, authenticated;
grant execute on function reshuffle_room(text, text) to service_role;
