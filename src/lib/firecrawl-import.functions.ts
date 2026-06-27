import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({ url: z.string().url() });

export type ImportedArticle = {
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  tags: string[];
  reference_url: string;
};

async function callFirecrawl(url: string, apiKey: string) {
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Firecrawl ${res.status}: ${txt.slice(0, 200) || res.statusText}`);
  }
  return (await res.json()) as {
    success?: boolean;
    data?: {
      markdown?: string;
      metadata?: {
        title?: string;
        description?: string;
        ogImage?: string;
        "og:image"?: string;
        keywords?: string | string[];
        sourceURL?: string;
      };
    };
    markdown?: string;
    metadata?: any;
  };
}

function pickImage(md: string, metaImg: string | undefined): string | null {
  if (metaImg) return metaImg;
  const m = md.match(/!\[[^\]]*\]\(([^)\s]+)/);
  return m ? m[1] : null;
}

function makeExcerpt(md: string, fallback?: string): string {
  if (fallback) return fallback.slice(0, 280);
  const plain = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 280);
}

export const importArticleFromUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }): Promise<ImportedArticle> => {
    // role check
    const { data: isStaff } = await context.supabase.rpc("is_staff", {
      _user_id: context.userId,
    });
    if (!isStaff) throw new Error("Forbidden");

    const key = process.env.FIRECRAWL_API_KEY;
    if (!key) throw new Error("FIRECRAWL_API_KEY belum diset. Hubungkan connector Firecrawl.");

    const res = await callFirecrawl(data.url, key);
    const payload = (res.data ?? res) as {
      markdown?: string;
      metadata?: {
        title?: string;
        description?: string;
        ogImage?: string;
        "og:image"?: string;
        keywords?: string | string[];
      };
    };
    const md = payload.markdown ?? "";
    const meta = payload.metadata ?? {};
    const img = pickImage(md, meta.ogImage ?? meta["og:image"]);
    const keywords = Array.isArray(meta.keywords)
      ? meta.keywords
      : typeof meta.keywords === "string"
        ? meta.keywords.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    return {
      title: (meta.title ?? "").trim() || "Untitled",
      excerpt: makeExcerpt(md, meta.description),
      content: md,
      featured_image: img,
      tags: keywords.slice(0, 8),
      reference_url: data.url,
    };
  });
