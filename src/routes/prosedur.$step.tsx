import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHero } from "../components/site/page-hero";
import * as Icons from "lucide-react";
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

export const Route = createFileRoute("/prosedur/$step")({
  head: ({ params }) => ({
    meta: [
      { title: `Prosedur Step ${params.step} — Ryota QC` },
      { name: "description", content: "Detail langkah prosedur QC." },
    ],
  }),
  component: ProsedurDetail,
});

function StepIcon({ name, className = "h-6 w-6" }: { name: string | null; className?: string }) {
  const Comp = (name && (Icons as any)[name]) || Icons.ClipboardCheck;
  return <Comp className={className} strokeWidth={2} />;
}

function ProsedurDetail() {
  const { step } = Route.useParams();
  const stepNum = parseInt(step, 10);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["prosedur-step", stepNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procedure_steps")
        .select("*")
        .eq("step_number", stepNum)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw notFound();
      return {
        ...data,
        bullets: Array.isArray(data.bullets) ? data.bullets : [],
      } as DbStep;
    },
  });

  if (isLoading) return <div className="py-24 text-center text-sm text-muted-foreground">Memuat…</div>;
  if (isError || !data) return <div className="py-24 text-center text-sm text-muted-foreground">Langkah tidak ditemukan.</div>;

  const imgSrc = data.image_key ? IMAGE_BY_KEY[data.image_key] : data.featured_image;
  const phaseBg = data.phase === 1 ? "bg-blue-500/10" : data.phase === 2 ? "bg-violet-500/10" : "bg-emerald-500/10";
  const phaseText = data.phase === 1 ? "text-blue-600" : data.phase === 2 ? "text-violet-600" : "text-emerald-600";
  const tint = data.tint || "bg-blue-100 text-blue-600";

  return (
    <div>
      <PageHero
        eyebrow={`${data.phase_label} — Langkah ${data.step_number}`}
        title={
          <span className="flex items-center gap-3">
            <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tint}`}>
              <StepIcon name={data.icon} />
            </span>
            {data.title}
          </span>
        }
        desc={data.phase_title}
      >
        <Link to="/prosedur" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar prosedur
        </Link>
      </PageHero>

      <Container>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {imgSrc && (
              <div className="rounded-2xl border border-border overflow-hidden bg-card/60">
                <img src={imgSrc} alt={data.title} className="w-full h-auto" />
              </div>
            )}

            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${phaseBg} ${phaseText}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${phaseText.replace('text-', 'bg-')}`} />
                {data.phase_label}
              </div>
              <h2 className="text-xl font-semibold mt-4">Detail Langkah</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {data.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-sm text-muted-foreground">Langkah</div>
              <div className="text-3xl font-bold mt-1">{data.step_number}</div>
              <div className="text-xs text-muted-foreground mt-1">dari 20 total langkah QC</div>
            </div>

            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="text-sm font-semibold">Tahap</div>
              <div className="mt-2 text-sm">{data.phase_title}</div>
              <div className={`mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs ${phaseBg} ${phaseText}`}>
                Tahap {data.phase}
              </div>
            </div>

            {data.step_number > 1 && (
              <Link
                to="/prosedur/$step"
                params={{ step: String(data.step_number - 1) }}
                className="block rounded-2xl border border-border bg-card/60 p-5 hover:bg-accent/50 transition"
              >
                <div className="text-xs text-muted-foreground">← Langkah Sebelumnya</div>
                <div className="text-sm font-semibold mt-1">Langkah {data.step_number - 1}</div>
              </Link>
            )}

            {data.step_number < 20 && (
              <Link
                to="/prosedur/$step"
                params={{ step: String(data.step_number + 1) }}
                className="block rounded-2xl border border-border bg-card/60 p-5 hover:bg-accent/50 transition"
              >
                <div className="text-xs text-muted-foreground">Langkah Berikutnya →</div>
                <div className="text-sm font-semibold mt-1">Langkah {data.step_number + 1}</div>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
