import { Link } from "@tanstack/react-router";
import { Search, Sparkles, X, ArrowRight, Bot } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ARTICLES } from "@/lib/articles";

type Hit = {
  title: string;
  desc: string;
  href: string;
  group: "Artikel" | "Halaman" | "SOP" | "Knowledge" | "Quiz";
};

// Static page/topic index — kept short so search is fast & no extra fetches.
const PAGES: Hit[] = [
  { title: "Prosedur QC", desc: "20 langkah pengecekan unit dari terima hingga status akhir", href: "/prosedur", group: "Halaman" },
  { title: "SOP QC", desc: "Standar operasional 11 kategori komponen", href: "/sop", group: "Halaman" },
  { title: "Informasi", desc: "Artikel edukasi software & hardware", href: "/informasi", group: "Halaman" },
  { title: "Maintenance", desc: "Panduan perawatan & troubleshooting", href: "/maintenance", group: "Halaman" },
  { title: "Knowledge Center", desc: "Materi belajar 4 level", href: "/knowledge", group: "Halaman" },
  { title: "Quiz QC", desc: "Uji pemahaman tim QC", href: "/quiz", group: "Halaman" },
  { title: "RyotaQC AI", desc: "Tanya jawab seputar QC", href: "/ai", group: "Halaman" },
  { title: "Contact", desc: "Hubungi tim Ryota QC", href: "/contact", group: "Halaman" },

  // SOP categories
  { title: "SOP — Battery", desc: "Standar pengecekan baterai laptop", href: "/sop/battery", group: "SOP" },
  { title: "SOP — Storage", desc: "Cek SSD/HDD dengan CrystalDiskInfo", href: "/sop/storage", group: "SOP" },
  { title: "SOP — LCD", desc: "Test layar, dead pixel, brightness", href: "/sop/lcd", group: "SOP" },
  { title: "SOP — Keyboard", desc: "Test tombol & shortcut", href: "/sop/keyboard", group: "SOP" },
  { title: "SOP — Computrace", desc: "Cek Absolute Persistence", href: "/sop/computrace", group: "SOP" },

  // Knowledge levels
  { title: "Knowledge — Dasar", desc: "Pengenalan laptop & komponen", href: "/knowledge/dasar", group: "Knowledge" },
  { title: "Knowledge — Menengah", desc: "Driver, OS, troubleshooting", href: "/knowledge/menengah", group: "Knowledge" },
  { title: "Knowledge — Lanjutan", desc: "Benchmark, BIOS, kalibrasi", href: "/knowledge/lanjutan", group: "Knowledge" },

  // Quiz
  { title: "Quiz — Level 1", desc: "Dasar QC laptop", href: "/quiz/1", group: "Quiz" },
  { title: "Quiz — Level 2", desc: "Software & sistem operasi", href: "/quiz/2", group: "Quiz" },
  { title: "Quiz — Level 3", desc: "Hardware & komponen", href: "/quiz/3", group: "Quiz" },
];

function buildHits(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const articleHits: Hit[] = ARTICLES.map((a) => ({
    title: a.title,
    desc: a.summary,
    href: `/artikel/${a.slug}`,
    group: "Artikel" as const,
    _hay: `${a.title} ${a.summary} ${a.tags.join(" ")} ${a.kind} ${a.section}`.toLowerCase(),
  }))
    .filter((h) => (h as any)._hay.includes(q))
    .map(({ _hay, ...rest }: any) => rest);

  const pageHits = PAGES.filter((p) =>
    `${p.title} ${p.desc}`.toLowerCase().includes(q),
  );

  return [...articleHits, ...pageHits].slice(0, 12);
}

export function GlobalSearch({ variant = "navbar" }: { variant?: "navbar" | "hero" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => buildHits(q), [q]);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const trigger =
    variant === "hero" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition"
      >
        <Search className="h-4 w-4" />
        Cari di seluruh Ryota QC...
        <kbd className="ml-2 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cari"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Cari...</span>
        <kbd className="hidden md:inline rounded border border-border px-1 py-0.5 text-[10px]">
          ⌘K
        </kbd>
      </button>
    );

  return (
    <>
      {trigger}

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-foreground/30 backdrop-blur-sm px-4 pt-[10vh]"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian"
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-5 w-5 text-primary shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari artikel, SOP, knowledge, quiz, halaman..."
                className="flex-1 bg-transparent py-4 text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!q && (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
                  Mulai ketik untuk mencari di seluruh Ryota QC.
                </div>
              )}

              {q && hits.length === 0 && (
                <div className="p-4">
                  <div className="rounded-xl border border-border bg-card p-4 text-sm">
                    <div className="text-muted-foreground">
                      Tidak ada hasil untuk <span className="font-medium text-foreground">"{q}"</span>.
                    </div>
                    <Link
                      to="/ai"
                      search={{ q } as never}
                      onClick={() => setOpen(false)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                    >
                      <Bot className="h-3.5 w-3.5" /> Tanya RyotaQC AI <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}

              {hits.length > 0 && (
                <ul className="space-y-1">
                  {hits.map((h) => (
                    <li key={h.href + h.title}>
                      <Link
                        to={h.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 rounded-lg px-3 py-2 hover:bg-accent/60 group"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md border border-border bg-card px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {h.group}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium group-hover:text-primary">
                            {h.title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {h.desc}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                  <li className="px-3 pt-2 pb-1">
                    <Link
                      to="/ai"
                      search={{ q } as never}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary hover:bg-primary/10"
                    >
                      <Bot className="h-3.5 w-3.5" /> Tanya RyotaQC AI tentang "{q}"
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
