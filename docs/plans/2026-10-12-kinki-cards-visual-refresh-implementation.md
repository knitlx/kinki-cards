# KINKI CARDS Visual Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Привести все экраны KINKI CARDS к единому минималистичному тёмному стилю с единственным акцентным красным цветом.

**Architecture:** Базовые цвета, фокус, движение и фон определяются в `src/app/globals.css`; компоненты используют только эти семантические переменные и согласованные Tailwind-утилиты. Игровая логика, API и тексты карточек не меняются.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, ESLint.

---

### Task 1: Задать единую палитру и базовое поведение

**Files:**
- Modify: `src/app/globals.css:3-25`
- Modify: `src/app/layout.tsx:20-36`

**Step 1: Проверить текущее смешение цветов**

Run: `rg -n "rose-|red-|rgba\(" src/app src/components`

Expected: находятся одновременно `red`, `rose` и несколько значений `rgba`.

**Step 2: Внести минимальные глобальные стили**

- Добавить переменные `--surface`, `--surface-raised`, `--text-muted`, `--border`, `--accent: #D4202F`.
- Оставить у `body` почти чёрный фон и одно слабое красное радиальное свечение; удалить дополнительные разнотонные пятна.
- Добавить `color-scheme: dark`, `touch-action: manipulation` и понятные `:focus-visible` состояния.
- Добавить `@media (prefers-reduced-motion: reduce)`, отключающий несущественную анимацию и переходы.
- В `RootLayout` задать `themeColor: "#0B0B0C"` через metadata и добавить `color-scheme` классу `html` либо эквивалентному глобальному стилю.

**Step 3: Проверить форматирование и типы**

Run: `npm run lint`

Expected: завершается без ошибок.

**Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "style: establish unified dark palette"
```

### Task 2: Обновить общие элементы управления

**Files:**
- Modify: `src/components/Header.tsx:8-21`
- Modify: `src/components/LangToggle.tsx:13-31`
- Modify: `src/components/HostControls.tsx:73-110`

**Step 1: Проверить текущее состояние интерактивных элементов**

Run: `rg -n "transition-all|rose-|animate-|outline-none" src/components/Header.tsx src/components/LangToggle.tsx src/components/HostControls.tsx`

Expected: находятся розовые оттенки, постоянная анимация и `transition-all`.

**Step 2: Привести шапку и кнопки к дизайн-системе**

- Заменить все `rose-*` и разбросанные `red-*` на единый `--accent`/согласованные утилиты с цветом `#D4202F`.
- Убрать бесконечную пульсацию индикатора в шапке; оставить статичную красную точку.
- Сделать активный язык и выбранный уровень сплошными красными элементами, а неактивные — графитовыми.
- Главная кнопка «следующая» остаётся единственной сплошной красной кнопкой; вторичная «перемешать» — графитовой.
- Заменить `transition-all` на точные свойства (`transition-colors`, `transition-transform`, `transition-shadow`).
- Добавить `focus-visible` к каждой кнопке, если общий стиль не покрывает элемент достаточно заметно.

**Step 3: Проверить статический анализ**

Run: `npm run lint`

Expected: завершается без ошибок.

**Step 4: Commit**

```bash
git add src/components/Header.tsx src/components/LangToggle.tsx src/components/HostControls.tsx
git commit -m "style: unify shared controls"
```

### Task 3: Обновить лендинг и лобби

**Files:**
- Modify: `src/app/page.tsx:50-116`
- Modify: `src/app/room/[code]/page.tsx:71-119`

**Step 1: Сформировать критерии визуальной проверки**

- Лендинг: одна красная кнопка «создать», нейтральная кнопка «войти», графитовые панели с тонкой границей.
- Лобби: код комнаты — главный элемент, кнопка «начать» — единственный красный призыв к действию.
- Поле кода имеет заметный focus-visible и атрибуты `name`, `autoComplete="off"`, `spellCheck={false}`, `inputMode="text"`.
- Тексты ошибок получают `aria-live="polite"`.

**Step 2: Внести изменения интерфейса**

- Удалить красно-розовые градиенты и бордовые тени у форм и кнопок.
- Использовать ту же графитовую поверхность и границы, что и в общих контролах.
- Заменить `outline-none` на доступное состояние `focus-visible`.
- Добавить точные переходы вместо `transition-all`.
- Сделать надписи и второстепенную информацию контрастными, но сдержанными.

**Step 3: Ручная проверка в браузере**

Run: `npm run dev`

Expected: на `/` и на комнате в состоянии лобби нет розовых оттенков; акцентный красный встречается только на бренде, статусе и главном действии. Проверить на ширине 375 px и 1440 px, включая навигацию клавишей Tab.

**Step 4: Проверить сборку**

Run: `npm run build`

Expected: production build завершается без ошибок.

**Step 5: Commit**

```bash
git add src/app/page.tsx 'src/app/room/[code]/page.tsx'
git commit -m "style: refine landing and lobby"
```

### Task 4: Обновить игровую карточку и финально проверить стиль

**Files:**
- Modify: `src/components/CardView.tsx:30-53`
- Modify: `src/components/Participants.tsx:17-36` (если компонент снова используется в экране)

**Step 1: Проверить контраст игрового состояния**

Run: `rg -n "rose-|red-|shadow|transition-all" src/components/CardView.tsx src/components/Participants.tsx`

Expected: игровые статусы и тени всё ещё используют старую смешанную палитру.

**Step 2: Внести минимальные правки**

- Сделать большую карточку матовой графитовой поверхностью с едва заметной красной тенью, производной от `--accent`.
- Уровень карточки обозначить единственным красным, тип карточки — нейтральной серой меткой.
- Длинный текст карточки не должен выходить за края (`break-words`).
- Привести список участников к той же системе границ, поверхностей и спокойных статусов, если он отображается на экране.

**Step 3: Проверить отсутствие старой палитры**

Run: `rg -n "rose-" src/app src/components`

Expected: вывод пустой.

**Step 4: Выполнить полный набор проверок**

Run: `npm test && npm run lint && npm run build`

Expected: все команды завершаются с кодом 0.

**Step 5: Commit**

```bash
git add src/components/CardView.tsx src/components/Participants.tsx
git commit -m "style: refine game card presentation"
```

### Task 5: Финальная визуальная приёмка

**Files:**
- Review: `src/app/globals.css`
- Review: `src/app/page.tsx`
- Review: `src/app/room/[code]/page.tsx`
- Review: `src/components/Header.tsx`
- Review: `src/components/LangToggle.tsx`
- Review: `src/components/CardView.tsx`
- Review: `src/components/HostControls.tsx`

**Step 1: Открыть основные состояния**

- Лендинг: создание комнаты и ввод кода.
- Лобби: код, копирование ссылки, кнопка ведущего и экран ожидания гостя.
- Игра: карточка вопроса, карточка действия, переключатель уровня и пустая колода.

**Step 2: Принять результат по чек-листу**

- Нет `rose-*`, красно-розовых градиентов и постоянной пульсации.
- Красный `#D4202F` используется только как смысловой акцент.
- Белый текст не теряется на графитовых поверхностях; второстепенный серый читается.
- На ширинах 375 px и 1440 px ничего не обрезается и не появляется горизонтальная прокрутка.
- Фокус Tab заметен на языке, полях и всех кнопках.

**Step 3: Commit финальной документации (если потребовалась)**

```bash
git add docs/plans/2026-10-12-kinki-cards-visual-refresh-implementation.md
git commit -m "docs: add visual refresh implementation plan"
```
