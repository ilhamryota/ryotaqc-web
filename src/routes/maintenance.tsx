import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  CheckCircle2,
  LayoutGrid,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Wrench,
  Code2,
  Cpu,
  ArrowRight,
  ClipboardList,
  Newspaper,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Container } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { maintenance, THUMBS, type Article } from "@/lib/articles";
import { listPublishedArticles } from "@/lib/db-articles.functions";
import { DbArticleCard } from "@/components/site/db-article-card";
import secMaintenance from "@/assets/sec-maintenance-new.jpg";
import ctaToolbox from "@/assets/maint/cta-toolbox.png";

// Per-slug curated thumbnails for Maintenance
import m01 from "@/assets/maint/01-windows-lemot.jpg";
import m02 from "@/assets/maint/02-driver.jpg";
import m03 from "@/assets/maint/03-wifi.jpg";
import m04 from "@/assets/maint/04-sound.jpg";
import m05 from "@/assets/maint/05-bsod.jpg";
import m06 from "@/assets/maint/06-mati-total.jpg";
import m07 from "@/assets/maint/07-overheat.jpg";
import m08 from "@/assets/maint/08-battery.jpg";
import m09 from "@/assets/maint/09-ssd.jpg";
import m10 from "@/assets/maint/10-lcd.jpg";

const SLUG_THUMB: Record<string, string> = {
  "mengatasi-windows-lemot": m01,
  "driver-tidak-terbaca": m02,
  "wifi-hilang": m03,
  "sound-tidak-keluar": m04,
  "blue-screen-windows": m05,
  "laptop-mati-total": m06,
  "laptop-overheat": m07,
  "cek-baterai-drop": m08,
  "ssd-bermasalah": m09,
  "lcd-bergaris": m10,
};

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Maintenance & Problem Solving — Ryota QC" },
      { name: "description", content: "Artikel troubleshooting & perbaikan untuk laptop, PC desktop, dan MacBook." },
      { property: "og:title", content: "Maintenance & Problem Solving — Ryota QC" },
      { property: "og:description", content: "Panduan troubleshooting software & hardware: gejala, penyebab, pengecekan, dan solusi." },
      { property: "og:image", content: secMaintenance },
    ],
  }),
  component: Maintenance,
});

function Maintenance() {
  const software = maintenance.filter((a) => a.kind === "software");
  const hardware = maintenance.filter((a) => a.kind === "hardware");

  const fetchPublished = useServerFn(listPublishedArticles);
  const { data: dbArticles = [] } = useQuery({
    queryKey: ["public-articles", "maintenance"],
    queryFn: () => fetchPublished({ data: { type: "maintenance" } }),
    staleTime: 60_000,
  });

  return (
    <div>
      <MaintenanceHero />

      <Container className="!py-10">
        {/* Stats / Feature strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: LayoutGrid, title: "2 Kategori Utama", desc: "Software & Hardware dalam satu pusat troubleshooting." },
            { icon: BookOpen, title: "Panduan Praktis", desc: "Gejala, penyebab, langkah cek, dan solusi awal." },
            { icon: GraduationCap, title: "Mudah Dipahami", desc: "Bahasa ringkas, jelas, dan aplikatif untuk tim QC." },
            { icon: RefreshCw, title: "Update Berkala", desc: "Konten maintenance selalu relevan dengan kebutuhan lapangan." },
          ].map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-semibold">{s.title}</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Artikel Terbaru dari Admin */}
        {dbArticles.length > 0 && (
          <section className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary shrink-0">
                <Newspaper className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  Artikel Maintenance <span className="text-primary">Terbaru</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                  Diterbitkan oleh tim editor melalui admin panel — bisa juga hasil impor dari sumber lain.
                </p>
              </div>
            </div>
            <div className="mt-7 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {dbArticles.map((a, i) => (
                <Reveal key={a.id} delay={i * 40}>
                  <DbArticleCard article={a} categoryLabel="Maintenance" fallbackImage={secMaintenance} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Kategori Software */}
        <CategorySection
          icon={Code2}
          title="Software"
          desc="Materi troubleshooting untuk masalah sistem operasi, driver, jaringan, audio, dan error software lainnya."
          articles={software}
          ctaLabel="Lihat Semua Software"
        />

        {/* Kategori Hardware */}
        <CategorySection
          icon={Cpu}
          title="Hardware"
          desc="Materi maintenance untuk diagnosa kerusakan komponen fisik dan performa hardware laptop maupun desktop."
          articles={hardware}
          ctaLabel="Lihat Semua Hardware"
        />

        {/* Learning CTA */}
        <LearningCTA />
      </Container>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function MaintenanceHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Maintenance</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
              Maintenance &<br />
              <span className="text-primary">Problem Solving</span>
            </h1>
            <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
              Panduan troubleshooting dan perbaikan seputar software & hardware
              untuk laptop, PC desktop, dan MacBook. Materi membantu tim QC
              mengenali gejala, penyebab, langkah pengecekan, dan solusi awal
              dengan lebih cepat.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {["Troubleshooting Cepat", "Terstruktur", "Praktis", "Solusi Awal"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={secMaintenance}
              alt="Ilustrasi maintenance center laptop dan dashboard troubleshooting"
              width={1280}
              height={960}
              className="w-full h-auto drop-shadow-[0_25px_50px_rgba(59,130,246,0.18)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Category Section ---------------- */
function CategorySection({
  icon: Icon,
  title,
  desc,
  articles,
  ctaLabel,
}: {
  icon: typeof Code2;
  title: string;
  desc: string;
  articles: Article[];
  ctaLabel: string;
}) {
  return (
    <section className="mt-12 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">
              Kategori <span className="text-primary">{title}</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{desc}</p>
          </div>
        </div>
        <Link
          to="/maintenance"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 self-start md:self-auto"
        >
          {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-7 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {articles.map((a, i) => (
          <Reveal key={a.slug} delay={i * 50}>
            <ArticleMiniCard article={a} categoryLabel={title} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ArticleMiniCard({ article, categoryLabel }: { article: Article; categoryLabel: string }) {
  const img = SLUG_THUMB[article.slug] ?? THUMBS[article.thumb];
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {img && (
          <img
            src={img}
            alt={article.title}
            loading="lazy"
            width={800}
            height={600}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
          {categoryLabel}
        </span>
        <h3 className="mt-2 font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition">
          {article.title}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {article.readMinutes} mnt
          </span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Baca Artikel <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

/* ---------------- Learning CTA ---------------- */
function LearningCTA() {
  return (
    <section className="mt-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-6 md:p-8">
      <div className="grid md:grid-cols-[180px,1fr,auto] gap-6 items-center">
        <div className="relative">
          <img
            src={ctaToolbox}
            alt="Toolbox maintenance"
            width={400}
            height={400}
            loading="lazy"
            className="w-32 md:w-44 h-auto mx-auto drop-shadow-[0_15px_30px_rgba(59,130,246,0.25)]"
          />
        </div>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold">
            Tingkatkan kemampuan<br className="hidden md:block" /> maintenance tim QC
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Pelajari materi troubleshooting lebih mendalam dan lanjutkan ke
            panduan prosedur QC untuk pengecekan langkah demi langkah.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Link
            to="/knowledge"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:shadow-lg transition"
          >
            <BookOpen className="h-4 w-4" /> Buka Knowledge <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/prosedur"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-background px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition"
          >
            <ClipboardList className="h-4 w-4" /> Lihat Prosedur QC <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      {/* keep Wrench import used */}
      <Wrench className="hidden" />
    </section>
  );
}
