import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, ExternalLink, Tag, User } from "lucide-react";
import { Container } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { findArticle, relatedArticles, THUMBS, type Article } from "@/lib/articles";
import { getPublishedArticleBySlug, type DbArticleRow } from "@/lib/db-articles.functions";
import { ArticleCard } from "./informasi";

type LoaderShape =
  | { source: "static"; article: Article }
  | { source: "db"; row: DbArticleRow };

export const Route = createFileRoute("/artikel/$slug")({
  loader: async ({ params }): Promise<LoaderShape> => {
    const staticOne = findArticle(params.slug);
    if (staticOne) return { source: "static", article: staticOne };
    const dbRow = await getPublishedArticleBySlug({ data: { slug: params.slug } });
    if (!dbRow) throw notFound();
    return { source: "db", row: dbRow };
  },
  head: ({ loaderData }: { loaderData?: LoaderShape }) => {
    if (!loaderData) return { meta: [{ title: "Artikel — Ryota QC" }] };
    if (loaderData.source === "static") {
      const a = loaderData.article;
      return {
        meta: [
          { title: `${a.title} — Ryota QC` },
          { name: "description", content: a.summary },
          { property: "og:title", content: a.title },
          { property: "og:description", content: a.summary },
          { property: "og:image", content: THUMBS[a.thumb] },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ],
      };
    }
    const r = loaderData.row;
    return {
      meta: [
        { title: `${r.title} — Ryota QC` },
        { name: "description", content: r.excerpt ?? "" },
        { property: "og:title", content: r.title },
        { property: "og:description", content: r.excerpt ?? "" },
        ...(r.featured_image ? [{ property: "og:image", content: r.featured_image }] : []),
        { property: "og:type", content: "article" },
      ],
    };
  },
  notFoundComponent: () => (
    <Container>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Artikel tidak ditemukan</h1>
        <Link to="/informasi" className="mt-4 inline-block text-primary hover:underline">
          ← Kembali ke Informasi
        </Link>
      </div>
    </Container>
  ),
  errorComponent: ({ error }) => (
    <Container>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold">Terjadi kesalahan</h1>
        <p className="mt-2 text-sm text-muted-foreground">{(error as Error)?.message}</p>
      </div>
    </Container>
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const data = Route.useLoaderData() as LoaderShape;
  if (data.source === "static") return <StaticArticleView article={data.article} />;
  return <DbArticleView row={data.row} />;
}

function StaticArticleView({ article }: { article: Article }) {
  const related = relatedArticles(article);
  const backTo = article.section === "informasi" ? "/informasi" : "/maintenance";
  const backLabel = article.section === "informasi" ? "Informasi" : "Maintenance";

  return (
    <article>
      <section className="relative overflow-hidden border-b border-border/60">
        <img src={THUMBS[article.thumb]} alt={article.title} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 md:py-20">
          <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali ke {backLabel}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/40 uppercase">{article.section}</span>
            <span className="rounded-full bg-card px-3 py-1 text-xs font-medium border border-border uppercase">{article.kind}</span>
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">{article.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{article.summary}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {article.author}</span>
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(article.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {article.readMinutes} menit baca</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 -mt-8 relative z-10">
        <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-glow)]">
          <img src={THUMBS[article.thumb]} alt={article.title} className="w-full aspect-[16/8] object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="space-y-8">
          {article.blocks.map((block, i) => (
            <Reveal key={i} delay={i * 60}>
              <section>
                {block.heading && (
                  <h2 className="font-display text-2xl font-bold mb-3 flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary text-sm font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {block.heading}
                  </h2>
                )}
                <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{block.body}</p>
              </section>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-2 pt-8 border-t border-border">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {article.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</span>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border/60 bg-card/30">
          <Container>
            <h2 className="font-display text-2xl font-bold mb-6">Artikel Terkait</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}

function renderMarkdown(md: string) {
  // Minimal markdown rendering: split by lines, handle ##/### headings, paragraphs.
  const lines = md.split(/\r?\n/);
  const out: React.ReactNode[] = [];
  let buf: string[] = [];
  const flush = (key: string) => {
    if (buf.length === 0) return;
    const text = buf.join(" ").trim();
    if (text) {
      out.push(
        <p key={key} className="text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {text}
        </p>,
      );
    }
    buf = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    if (/^###\s+/.test(line)) {
      flush(`p-${i}`);
      out.push(<h3 key={`h3-${i}`} className="font-display text-lg font-bold mt-6 mb-2">{line.replace(/^###\s+/, "")}</h3>);
    } else if (/^##\s+/.test(line)) {
      flush(`p-${i}`);
      out.push(<h2 key={`h2-${i}`} className="font-display text-2xl font-bold mt-8 mb-3">{line.replace(/^##\s+/, "")}</h2>);
    } else if (/^#\s+/.test(line)) {
      flush(`p-${i}`);
      out.push(<h1 key={`h1-${i}`} className="font-display text-3xl font-bold mt-8 mb-3">{line.replace(/^#\s+/, "")}</h1>);
    } else if (line === "") {
      flush(`p-${i}`);
    } else {
      buf.push(line);
    }
  });
  flush("p-end");
  return out;
}

function DbArticleView({ row }: { row: DbArticleRow }) {
  const backTo = row.article_type === "informasi" ? "/informasi" : "/maintenance";
  const backLabel = row.article_type === "informasi" ? "Informasi" : "Maintenance";
  const cover = row.featured_image;
  return (
    <article>
      <section className="relative overflow-hidden border-b border-border/60">
        {cover && <img src={cover} alt={row.title} className="absolute inset-0 h-full w-full object-cover opacity-30" />}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/85 to-background pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 md:py-20">
          <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Kembali ke {backLabel}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary border border-primary/40 uppercase">{row.article_type}</span>
            {row.reference_url && (
              <a href={row.reference_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium border border-border hover:border-primary/50">
                <ExternalLink className="h-3 w-3" /> Sumber asli
              </a>
            )}
          </div>
          <h1 className="mt-4 font-display text-3xl md:text-5xl font-bold leading-tight">{row.title}</h1>
          {row.excerpt && <p className="mt-4 text-lg text-muted-foreground max-w-2xl">{row.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(row.updated_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </div>
      </section>

      {cover && (
        <div className="mx-auto max-w-4xl px-4 -mt-8 relative z-10">
          <div className="overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-glow)]">
            <img src={cover} alt={row.title} className="w-full aspect-[16/8] object-cover" />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <div className="prose-like space-y-4">{renderMarkdown(row.content ?? "")}</div>

        {row.tags && row.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center gap-2 pt-8 border-t border-border">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {row.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
