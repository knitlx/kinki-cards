update cards
set body = 'Выполни следующие три карточки, которые покажет приложение, за один ход с одним игроком.',
    body_en = 'Perform the next three cards the app shows, all in one turn with a single player.'
where body = 'Сбрось эту карточку, возьми три другие из любой колоды и выполни их все за один ход с одним игроком.';
