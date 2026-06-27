import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Layers,
  Zap,
  Crown,
  ArrowRight,
  Layers3,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { Container, PageHero } from "../components/site/page-hero";
import { Reveal } from "../components/site/reveal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroKnowledge from "@/assets/knowledge/hero-knowledge.jpg";
import lvl1 from "@/assets/knowledge/level-1-dasar.jpg";
import lvl2 from "@/assets/knowledge/level-2-menengah.jpg";
import lvl3 from "@/assets/knowledge/level-3-tinggi.jpg";
import lvl4 from "@/assets/knowledge/level-4-lanjutan.jpg";
import topicOs from "@/assets/knowledge/topic-os.jpg";
import topicCpuRam from "@/assets/knowledge/topic-cpu-ram.jpg";
import topicSsdHdd from "@/assets/knowledge/topic-ssd-hdd.jpg";
import topicVga from "@/assets/knowledge/topic-vga.jpg";
import topicBattery from "@/assets/knowledge/topic-battery.jpg";
import topicKeyboard from "@/assets/knowledge/topic-keyboard.jpg";
import pathPemula from "@/assets/knowledge/path-pemula.jpg";
import pathTrainee from "@/assets/knowledge/path-trainee.jpg";
import pathTeknisi from "@/assets/knowledge/path-teknisi.jpg";
import ctaKnowledge from "@/assets/knowledge/cta-knowledge.jpg";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge Center — Ryota QC" },
      {
        name: "description",
        content:
          "Pusat pembelajaran laptop, PC desktop, dan MacBook dari level dasar hingga lanjutan.",
      },
      { property: "og:title", content: "Knowledge Center — Ryota QC" },
      { property: "og:description", content: "4 level materi laptop & komputer." },
      { property: "og:image", content: heroKnowledge },
    ],
  }),
  component: Knowledge,
});

export const LEVELS = [
  {
    slug: "dasar",
    icon: GraduationCap,
    title: "Level 1 — Dasar",
    desc: "Untuk pemula yang belum memahami laptop sama sekali.",
    image: lvl1,
    topics: [
      "Apa itu laptop?",
      "Perbedaan laptop & PC desktop",
      "Perbedaan laptop & MacBook",
      "Apa itu processor?",
      "Apa itu RAM?",
      "SSD vs HDD",
      "Apa itu VGA?",
      "Layar HD, FHD, IPS",
      "Apa itu Windows?",
      "Apa itu driver?",
      "Cara membaca spek sederhana",
      "Memilih laptop sekolah/kuliah/kerja",
    ],
  },
  {
    slug: "menengah",
    icon: Layers,
    title: "Level 2 — Menengah",
    desc: "Untuk yang sudah memahami dasar dan ingin belajar teknis.",
    image: lvl2,
    topics: [
      "Generasi Intel Core",
      "Seri AMD Ryzen",
      "Core i3/i5/i7/i9",
      "Ryzen 3/5/7/9",
      "RAM onboard vs SODIMM",
      "SSD SATA vs NVMe",
      "Dual channel RAM",
      "Apa itu TDP?",
      "Apa itu thermal throttling?",
      "Membaca Device Manager",
      "Cek kesehatan storage",
      "Cek battery report",
    ],
  },
  {
    slug: "tinggi",
    icon: Zap,
    title: "Level 3 — Tinggi",
    desc: "Untuk trainee QC, teknisi junior, dan admin teknis.",
    image: lvl3,
    topics: [
      "Diagnosa overheat",
      "Membaca sensor suhu",
      "Membaca hasil benchmark",
      "Cek GPU dedicated",
      "BIOS & UEFI",
      "Membaca error Device Manager",
      "Analisis bluescreen",
      "Cek motherboard bermasalah",
      "Cek jalur charging",
      "Cek performa SSD",
      "Menentukan unit layak jual / retur",
    ],
  },
  {
    slug: "lanjutan",
    icon: Crown,
    title: "Level 4 — Lanjutan",
    desc: "Materi tingkat tinggi & teknis mendalam.",
    image: lvl4,
    topics: [
      "Advanced BIOS setting",
      "Undervolting dasar",
      "Overclocking dasar",
      "Thermal tuning",
      "Analisis VRM & power limit",
      "Perbandingan CPU multi-core",
      "Bottleneck CPU & GPU",
      "Advanced storage diagnostics",
      "Deep troubleshooting motherboard",
      "MacBook diagnostics dasar",
      "Apple Silicon vs Intel Mac",
      "Risiko modifikasi hardware",
    ],
  },
];

