import type { ReactNode } from "react";
import { Reveal } from "./reveal";

interface Props {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Konsisten heading section: eyebrow + title + deskripsi. Reusable di semua route. */
export function SectionHeader({ eyebrow, title, desc, align = "left", className }: Props) {
  return (
    <div className={`${align === "center" ? "text-center mx-auto max-w-2xl" : ""} ${className ?? ""}`}>
      <Reveal>
        {eyebrow ? (
          <div className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">{eyebrow}</div>
        ) : null}
        <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
        {desc ? <p className="mt-3 text-muted-foreground">{desc}</p> : null}
      </Reveal>
    </div>
  );
}
