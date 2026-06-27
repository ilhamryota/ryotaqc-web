import type { ComponentType } from "react";
import { Reveal } from "./reveal";

export interface StatItem {
  value: string | number;
  label: string;
  desc?: string;
  icon?: ComponentType<{ className?: string }>;
}

interface Props {
  items: StatItem[];
  className?: string;
}

const COLS: Record<number, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

/** Kartu statistik horizontal yang konsisten di prosedur, sop, knowledge, quiz, tools. */
export function StatsStrip({ items, className }: Props) {
  const cols = COLS[Math.min(items.length, 4)] ?? "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 ${cols} gap-3 md:gap-4 ${className ?? ""}`}>
      {items.map((s, i) => {
        const Icon = s.icon;
        return (
          <Reveal key={s.label} delay={i * 70}>
            <div className="h-full rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="flex items-start gap-3">
                {Icon ? (
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <div className="font-display text-2xl md:text-3xl font-bold leading-none">{s.value}</div>
                  <div className="mt-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </div>
                  {s.desc ? (
                    <div className="mt-1.5 text-xs text-muted-foreground hidden sm:block">{s.desc}</div>
                  ) : null}
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