const STATS = [
  { icon: Layers3, title: "4 Level Pembelajaran", desc: "Belajar bertahap dari dasar hingga tingkat lanjutan." },
  { icon: BookOpen, title: "47+ Materi Tersedia", desc: "Materi laptop dan komputer diperbarui secara berkala." },
  { icon: ClipboardCheck, title: "Quiz & Evaluasi", desc: "Uji pemahaman dengan quiz interaktif di setiap level." },
  { icon: TrendingUp, title: "Belajar Bertahap", desc: "Bangun skill secara konsisten dan terukur." },
];

const FEATURED = [
  { title: "Dasar Sistem Operasi", desc: "Pelajari OS Windows dan macOS.", image: topicOs },
  { title: "Mengenal Processor & RAM", desc: "Paham cara kerja CPU dan memori.", image: topicCpuRam },
  { title: "Perbedaan SSD dan HDD", desc: "Kenali jenis, kecepatan, dan perbedaannya.", image: topicSsdHdd },
  { title: "Dasar VGA & Display", desc: "Pelajari fungsi VGA dan sistem tampilan.", image: topicVga },
  { title: "Baterai dan Charging", desc: "Tipe perawatan baterai dan solusi charging.", image: topicBattery },
  { title: "Port, Keyboard, dan Touchpad", desc: "Fungsi port, keyboard, dan touchpad.", image: topicKeyboard },
];

const PATHS = [
  {
    title: "Pemula Laptop",
    desc: "Mulai dari dasar pengenalan komponen hingga penggunaan laptop sehari-hari.",
    image: pathPemula,
  },
  {
    title: "QC Trainee",
    desc: "Materi khusus untuk trainee QC agar siap melakukan proses quality control.",
    image: pathTrainee,
  },
  {
    title: "Teknisi Junior",
    desc: "Tingkatkan kemampuan teknis dan troubleshooting untuk pekerjaan sehari-hari.",
    image: pathTeknisi,
  },
];

