"use client";

import LangToggle from "@/components/LangToggle";


export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(212,32,47,0.6)]"
          />
          <span className="text-lg font-black uppercase tracking-widest text-foreground">
            KINKI <span className="text-accent">CARDS</span>
          </span>
        </div>
        <LangToggle />
      </div>
    </header>
  );
}

