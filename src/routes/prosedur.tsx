import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import {
  CheckCircle2, AlertTriangle, Wrench, XCircle, ArrowRight,
  ClipboardList, Layers, Gauge, BadgeCheck,
} from "lucide-react";
import { Container, PageHero, StatusBadge } from "../components/site/page-hero";
import secProsedur from "@/assets/sec-prosedur.jpg";
import p01 from "@/assets/prosedur/01-terima-unit.jpg";
import p02 from "@/assets/prosedur/02-fisik-awal.jpg";
import p03 from "@/assets/prosedur/03-fisik-lanjutan.jpg";
import p04 from "@/assets/prosedur/04-system-info.jpg";
import p05 from "@/assets/prosedur/05-computrace.jpg";
import p06 from "@/assets/prosedur/06-checklist-fungsi.jpg";
import p07 from "@/assets/prosedur/07-lcd-test.jpg";
import p08 from "@/assets/prosedur/08-storage-health.jpg";
import p09 from "@/assets/prosedur/09-battery.jpg";
import p10 from "@/assets/prosedur/10-keyboard-test.jpg";
import p11 from "@/assets/prosedur/11-audio-mic-camera.jpg";
import p12 from "@/assets/prosedur/12-wifi-bluetooth.jpg";
import p13 from "@/assets/prosedur/13-port-test.jpg";
import p14 from "@/assets/prosedur/14-touchpad.jpg";
import p15 from "@/assets/prosedur/15-backlight.jpg";
import p16 from "@/assets/prosedur/16-benchmark.jpg";
import p17 from "@/assets/prosedur/17-stress-test.jpg";
import p18 from "@/assets/prosedur/18-running-test.jpg";
import p19 from "@/assets/prosedur/19-catatan.jpg";
import p20 from "@/assets/prosedur/20-status-akhir.jpg";

const IMAGE_BY_KEY: Record<string, string> = {
  p01, p02, p03, p04, p05, p06, p07, p08, p09, p10,
  p11, p12, p13, p14, p15, p16, p17, p18, p19, p20,
};

export const Route = createFileRoute("/prosedur")({
  head: () => ({
    meta: [
      { title: "Prosedur QC — Ryota QC" },
      { name: "description", content: "Alur lengkap Quality Control laptop & MacBook: penerimaan, pengecekan fungsi, dan finalisasi." },
      { property: "og:title", content: "Prosedur QC — Ryota QC" },
      { property: "og:description", content: "Alur lengkap Quality Control unit laptop dari penerimaan hingga status akhir." },
      { property: "og:image", content: secProsedur },
    ],
  }),
  component: Prosedur,
});

type DbStep = {
  id: string;
  step_number: number;
  phase: number;
  phase_label: string;
  phase_title: string;
  title: string;
  icon: string | null;
  tint: string | null;
  bullets: string[];
  image_key: string | null;
  featured_image: string | null;
};

function StepIcon({ name, className = "h-4.5 w-4.5 text-primary" }: { name: string | null; className?: string }) {
  const Comp = (name && (Icons as any)[name]) || Icons.ClipboardCheck;
  return <Comp className={className} strokeWidth={2} />;
}

const statuses = [
  { kind: "lolos" as const, icon: CheckCircle2, title: "Lolos QC", desc: "Fisik aman, fungsi utama normal, sistem stabil, driver lengkap, Windows aktif, Computrace aman." },
  { kind: "minus" as const, icon: AlertTriangle, title: "Minus Ringan", desc: "Kekurangan tidak mengganggu fungsi utama (lecet, baret tipis, huruf aus, battery menurun) dan wajib diinformasikan transparan ke customer." },
  { kind: "perbaikan" as const, icon: Wrench, title: "Perlu Perbaikan", desc: "Masih bisa diperbaiki sebelum dijual (sebagian tombol mati, battery drop, SSD health rendah, fan kotor, driver/Windows belum lengkap)." },
  { kind: "retur" as const, icon: XCircle, title: "Retur / Ditolak", desc: "Masalah serius: LCD bergaris, motherboard bermasalah, restart sendiri, BSOD, artifact, overheat ekstrem, BIOS terkunci, dsb." },
];

