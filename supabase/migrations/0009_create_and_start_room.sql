create or replace function create_room(p_host_secret text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code text;
begin
  loop
    v_code := '';
    for i in 1..5 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    end loop;
    begin
      insert into rooms (code, host_secret) values (v_code, p_host_secret);
      return v_code;
    exception when unique_violation then
      null;
    end;
  end loop;
end; $$;

create or replace function start_room(p_room_code text, p_host_secret text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_room rooms%rowtype;
begin
  select * into v_room from rooms where code = p_room_code for update;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.host_secret <> p_host_secret then raise exception 'forbidden'; end if;

  perform start_game(p_room_code);

  select * into v_room from rooms where code = p_room_code;

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

revoke execute on function create_room(text) from public, anon, authenticated;
revoke execute on function start_room(text, text) from public, anon, authenticated;
grant execute on function create_room(text) to service_role;
grant execute on function start_room(text, text) to service_role;
