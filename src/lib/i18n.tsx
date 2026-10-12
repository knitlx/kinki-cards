"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Lang = "ru" | "en";

const dict = {
  ru: {
    createRoom: "Создать игру",
    joinAsGuest: "Войти как гость",
    roomCode: "Код комнаты",
    enterCode: "Введите код комнаты",
    start: "Начать игру",
    next: "Следующая карточка",
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
  },
  en: {
    createRoom: "Create game",
    joinAsGuest: "Join as guest",
    roomCode: "Room code",
    enterCode: "Enter room code",
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
