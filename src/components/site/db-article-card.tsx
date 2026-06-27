import { Link } from "@tanstack/react-router";
import { Calendar, ArrowRight, ExternalLink } from "lucide-react";
import type { DbArticleRow } from "@/lib/db-articles.functions";

export function DbArticleCard({
  article,
  categoryLabel,
  fallbackImage,
}: {
  article: DbArticleRow;
  categoryLabel: string;
  fallbackImage: string;
}) {
  const img = article.featured_image || fallbackImage;
  return (
    <Link
      to="/artikel/$slug"
      params={{ slug: article.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-background transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={img}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 bottom-2 inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
          {categoryLabel}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
        )}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(article.updated_at).toLocaleDateString("id-ID", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
          {article.reference_url && (
            <span className="inline-flex items-center gap-1" title="Diimpor dari sumber eksternal">
              <ExternalLink className="h-3 w-3" /> Sumber
            </span>
          )}
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Baca Artikel <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
