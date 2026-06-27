import { createFileRoute, Link } from "@tanstack/react-router";
import {
  GraduationCap,
  Layers,
  Zap,
  Crown,
  ArrowRight,
  ClipboardCheck,
  Users,
  ListChecks,
  PencilLine,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { Container } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import heroDevices from "@/assets/hero-devices.jpg";
import levelDasar from "@/assets/quiz/level-dasar.jpg";
import levelMenengah from "@/assets/quiz/level-menengah.jpg";
import levelTinggi from "@/assets/quiz/level-tinggi.jpg";
import levelLanjutan from "@/assets/quiz/level-lanjutan.jpg";
import personaPemula from "@/assets/quiz/persona-pemula.jpg";
import personaTrainee from "@/assets/quiz/persona-trainee.jpg";
import personaTeknisi from "@/assets/quiz/persona-teknisi.jpg";
import ctaAchieve from "@/assets/quiz/cta-achievement.jpg";

import catFisik from "@/assets/sop/fisik.jpg";
import catLcd from "@/assets/sop/lcd.jpg";
import catBattery from "@/assets/sop/battery.jpg";
import catKeyboard from "@/assets/sop/keyboard.jpg";
import catSecurity from "@/assets/sop/security.jpg";
import catBenchmark from "@/assets/sop/benchmark.jpg";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Quiz Ryota QC — Uji Pemahaman QC Laptop" },
      { name: "description", content: "Quiz interaktif 4 level (Dasar, Menengah, Tinggi, Lanjutan) untuk menguji pemahaman QC laptop, MacBook & desktop." },
      { property: "og:title", content: "Quiz Ryota QC" },
      { property: "og:description", content: "Uji pemahaman QC laptop dengan quiz interaktif 4 level." },
      { property: "og:image", content: heroDevices },
    ],
  }),
  component: QuizIndex,
});

export const QUIZ_LEVELS = [
  {
    slug: "dasar",
    icon: GraduationCap,
    title: "Quiz Dasar",
    count: 10,
    desc: "Mengukur pemahaman dasar seputar komponen laptop, fungsi umum, dan istilah dasar QC.",
    image: levelDasar,
  },
  {
    slug: "menengah",
    icon: Layers,
    title: "Quiz Menengah",
    count: 20,
    desc: "Materi gabungan level dasar dan menengah, cocok untuk latihan analisis pengecekan unit.",
    image: levelMenengah,
  },
  {
    slug: "tinggi",
    icon: Zap,
    title: "Quiz Tinggi",
    count: 30,
    desc: "Evaluasi pemahaman teknis yang lebih detail untuk trainee QC dan admin teknis.",
    image: levelTinggi,
  },
  {
    slug: "lanjutan",
    icon: Crown,
    title: "Quiz Lanjutan",
    count: 50,
    desc: "Quiz lengkap gabungan semua level untuk uji pemahaman menyeluruh.",
    image: levelLanjutan,
  },
];

const FEATURES = [
  { icon: Layers, title: "4 Level Quiz", desc: "Mulai dari dasar hingga lanjutan sesuai kemampuan Anda." },
  { icon: BookOpen, title: "110+ Soal", desc: "Ratusan soal pilihan ganda dari materi QC yang terverifikasi." },
  { icon: BarChart3, title: "Progress Belajar", desc: "Pantau perkembangan dan pencapaian belajar Anda." },
  { icon: ClipboardCheck, title: "Evaluasi Cepat", desc: "Dapatkan hasil instan untuk ukur pemahaman tim." },
];

const CATEGORIES = [
  { name: "Fisik & Kelengkapan", img: catFisik },
  { name: "LCD & Display", img: catLcd },
  { name: "Storage & Battery", img: catBattery },
  { name: "Keyboard, Port & Input", img: catKeyboard },
  { name: "CompuTrace & Security", img: catSecurity },
  { name: "Benchmark & Troubleshooting", img: catBenchmark },
];

const STEPS = [
  { n: 1, icon: ListChecks, title: "Pilih Level", desc: "Pilih level quiz yang sesuai dengan kemampuan dan target belajar Anda." },
  { n: 2, icon: PencilLine, title: "Jawab Soal", desc: "Kerjakan soal pilihan ganda secara interaktif dengan waktu yang fleksibel." },
  { n: 3, icon: BarChart3, title: "Lihat Hasil & Review", desc: "Dapatkan skor otomatis dan review jawaban untuk memahami lebih dalam." },
];

const PERSONAS = [
  { img: personaPemula, title: "Pemula QC", desc: "Mulai dari Quiz Dasar untuk mengenal komponen, fungsi, dan istilah penting QC.", tag: "Rekomendasi: Dasar → Menengah" },
  { img: personaTrainee, title: "Trainee QC", desc: "Perkuat pemahaman teknis dan analisis unit melalui Quiz Menengah dan Tinggi.", tag: "Rekomendasi: Menengah → Tinggi" },
  { img: personaTeknisi, title: "Teknisi Junior", desc: "Uji kemampuan menyeluruh dan tingkatkan kompetensi melalui Quiz Lanjutan.", tag: "Rekomendasi: Semua Level" },
];

