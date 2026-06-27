import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHero } from "../components/site/page-hero";
import { SOP_META } from "./sop";

type DbSop = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  checklist_items: string[];
  pass_criteria: string | null;
  minus_criteria: string | null;
  return_criteria: string | null;
  featured_image: string | null;
};

export const Route = createFileRoute("/sop/$kategori")({
  head: ({ params }) => ({
    meta: [
      { title: `SOP ${params.kategori} — Ryota QC` },
      { name: "description", content: "Detail SOP Quality Control." },
    ],
  }),
  component: SopDetail,
});

function splitLines(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
}

function SopDetail() {
  const { kategori } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sop-detail", kategori],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sop_items")
        .select("id,slug,title,content,checklist_items,pass_criteria,minus_criteria,return_criteria,featured_image")
        .eq("slug", kategori)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return {
        ...data,
        checklist_items: Array.isArray(data.checklist_items) ? data.checklist_items : [],
      } as DbSop;
    },
  });

  if (isLoading) return <div className="py-24 text-center text-sm text-muted-foreground">Memuat…</div>;
  if (isError || !data) return <div className="py-24 text-center text-sm text-muted-foreground">SOP tidak ditemukan.</div>;

  const meta = SOP_META[data.slug];
  const Icon = meta?.icon ?? Wrench;

  return (
    <div>
      <PageHero
        eyebrow="SOP QC"
        title={
          <span className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Icon className="h-6 w-6" />
            </span>
            {data.title}
          </span>
        }
        desc={data.content ?? ""}
      >
        <Link to="/sop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar SOP
        </Link>
      </PageHero>

      <Container>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/60 p-6">
            <h2 className="text-xl font-semibold">Item Pengecekan</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {data.checklist_items.map((c) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <StatusCard tone="lolos" icon={CheckCircle2} title="Status Lolos" items={splitLines(data.pass_criteria)} />
            <StatusCard tone="minus" icon={AlertTriangle} title="Status Minus" items={splitLines(data.minus_criteria)} />
            <StatusCard tone="retur" icon={XCircle} title="Status Retur" items={splitLines(data.return_criteria)} />
          </div>
        </div>
      </Container>
    </div>
  );
}

function StatusCard({
  tone, icon: Icon, title, items,
}: {
  tone: "lolos" | "minus" | "retur";
  icon: typeof CheckCircle2;
  title: string;
  items: string[];
}) {
  const map = {
    lolos: "border-success/40 bg-success/5 text-success",
    minus: "border-warning/40 bg-warning/5 text-warning",
    retur: "border-danger/40 bg-danger/5 text-danger",
  };
  return (
    <div className={`rounded-2xl border p-5 ${map[tone]}`}>
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4" /> {title}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-foreground/90">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="opacity-70">›</span> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
