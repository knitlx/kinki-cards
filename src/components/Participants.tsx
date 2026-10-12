"use client";

import { useI18n } from "@/lib/i18n";
import type { Participant } from "@/lib/types";

export default function Participants({
  participants,
  online,
}: {
  participants: Participant[];
  online: string[];
}) {
  const { t } = useI18n();
  const onlineSet = new Set(online);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
        {t("participants")}
      </h2>
      <ul className="flex flex-col gap-2">
        {participants.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 dark:border-white/15"
          >
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${
                onlineSet.has(p.name) ? "bg-green-500" : "bg-foreground/20"
              }`}
            />
            <span className="font-medium">{p.name}</span>
            {p.isHost && (
              <span className="ml-auto rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-semibold uppercase">
                {t("host")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