function QuizIndex() {
  const { data: counts = {} as Record<string, number> } = useQuery({
    queryKey: ["public-quiz-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select("level")
        .eq("status", "published");
      const map: Record<string, number> = {};
      for (const r of data ?? []) map[r.level] = (map[r.level] ?? 0) + 1;
      return map;
    },
    staleTime: 60_000,
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const dynFeatures = FEATURES.map((f, i) =>
    i === 1 ? { ...f, title: `${total}+ Soal` } : f,
  );
  const dynLevels = QUIZ_LEVELS.map((l) => ({
    ...l,
    count: counts[l.slug] ?? 0,
  }));
  return (
    <div>
      <QuizHero />

      <Container className="!py-10">
        {/* Feature strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dynFeatures.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold">{s.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Pilih Level Quiz */}
        <section className="mt-14">
          <div className="text-center">
            <h2 className="font-display text-3xl md:text-4xl font-extrabold">Pilih Level Quiz</h2>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              Pilih level quiz sesuai dengan kemampuan dan kebutuhan belajar Anda.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {dynLevels.map((lvl, i) => (
              <Reveal key={lvl.slug} delay={i * 60}>
                <LevelCard index={i + 1} {...lvl} />
              </Reveal>
            ))}
          </div>
        </section>


        {/* Kategori Quiz Populer */}
        <section className="mt-16">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">Kategori Quiz Populer</h2>
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.name} delay={i * 40}>
                <Link
                  to="/quiz"
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-md transition"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={c.img}
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-semibold leading-snug line-clamp-2 min-h-[2.2em]">
                      {c.name}
                    </div>
                    <ArrowRight className="mt-2 h-4 w-4 text-primary opacity-70 group-hover:translate-x-0.5 transition" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Cara Kerja Quiz */}
        <section className="mt-16">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">Cara Kerja Quiz</h2>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6 relative">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="absolute -top-3 left-6 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {s.n}
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-4 text-base font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Target Belajar */}
        <section className="mt-16">
          <div className="text-center">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">Target Belajar</h2>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {PERSONAS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm flex gap-4 items-start">
                <img
                  src={p.img}
                  alt={p.title}
                  loading="lazy"
                  width={120}
                  height={120}
                  className="h-24 w-24 rounded-xl object-cover bg-primary/5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-base font-semibold">{p.title}</div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  <div className="mt-2 text-[11px] font-semibold text-primary">{p.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mt-16 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-card p-6 md:p-8">
          <div className="grid md:grid-cols-[auto_1fr_auto] items-center gap-6">
            <img
              src={ctaAchieve}
              alt=""
              aria-hidden="true"
              width={140}
              height={140}
              loading="lazy"
              className="h-28 w-28 md:h-32 md:w-32 object-contain mx-auto md:mx-0"
            />
            <div>
              <h3 className="font-display text-xl md:text-2xl font-extrabold">Siap Uji Pemahaman Tim QC?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mulai quiz sekarang untuk mengukur pemahaman, memantau progress, dan tingkatkan kualitas tim QC Anda.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Link
                to="/quiz/$level"
                params={{ level: "dasar" }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
              >
                Mulai Quiz Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/knowledge"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-background px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition"
              >
                <BookOpen className="h-4 w-4" /> Lihat Knowledge Center
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function QuizHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Quiz</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
              Uji Pemahaman
              <br />
              <span className="text-primary">QC Laptop</span>
            </h1>
            <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
              Quiz interaktif untuk menguji pemahaman tim berdasarkan materi
              Knowledge Center, SOP, prosedur QC, dan troubleshooting dasar
              hingga lanjutan.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {[
                { i: Layers, t: "4 Level Quiz" },
                { i: BarChart3, t: "Skor Otomatis" },
                { i: ClipboardCheck, t: "Review Jawaban" },
                { i: Users, t: "Siap Evaluasi Tim" },
              ].map(({ i: I, t }) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <I className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={heroDevices}
              alt="Ilustrasi dashboard quiz Ryota QC"
              width={1280}
              height={960}
              className="w-full h-auto rounded-2xl shadow-[0_25px_50px_-12px_rgba(59,130,246,0.25)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Level Card ---------------- */
function LevelCard({
  index,
  slug,
  title,
  desc,
  count,
  image,
}: {
  index: number;
  slug: string;
  title: string;
  desc: string;
  count: number;
  image: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition">
      <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] gap-0">
        <div className="relative overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-5 relative">
          <div className="absolute top-4 right-4 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
            {index}
          </div>
          <div className="text-lg font-semibold">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{desc}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5 text-primary" /> {count} soal
          </div>
          <div className="mt-4">
            <Link
              to="/quiz/$level"
              params={{ level: slug }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/20 transition"
            >
              Mulai Quiz <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
