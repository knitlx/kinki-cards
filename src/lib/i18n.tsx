"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Lang = "ru" | "en";

const dict = {
  ru: {
    createRoom: "Создать игру",
    hostRole: "Ведущий",
    guestRole: "Участник",
    join: "Войти",
    roomCode: "Код комнаты",
    enterCode: "Код комнаты",
    start: "Начать игру",
    next: "Следующая карта",
    reshuffle: "Замешать сброс",
    deckEmpty: "Колода закончилась",
    copyLink: "Скопировать ссылку",
    remaining: "Осталось",
    used: "Сыграно",
    level_easy: "★",
    level_medium: "★★",
    level_hard: "★★★",
    roomNotFound: "Комната не найдена",
    linkCopied: "Ссылка скопирована",
    loading: "Загрузка…",
    genericError: "Что-то пошло не так",
    waitingHost: "Ожидание ведущего…",
    card_action: "Действие",
    card_question: "Вопрос",
    rules: "Правила игры",
    rulesTitle: "Правила игры",
    rulesGotIt: "Понятно",
    rulesMain: "Главное правило: всем должно быть комфортно.",
    rule_1: "Участники ходят по кругу.",
    rule_2: "Ведущий выбирает уровень сложности с учётом настроения группы.",
    rule_3: "Любую карточку можно пропустить без объяснения причин.",
    rule_4:
      "Перед физическим контактом убедитесь, что партнёр согласен. Любой участник может передумать в любой момент.",
    rule_5: "Уважайте чужие границы и отказы. Не давите на других и не уговаривайте их.",
    rule_6: "Можно повторно выбирать одного и того же партнёра, если желание взаимно.",
  },
  en: {
    createRoom: "Create game",
    hostRole: "Host",
    guestRole: "Guest",
    join: "Join",
    roomCode: "Room code",
    enterCode: "Room code",
    start: "Start game",
    next: "Next card",
    reshuffle: "Reshuffle discard",
    deckEmpty: "Deck is empty",
    copyLink: "Copy link",
    remaining: "Remaining",
    used: "Played",
    level_easy: "★",
    level_medium: "★★",
    level_hard: "★★★",
    roomNotFound: "Room not found",
    linkCopied: "Link copied",
    loading: "Loading…",
    genericError: "Something went wrong",
    waitingHost: "Waiting for the host…",
    card_action: "Action",
    card_question: "Question",
    rules: "Rules",
    rulesTitle: "How to play",
    rulesGotIt: "Got it",
    rulesMain: "The main rule: everyone should be comfortable.",
    rule_1: "Players take turns in a circle.",
    rule_2: "The host picks the difficulty level based on the group's mood.",
    rule_3: "Any card can be skipped without giving a reason.",
    rule_4:
      "Before any physical contact, make sure your partner agrees. Anyone can change their mind at any time.",
    rule_5: "Respect other people's boundaries and refusals. Don't pressure or coax others.",
    rule_6: "You can pick the same partner again if the desire is mutual.",
  },
} as const;

type Key = keyof typeof dict.ru;

const Ctx = createContext<{ lang: Lang; t: (k: Key) => string; setLang: (l: Lang) => void } | null>(
  null,
);

const STORAGE_KEY = "lang";
const listeners = new Set<() => void>();

function readLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "ru" ? "ru" : "en";
}

function getServerLang(): Lang {
  return "en";
}


function subscribeLang(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function writeLang(l: Lang) {
  localStorage.setItem(STORAGE_KEY, l);
  listeners.forEach((listener) => listener());
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, readLang, getServerLang);
  const setLang = (l: Lang) => writeLang(l);
  const t = (k: Key) => dict[lang][k];

  return <Ctx.Provider value={{ lang, t, setLang }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
