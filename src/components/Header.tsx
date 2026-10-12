"use client";

import LangToggle from "@/components/LangToggle";


export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-red-950/40 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.9)] animate-pulse" />
          <span className="text-lg font-black tracking-widest text-zinc-100 uppercase">
            KINKI <span className="text-rose-500">CARDS</span>
          </span>
        </div>
        <LangToggle />
      </div>
    </header>
  );
}

