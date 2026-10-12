"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Lang = "ru" | "en";

const dict = {
  ru: {
    appTitle: "Карточки для вечеринки",
    createRoom: "Создать комнату",
    joinRoom: "Войти в комнату",
    yourName: "Ваше имя",
    roomCode: "Код комнаты",
    enterCode: "Введите код",
    create: "Создать",
    join: "Войти",
    start: "Начать игру",
    next: "Следующая карточка",
    reshuffle: "Замешать сброс",
    deckEmpty: "Колода закончилась",
    participants: "Участники",
    copyLink: "Скопировать ссылку",
    remaining: "Осталось",
    used: "Сыграно",
    lobby: "Ожидание участников",
    hostOnly: "Только ведущий",
    level_easy: "Лёгкий",
    level_medium: "Средний",
    level_hard: "Хард",
    roomNotFound: "Комната не найдена",
    linkCopied: "Ссылка скопирована",
    loading: "Загрузка…",
    host: "Ведущий",
    genericError: "Что-то пошло не так",
    waitingHost: "Ведущий выберет карточку",
  },
  en: {
    appTitle: "Party Cards",
    createRoom: "Create room",
    joinRoom: "Join room",
    yourName: "Your name",
    roomCode: "Room code",
    enterCode: "Enter code",
    create: "Create",
    join: "Join",
    start: "Start game",
    next: "Next card",
    reshuffle: "Reshuffle discard",
    deckEmpty: "Deck is empty",
    participants: "Participants",
    copyLink: "Copy link",
    remaining: "Remaining",
    used: "Played",
    lobby: "Waiting for players",
    hostOnly: "Host only",
    level_easy: "Easy",
    level_medium: "Medium",
    level_hard: "Hard",
    roomNotFound: "Room not found",
    linkCopied: "Link copied",
    loading: "Loading…",
    host: "Host",
    genericError: "Something went wrong",
    waitingHost: "Waiting for the host",
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
  return saved === "en" ? "en" : "ru";
}

function getServerLang(): Lang {
  return "ru";
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
