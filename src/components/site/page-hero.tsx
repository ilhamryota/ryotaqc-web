import { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  desc,
  image,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background pointer-events-none" />
        </>
      )}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-20">
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.25em] text-primary">{eyebrow}</div>
        )}
        <h1 className="mt-2 font-display text-3xl md:text-5xl font-bold leading-tight">
          {title}
        </h1>
        {desc && <p className="mt-4 max-w-3xl text-muted-foreground">{desc}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 py-12 ${className}`}>{children}</div>;
}

export function StatusBadge({ kind, children }: { kind: "lolos" | "minus" | "perbaikan" | "retur"; children: ReactNode }) {
  const map = {
    lolos: "bg-success/15 text-success border-success/40",
    minus: "bg-warning/15 text-warning border-warning/40",
    perbaikan: "bg-primary/15 text-primary border-primary/40",
    retur: "bg-danger/15 text-danger border-danger/40",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${map[kind]}`}>
      {children}
    </span>
  );
}
