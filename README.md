# Карточки для вечеринки / Party Cards

Веб-приложение с общей колодой карточек. Участники входят в комнату по коду,
ведущий выбирает уровень и вытягивает карточки, все участники видят одну и ту же
карточку в реальном времени. Карточки не повторяются, пока колода уровня не
закончится. Интерфейс и тексты карточек переключаются RU/EN.

## Стек

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS
- Supabase (Postgres + Realtime Broadcast/Presence)
- Деплой: Vercel

## Переменные окружения

Создайте `.env.local` в корне:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
SUPABASE_SECRET_KEY=<secret key>
```

Публичный ключ используется на клиенте (подписка на Realtime), секретный —
только на сервере (роуты `/api/rooms/**`).

## База данных

Схема и функции — `supabase/migrations/0001_init.sql`, колода — `supabase/seed.sql`.

Применить (пример через `psql`):

```bash
psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Запуск

```bash
npm install
npm run dev
```

Открыть http://localhost:3000.

## Проверки

```bash
npm test          # юнит-тесты логики колоды
npm run lint
npx tsc --noEmit
npm run build
```

## Деплой на Vercel

1. Импортировать репозиторий в Vercel (или `npx vercel`).
2. В Project → Settings → Environment Variables добавить
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY` (для Production и Preview).
3. Deploy. Продовый URL открывается, создание комнаты работает.
