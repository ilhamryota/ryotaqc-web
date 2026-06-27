interface Props {
  count?: number;
  className?: string;
  variant?: "card" | "line";
}

export function LoadingSkeleton({ count = 6, className, variant = "card" }: Props) {
  if (variant === "line") {
    return (
      <div className={`space-y-3 ${className ?? ""}`} role="status" aria-label="Memuat">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className ?? ""}`} role="status" aria-label="Memuat">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="aspect-[16/10] w-full animate-pulse bg-muted" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
