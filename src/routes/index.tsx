import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Sparkles,
  ShieldCheck,
  HardDrive,
  Battery,
  Monitor,
  Keyboard,
  Activity,
  
  GraduationCap,
  Bot,
  ClipboardList,
  ArrowRight,
  Wrench,
  ChevronRight,
  CheckCircle2,
  Zap,
  FileText,
  BarChart3,
  Award,
} from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import logoRq from "@/assets/logorq.png.asset.json";
import heroDevices from "@/assets/hero-devices.jpg";
import imgProsedur from "@/assets/menu/menu-prosedur.jpg";
import imgSop from "@/assets/menu/menu-sop.jpg";
import imgInformasi from "@/assets/menu/menu-informasi.jpg";
import imgMaintenance from "@/assets/menu/menu-maintenance.jpg";
import imgKnowledge from "@/assets/menu/menu-knowledge.jpg";
import imgQuiz from "@/assets/menu/menu-quiz.jpg";
import imgTools from "@/assets/menu/menu-tools.jpg";
import imgAi from "@/assets/menu/menu-ai.jpg";
import alurComputrace from "@/assets/alur/alur-computrace.jpg";
import alurLcd from "@/assets/alur/alur-lcd.jpg";
import alurStorage from "@/assets/alur/alur-storage.jpg";
import alurBattery from "@/assets/alur/alur-battery.jpg";
import alurKeyboard from "@/assets/alur/alur-keyboard.jpg";
import alurBenchmark from "@/assets/alur/alur-benchmark.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ryota QC — Sistem Quality Control Laptop, MacBook, dan Desktop" },
      {
        name: "description",
        content:
          "Platform Quality Control modern untuk Laptop, MacBook, dan Desktop — prosedur, SOP, knowledge, quiz, tools, dan AI dalam satu tempat.",
      },
      { property: "og:title", content: "Ryota QC — Quality Control Platform" },
      {
        property: "og:description",
        content: "Sistem QC modern untuk Laptop, MacBook, dan Desktop.",
      },
    ],
  }),
  component: Beranda,
});

const SAMPLES = [
  "Cara cek battery health laptop?",
  "Apa itu Computrace / Absolute Persistence?",
  "Laptop overheat masuk kategori retur atau perbaikan?",
  "Bedanya SSD SATA dan NVMe?",
  "Standar LCD lolos QC?",
];

