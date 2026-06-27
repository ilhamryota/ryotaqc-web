import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHero } from "../components/site/page-hero";
import { LEVELS } from "./knowledge";

export const Route = createFileRoute("/knowledge/$level")({
  head: ({ params }) => {
    const l = LEVELS.find((x) => x.slug === params.level);
    const t = l ? `${l.title} — Knowledge — Ryota QC` : "Knowledge";
    return {
      meta: [
        { title: t },
        { name: "description", content: l?.desc ?? "Materi pembelajaran" },
        { property: "og:title", content: t },
        { property: "og:description", content: l?.desc ?? "Materi pembelajaran" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!LEVELS.find((l) => l.slug === params.level)) throw notFound();
    return null;
  },
  component: Detail,
});

function Detail() {
  const { level } = Route.useParams();
  const l = LEVELS.find((x) => x.slug === level)!;
  const Icon = l.icon;

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["public-knowledge", level],
    queryFn: async () => {
      const { data } = await supabase
        .from("knowledge_materials")
        .select("id,slug,title,excerpt,content,featured_image,updated_at")
        .eq("status", "published")
        .eq("level", level as "dasar" | "menengah" | "lanjutan" | "tinggi")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
    staleTime: 60_000,
  });

  return (
    <div>
      <PageHero
        eyebrow="Knowledge"
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            {l.title}
          </span>
        }
        desc={l.desc}
      >
        <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar level
        </Link>
      </PageHero>

      <Container>
        {/* MATERI dari admin panel */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl md:text-2xl font-bold">
              Materi <span className="text-primary">({materials.length})</span>
            </h2>
            <span className="text-xs text-muted-foreground">
              Sumber: Admin Panel
            </span>
          </div>
          {isLoading && (
            <div className="mt-4 text-sm text-muted-foreground">Memuat materi…</div>
          )}
          {!isLoading && materials.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              Belum ada materi pada level ini. Tambahkan dari Admin Panel.
            </div>
          )}
          {materials.length > 0 && (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.map((m) => (
                <article
                  key={m.id}
                  className="group rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <FileText className="h-3 w-3" /> Materi
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug line-clamp-2">{m.title}</h3>
                  {m.excerpt && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-3">{m.excerpt}</p>
                  )}
                  {m.content && (
                    <details className="mt-3 group/details">
                      <summary className="cursor-pointer text-xs font-semibold text-primary">
                        Lihat isi materi
                      </summary>
                      <div className="mt-2 max-h-64 overflow-auto rounded-lg bg-muted/40 p-3 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                        {m.content}
                      </div>
                    </details>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* TOPIK referensi */}
        <section className="mt-12">
          <h2 className="font-display text-xl md:text-2xl font-bold">
            Topik yang Dipelajari
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar topik referensi untuk {l.title.toLowerCase()}.
          </p>
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {l.topics.map((t, i) => (
              <div
                key={t}
                className="rounded-xl border border-border bg-card/60 p-4 hover:glow-border transition"
              >
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" /> Topik {i + 1}
                </div>
                <div className="mt-1 font-medium">{t}</div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
