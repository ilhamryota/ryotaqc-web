import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  CheckCircle2,
  LayoutGrid,
  BookOpen,
  GraduationCap,
  RefreshCw,
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
import { informasi, THUMBS, type Article } from "@/lib/articles";
import { listPublishedArticles } from "@/lib/db-articles.functions";
import { DbArticleCard } from "@/components/site/db-article-card";
import secInformasi from "@/assets/sec-informasi.jpg";

// Per-slug curated thumbnails for the Informasi section
import infoWin from "@/assets/info/01-windows-spec.jpg";
import infoDriver from "@/assets/info/02-driver.jpg";
import infoWin1011 from "@/assets/info/03-win10-11.jpg";
import infoBios from "@/assets/info/04-bios.jpg";
import infoActivation from "@/assets/info/05-activation.jpg";
import infoSsdHdd from "@/assets/info/06-ssd-hdd.jpg";
import infoCpu from "@/assets/info/07-cpu.jpg";
import infoRam from "@/assets/info/08-ram.jpg";
import infoVga from "@/assets/info/09-vga.jpg";
import infoBattery from "@/assets/info/10-battery.jpg";

const SLUG_THUMB: Record<string, string> = {
  "membaca-spesifikasi-windows": infoWin,
  "apa-itu-driver-laptop": infoDriver,
  "perbedaan-windows-10-dan-11": infoWin1011,
  "bios-dan-uefi": infoBios,
  "cek-aktivasi-windows": infoActivation,
  "perbedaan-ssd-dan-hdd": infoSsdHdd,
  "membaca-spek-processor-intel": infoCpu,
  "ram-ddr3-ddr4-ddr5": infoRam,
  "vga-integrated-vs-dedicated": infoVga,
  "ciri-baterai-laptop-rusak": infoBattery,
};

export const Route = createFileRoute("/informasi")({
  head: () => ({
    meta: [
      { title: "Informasi Software & Hardware — Ryota QC" },
      { name: "description", content: "Artikel edukasi software & hardware untuk QC Laptop, MacBook, dan Desktop." },
      { property: "og:title", content: "Informasi Software & Hardware — Ryota QC" },
      { property: "og:description", content: "Materi edukasi ringkas seputar sistem operasi, driver, BIOS, storage, RAM, VGA, dan baterai." },
      { property: "og:image", content: secInformasi },
    ],
  }),
  component: Informasi,
});

function Informasi() {
  const software = informasi.filter((a) => a.kind === "software");
  const hardware = informasi.filter((a) => a.kind === "hardware");

  const fetchPublished = useServerFn(listPublishedArticles);
  const { data: dbArticles = [] } = useQuery({
    queryKey: ["public-articles", "informasi"],
    queryFn: () => fetchPublished({ data: { type: "informasi" } }),
    staleTime: 60_000,
  });

  return (
    <div>
      <InformasiHero />

      <Container className="!py-10">
        {/* Stats / Feature strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: LayoutGrid, title: "2 Kategori Utama", desc: "Software & Hardware dengan topik terlengkap." },
            { icon: BookOpen, title: "Materi Terstruktur", desc: "Artikel disusun rapi agar mudah dipahami." },
            { icon: GraduationCap, title: "Mudah Dipelajari", desc: "Bahasa sederhana & langsung ke inti materi." },
            { icon: RefreshCw, title: "Update Berkala", desc: "Konten selalu diperbarui sesuai kebutuhan QC." },
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
                  Artikel <span className="text-primary">Terbaru</span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                  Artikel terkini yang diterbitkan tim editor melalui admin panel.
                </p>
              </div>
            </div>
            <div className="mt-7 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {dbArticles.map((a, i) => (
                <Reveal key={a.id} delay={i * 40}>
                  <DbArticleCard article={a} categoryLabel="Informasi" fallbackImage={secInformasi} />
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* Kategori Software */}
        <CategorySection
          icon={Code2}
          title="Software"
          desc="Panduan dan penjelasan seputar sistem operasi, driver, BIOS, dan aktivasi Windows."
          articles={software}
          ctaLabel="Lihat Semua Software"
          ctaHref="?cat=software"
        />

        {/* Kategori Hardware */}
        <CategorySection
          icon={Cpu}
          title="Hardware"
          desc="Panduan dan informasi penting seputar komponen hardware laptop & desktop."
          articles={hardware}
          ctaLabel="Lihat Semua Hardware"
          ctaHref="?cat=hardware"
        />

        {/* Learning CTA */}
        <LearningCTA />
      </Container>
    </div>
  );
}

/* ---------------- Hero ---------------- */
function InformasiHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Informasi</div>
            <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight">
              Informasi{" "}
              <span className="text-primary">Software</span>
              <br />& Hardware
            </h1>
            <p className="mt-5 max-w-md text-sm md:text-base text-muted-foreground leading-relaxed">
              Artikel edukasi dan panduan ringkas seputar software & hardware
              untuk QC Laptop, MacBook, dan Desktop. Materi disusun rapi agar
              mudah dipahami dan langsung bisa diterapkan.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              {["Akurat", "Terstruktur", "Praktis", "Update Berkala"].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <img
              src={secInformasi}
              alt="Ilustrasi materi informasi software & hardware"
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
  ctaHref,
}: {
  icon: typeof Code2;
  title: string;
  desc: string;
  articles: Article[];
  ctaLabel: string;
  ctaHref: string;
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
          to="/informasi"
          search={{}}
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
  const img = SLUG_THUMB[article.slug];
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
        <span className="absolute left-2 bottom-2 inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {categoryLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition">
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
    <section className="mt-12 rounded-3xl border border-primary/30 bg-primary/5 p-6 md:p-8">
      <div className="grid md:grid-cols-[auto,1fr,auto] gap-6 items-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary/15 text-primary">
          <GraduationCap className="h-10 w-10" />
        </div>
        <div>
          <h3 className="font-display text-xl md:text-2xl font-bold">
            Terus belajar, tingkatkan kualitas QC
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Jelajahi Knowledge untuk materi lebih mendalam dan buka Prosedur QC
            untuk panduan langkah demi langkah.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
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
    </section>
  );
}

/* ---------------- Re-exported generic ArticleCard (used by maintenance & artikel pages) ---------------- */
export function ArticleCard({ article }: { article: Article }) {
  const img = SLUG_THUMB[article.slug] ?? THUMBS[article.thumb];
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group block h-full overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent opacity-80" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {article.kind}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition">
          {article.title}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(article.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readMinutes} mnt</span>
        </div>
      </div>
    </Link>
  );
}
