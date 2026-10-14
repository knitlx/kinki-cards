"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import RulesDialog from "@/components/RulesDialog";

const Ctx = createContext<{ openRules: () => void } | null>(null);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openRules = useCallback(() => setIsOpen(true), []);
  const closeRules = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ openRules }), [openRules]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen && <RulesDialog onClose={closeRules} />}
    </Ctx.Provider>
  );
}

export function useRules() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRules must be used within RulesProvider");
  return ctx;
}