function StepCard({ step }: { step: DbStep }) {
  const img = step.featured_image || (step.image_key ? IMAGE_BY_KEY[step.image_key] : undefined);
  const tint = step.tint || "from-sky-100 to-blue-200 text-sky-700";
  return (
    <Link
      to="/prosedur/$step"
      params={{ step: String(step.step_number) }}
      target="_blank"
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg hover:-translate-y-0.5 block"
    >
      <div className={`relative aspect-[16/9] bg-gradient-to-br ${tint} overflow-hidden`}>
        {img && (
          <img src={img} alt={step.title} loading="lazy" width={896} height={512}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-md ring-4 ring-white/70">
          {step.step_number}
        </span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur shadow ring-1 ring-black/5">
          <StepIcon name={step.icon} />
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold leading-snug">{step.title}</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {(step.bullets ?? []).map((b) => (
            <li key={b} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

function Prosedur() {
  const { data: steps, isLoading } = useQuery({
    queryKey: ["public-procedure-steps"],
    queryFn: async () => {
      const { data } = await supabase
        .from("procedure_steps")
        .select("*")
        .eq("status", "published")
        .order("step_number");
      return ((data ?? []) as any[]).map((r) => ({
        ...r,
        bullets: Array.isArray(r.bullets) ? r.bullets : [],
      })) as DbStep[];
    },
  });

  const phases = useMemo(() => {
    const map = new Map<number, { label: string; title: string; steps: DbStep[] }>();
    (steps ?? []).forEach((s) => {
      if (!map.has(s.phase)) map.set(s.phase, { label: s.phase_label, title: s.phase_title, steps: [] });
      map.get(s.phase)!.steps.push(s);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b).map(([, v]) => v);
  }, [steps]);

  const stats = [
    { icon: ClipboardList, label: "Langkah QC", value: String(steps?.length ?? 0), desc: "Alur pengecekan lengkap dan terstruktur." },
    { icon: Layers, label: "Tahap Utama", value: String(phases.length), desc: "Pemeriksaan fisik, fungsi & sistem, finalisasi." },
    { icon: Gauge, label: "Detail & Konsisten", value: "100%", desc: "Setiap hasil diuji dan dicatat dengan teliti." },
    { icon: BadgeCheck, label: "Status Akhir", value: "Jelas & Terukur", desc: "Tentukan keputusan berdasarkan hasil QC." },
  ];

  return (
    <div>
      <PageHero
        eyebrow="Prosedur QC"
        title={<>Prosedur Quality Control<br className="hidden sm:block" /> Laptop & MacBook</>}
        desc="Alur pengecekan lengkap untuk memastikan setiap unit dalam kondisi optimal. Dari penerimaan unit hingga penentuan status akhir secara terstruktur, detail, dan terdokumentasi."
        image={secProsedur}
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="lolos">Lolos QC</StatusBadge>
          <StatusBadge kind="minus">Minus Ringan</StatusBadge>
          <StatusBadge kind="perbaikan">Perlu Perbaikan</StatusBadge>
          <StatusBadge kind="retur">Retur / Ditolak</StatusBadge>
        </div>
      </PageHero>

      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-12">
          {isLoading && <div className="text-center text-sm text-muted-foreground py-12">Memuat prosedur…</div>}
          {phases.map((t) => (
            <section key={t.label} className="rounded-3xl border border-border bg-card/40 p-5 sm:p-7">
              <div className="mb-5 flex items-baseline gap-3">
                <span className="text-sm font-semibold text-primary">{t.label}</span>
                <span className="h-px flex-1 bg-border" />
                <h2 className="font-display text-base sm:text-lg font-semibold">{t.title}</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {t.steps.map((s) => <StepCard key={s.id} step={s} />)}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Status Akhir Unit</h2>
          <p className="mt-2 text-muted-foreground">Penilaian setelah seluruh tahap selesai dijalankan.</p>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statuses.map((st) => (
              <div key={st.title} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <st.icon className="h-5 w-5 text-primary" />
                  <StatusBadge kind={st.kind}>{st.title}</StatusBadge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link to="/sop" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
            Lanjut ke SOP QC <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </div>
  );
}