function Knowledge() {
  const { data: kmRows = [] } = useQuery({
    queryKey: ["public-knowledge-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("knowledge_materials")
        .select("id,slug,title,excerpt,level,featured_image,updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
    staleTime: 60_000,
  });
  const countByLevel: Record<string, number> = {};
  for (const r of kmRows) countByLevel[r.level] = (countByLevel[r.level] ?? 0) + 1;
  const totalKm = kmRows.length;
  const dynStats = STATS.map((s, i) =>
    i === 1 ? { ...s, title: `${totalKm} Materi Tersedia` } : s,
  );
  return (
    <div>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
              Knowledge Center
            </div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold leading-tight">
              Pusat Pembelajaran
              <br />
              Laptop & Komputer
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Materi dibagi menjadi empat level — dari paling dasar hingga lanjutan —
              untuk memahami laptop, PC desktop, MacBook, dan komponen teknologi
              secara terstruktur dan praktis.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: Layers3, label: "4 Level Belajar" },
                { icon: CheckCircle2, label: "Terstruktur" },
                { icon: Sparkles, label: "Mudah Dipahami" },
                { icon: PlayCircle, label: "Siap Dipraktikkan" },
              ].map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary font-medium"
                >
                  <b.icon className="h-3.5 w-3.5" /> {b.label}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <img
              src={heroKnowledge}
              alt="Knowledge Center illustration"
              width={1280}
              height={960}
              className="w-full h-auto"
            />
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <Container className="!py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynStats.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <div className="rounded-2xl border border-border bg-card p-5 h-full hover:shadow-md transition">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* PILIH LEVEL BELAJAR */}
      <Container className="!py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Pilih Level Belajar
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">
            Pilih Level Belajar
          </h2>
          <p className="mt-2 text-muted-foreground">
            Pilih level yang sesuai dengan kemampuan dan tujuan belajar Anda.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-5">
          {LEVELS.map((l, i) => (
            <Reveal key={l.slug} delay={i * 80}>
              <Link
                to="/knowledge/$level"
                params={{ level: l.slug }}
                className="group flex gap-4 rounded-2xl border border-border bg-card p-3 sm:p-4 hover:shadow-lg hover:-translate-y-0.5 transition"
              >
                <div className="relative w-36 sm:w-48 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={l.image}
                    alt={l.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow">
                    {i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="font-semibold">{l.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{l.desc}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" /> {countByLevel[l.slug] ?? 0} materi · {l.topics.length} topik
                  </div>
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 text-primary px-3 py-1.5 text-xs font-medium group-hover:bg-primary group-hover:text-primary-foreground transition">
                      Masuk Level <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* MATERI TERBARU (DB) */}
      {kmRows.length > 0 && (
        <Container className="!py-10">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
              Dari Admin Panel
            </div>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Materi Terbaru</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {totalKm} materi telah dipublikasikan oleh tim editor.
            </p>
          </div>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {kmRows.slice(0, 12).map((m, i) => (
              <Reveal key={m.id} delay={i * 40}>
                <div className="group h-full rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5">{m.level}</span>
                  </div>
                  <div className="mt-2 font-semibold text-sm leading-snug line-clamp-2">{m.title}</div>
                  {m.excerpt && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{m.excerpt}</p>
                  )}
                  <Link
                    to="/knowledge/$level"
                    params={{ level: m.level }}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    Buka Level <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      )}

      {/* MATERI UNGGULAN */}
      <Container className="!py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Topik Populer di Knowledge
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Materi Unggulan</h2>
        </div>
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED.map((f, i) => (
            <Reveal key={f.title} delay={i * 50}>
              <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition h-full flex flex-col">
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={f.image}
                    alt={f.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col">
                  <div className="font-semibold text-sm leading-snug">{f.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{f.desc}</p>
                  <ArrowRight className="mt-3 h-4 w-4 text-primary" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* LEARNING PATHS */}
      <Container className="!py-10">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-primary font-semibold">
            Belajar Sesuai Kebutuhan
          </div>
          <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Learning Paths</h2>
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {PATHS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <div className="group flex gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-md transition h-full">
                <div className="w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{p.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{p.desc}</p>
                  <Link
                    to="/knowledge"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 text-primary px-3 py-1.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition"
                  >
                    Mulai Belajar <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* BOTTOM CTA */}
      <Container className="!py-10">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
          <div className="grid md:grid-cols-[1fr_2fr_auto] gap-6 items-center">
            <img
              src={ctaKnowledge}
              alt=""
              loading="lazy"
              className="w-full max-w-[220px] mx-auto md:mx-0"
            />
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                Mulai Belajar dan Tingkatkan Skill QC
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Jelajahi materi sesuai level Anda, uji pemahaman dengan quiz, dan lanjutkan ke prosedur QC.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Link
                to="/quiz"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition"
              >
                <ClipboardCheck className="h-4 w-4" /> Buka Quiz
              </Link>
              <Link
                to="/prosedur"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-background text-primary px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition"
              >
                <BookOpen className="h-4 w-4" /> Lihat Prosedur QC
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Keep PageHero import to satisfy tree-shake-free re-use elsewhere if needed
void PageHero;
