revoke execute on function start_game(text) from public, anon, authenticated;
revoke execute on function draw_card(text, text) from public, anon, authenticated;
revoke execute on function reshuffle_deck(text, text) from public, anon, authenticated;
revoke execute on function next_card(text, text) from public, anon, authenticated;

grant execute on function start_game(text) to service_role;
grant execute on function draw_card(text, text) to service_role;
grant execute on function reshuffle_deck(text, text) to service_role;
grant execute on function next_card(text, text) to service_role;