function useTypewriter(words: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const sub = useRef(0);
  const del = useRef(false);
  useEffect(() => {
    const tick = () => {
      const word = words[idx.current];
      if (!del.current) {
        sub.current += 1;
        setText(word.slice(0, sub.current));
        if (sub.current === word.length) {
          del.current = true;
          return setTimeout(tick, 1600);
        }
        return setTimeout(tick, 55 + Math.random() * 40);
      }
      sub.current -= 1;
      setText(word.slice(0, sub.current));
      if (sub.current === 0) {
        del.current = false;
        idx.current = (idx.current + 1) % words.length;
        return setTimeout(tick, 250);
      }
      setTimeout(tick, 25);
    };
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [words]);
  return text;
}

const stats = [
  { v: "20+", l: "Langkah Prosedur", d: "Pengecekan unit yang lengkap & terstruktur", icon: ClipboardList },
  { v: "11", l: "Kategori SOP", d: "Standar 11 kategori komponen utama", icon: ShieldCheck },
  { v: "40+", l: "Soal Quiz", d: "Uji pemahaman tim secara berkala", icon: Award },
  { v: "4", l: "Level Knowledge", d: "Materi belajar 4 level terstruktur", icon: BarChart3 },
];

const features = [
  { to: "/prosedur", title: "Prosedur QC", desc: "20 langkah pengecekan unit secara terstruktur", icon: ClipboardList, img: imgProsedur },
  { to: "/sop", title: "SOP QC", desc: "Standar 11 kategori komponen", icon: ShieldCheck, img: imgSop },
  { to: "/informasi", title: "Informasi", desc: "Artikel software & hardware terbaru", icon: FileText, img: imgInformasi },
  { to: "/maintenance", title: "Maintenance", desc: "Panduan perawatan & perbaikan", icon: Wrench, img: imgMaintenance },
  { to: "/knowledge", title: "Knowledge", desc: "Materi belajar 4 level", icon: GraduationCap, img: imgKnowledge },
  { to: "/quiz", title: "Quiz QC", desc: "Uji pemahaman tim QC", icon: Zap, img: imgQuiz },
  { to: "/tools", title: "QC Tools", desc: "Download OS & tools pendukung", icon: HardDrive, img: imgTools },
  { to: "/ai", title: "RyotaQC AI", desc: "Tanya jawab cerdas seputar QC", icon: Bot, img: imgAi },
] as const;

const checks = [
  { icon: ShieldCheck, label: "Computrace", desc: "Cek status anti-theft", img: alurComputrace },
  { icon: Monitor, label: "LCD Test", desc: "Uji panel & dead pixel", img: alurLcd },
  { icon: HardDrive, label: "Storage Health", desc: "SMART SSD/HDD", img: alurStorage },
  { icon: Battery, label: "Battery Health", desc: "Kapasitas & cycle", img: alurBattery },
  { icon: Keyboard, label: "Keyboard Test", desc: "Semua tombol respons", img: alurKeyboard },
  { icon: Activity, label: "Benchmark", desc: "Performa CPU & GPU", img: alurBenchmark },
];

const statusDots = [
  { c: "bg-emerald-500", l: "Lolos QC" },
  { c: "bg-amber-500", l: "Minus Ringan" },
  { c: "bg-blue-500", l: "Perlu Perbaikan" },
  { c: "bg-rose-500", l: "Retur/Ditolak" },
];

function Beranda() {
  const typed = useTypewriter(SAMPLES);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = q.trim() || typed;
    if (!text) return;
    navigate({ to: "/ai", search: { q: text } as never });
  };

  return (
    <div>
      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.96_0.03_250)] via-background to-background">
        <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 md:pt-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* LEFT */}
            <div>
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-primary uppercase">
                  <Sparkles className="h-3.5 w-3.5" /> Platform Quality Control Terstandar
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                  Sistem QC modern untuk{" "}
                  <span className="text-primary">Laptop, MacBook, dan Desktop.</span>
                </h1>
              </Reveal>

              <Reveal delay={180}>
                <p className="mt-5 max-w-xl text-base md:text-lg text-muted-foreground">
                  Panduan pengecekan unit yang ringkas, modern, dan terstandarisasi — dari penerimaan,
                  fisik, fungsi hardware, performa, storage, baterai, hingga validasi status akhir.
                </p>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    to="/prosedur"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition"
                  >
                    Mulai Prosedur <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/sop"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:border-primary/40 hover:text-primary transition"
                  >
                    <FileText className="h-4 w-4" /> Lihat SOP
                  </Link>
                </div>
              </Reveal>

              {/* AI search */}
              <Reveal delay={320}>
                <form onSubmit={submit} className="mt-8 max-w-xl">
                  <div className="group flex items-center rounded-2xl border border-border bg-card/90 backdrop-blur px-3 py-2.5 shadow-sm focus-within:border-primary/50 focus-within:shadow-[var(--shadow-glow)] transition">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30 overflow-hidden">
                      <img src={logoRq.url} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
                    </span>
                    <div className="ml-3 flex-1 text-left relative min-w-0">
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder=""
                        aria-label="Tanya RyotaQC AI"
                        className="w-full bg-transparent outline-none text-sm md:text-base placeholder:text-muted-foreground"
                      />
                      {!q && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center text-muted-foreground truncate text-sm md:text-base">
                          <span className="opacity-80 shrink-0">Tanya RyotaQC AI: </span>
                          <span className="ml-1 text-foreground/80 truncate">{typed}</span>
                          <span className="caret ml-0.5 h-5" />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="ml-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition shrink-0"
                    >
                      Tanya <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </Reveal>
            </div>

            {/* RIGHT — device image */}
            <Reveal delay={200}>
              <div className="relative">
                <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-primary/20 via-primary/5 to-transparent blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-[0_30px_80px_-30px_rgba(59,130,246,0.45)]">
                  <img
                    src={heroDevices}
                    alt="Laptop, desktop, dan monitor menampilkan dashboard Quality Control"
                    width={1280}
                    height={896}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== STATS STRIP ============== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-6 md:-mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 70}>
              <div className="h-full rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-2xl md:text-3xl font-bold leading-none">
                      {s.v}
                    </div>
                    <div className="mt-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.l}
                    </div>
                    <div className="mt-1.5 text-xs text-muted-foreground hidden sm:block">{s.d}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== FEATURE GRID ============== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
        <Reveal>
          <div className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Jelajahi semua modul
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl font-bold tracking-tight max-w-2xl">
            Semua yang Anda butuhkan dalam satu platform
          </h2>
        </Reveal>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.to} delay={i * 60}>
              <Link
                to={f.to}
                className="group relative block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-glow)] transition"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={f.img}
                    alt={f.title}
                    width={1024}
                    height={640}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
                  <div className="absolute top-3 left-3 grid h-9 w-9 place-items-center rounded-xl bg-background/90 backdrop-blur text-primary ring-1 ring-border shadow-sm">
                    <f.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Buka <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============== ALUR QC ============== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 md:pb-24">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-sm">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-semibold tracking-[0.25em] text-primary uppercase">
                Alur QC Terintegrasi
              </div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold tracking-tight">
                Pengecekan menyeluruh, hasil lebih akurat.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Ikuti prosedur QC lengkap dari penerimaan unit hingga penentuan status akhir.
                Pastikan unit siap jual atau memerlukan tindakan lanjutan.
              </p>
              <div className="mt-5 space-y-2 text-sm">
                {["Konsisten dengan SOP", "Dokumentasi terpusat", "Edukasi & Quiz internal"].map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2 text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-primary" /> {t}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {checks.map(({ icon: Icon, label, desc, img }, i) => (
                  <Reveal key={label} delay={i * 50}>
                    <div className="relative">
                      <div className="group h-full overflow-hidden rounded-2xl border border-border bg-background hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md transition">
                        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={img}
                            alt={label}
                            width={400}
                            height={300}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                          <div className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-lg bg-background/90 backdrop-blur text-primary ring-1 ring-border">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow">
                            {i + 1}
                          </div>
                        </div>
                        <div className="p-3 text-center">
                          <div className="text-xs sm:text-sm font-semibold">{label}</div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">{desc}</div>
                        </div>
                      </div>
                      {i % 3 !== 2 && i !== checks.length - 1 && (
                        <ChevronRight className="hidden sm:block absolute top-1/3 -right-2.5 -translate-y-1/2 h-4 w-4 text-primary/60" />
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-border bg-background px-4 py-2 text-xs">
                {statusDots.map((s) => (
                  <span key={s.l} className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${s.c}`} /> {s.l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA BANNER ============== */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 md:p-8">
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl md:text-2xl font-bold">
                  Siap mulai pengecekan unit?
                </h3>
                <p className="mt-1 text-sm md:text-base text-primary-foreground/85">
                  Ikuti prosedur QC lengkap dan tentukan status akhir dengan percaya diri.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2.5 md:shrink-0">
              <Link
                to="/prosedur"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-4 py-2.5 text-sm font-semibold hover:opacity-95 transition"
              >
                Mulai Prosedur QC <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
              >
                Coba Quiz
              </Link>
              <Sparkles className="hidden md:block h-5 w-5 self-center opacity-80" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
