import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type DbArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  article_type: "informasi" | "maintenance";
  tags: string[] | null;
  reference_url: string | null;
  updated_at: string;
};

export const listPublishedArticles = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ type: z.enum(["informasi", "maintenance"]) }).parse(d),
  )
  .handler(async ({ data }): Promise<DbArticleRow[]> => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("articles")
      .select("id,slug,title,excerpt,content,featured_image,article_type,tags,reference_url,updated_at")
      .eq("status", "published")
      .eq("article_type", data.type)
      .order("updated_at", { ascending: false });
    if (error) return [];
    return (rows ?? []) as DbArticleRow[];
  });

export const getPublishedArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }): Promise<DbArticleRow | null> => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("articles")
      .select("id,slug,title,excerpt,content,featured_image,article_type,tags,reference_url,updated_at")
      .eq("status", "published")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) return null;
    return (row as DbArticleRow) ?? null;
  });
