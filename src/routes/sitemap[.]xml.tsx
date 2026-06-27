import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// TODO: replace once a project domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/prosedur", changefreq: "weekly", priority: "0.9" },
  { path: "/sop", changefreq: "weekly", priority: "0.9" },
  { path: "/informasi", changefreq: "daily", priority: "0.8" },
  { path: "/maintenance", changefreq: "daily", priority: "0.8" },
  { path: "/knowledge", changefreq: "weekly", priority: "0.8" },
  { path: "/quiz", changefreq: "weekly", priority: "0.7" },
  { path: "/tools", changefreq: "weekly", priority: "0.7" },
  { path: "/ai", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
];

const SOP_KATEGORI = ["battery", "storage", "lcd", "keyboard", "computrace", "ram", "motherboard", "thermal", "ports", "speaker", "camera"];
const KNOWLEDGE_LEVELS = ["dasar", "menengah", "lanjutan", "tinggi"];
const QUIZ_LEVELS = ["1", "2", "3", "4"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...STATIC];

        for (const k of SOP_KATEGORI) entries.push({ path: `/sop/${k}`, changefreq: "monthly", priority: "0.6" });
        for (const l of KNOWLEDGE_LEVELS) entries.push({ path: `/knowledge/${l}`, changefreq: "weekly", priority: "0.7" });
        for (const l of QUIZ_LEVELS) entries.push({ path: `/quiz/${l}`, changefreq: "weekly", priority: "0.6" });

        // Pull published articles from DB (best-effort; ignore failures).
        try {
          const sb = createClient<Database>(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await sb
            .from("articles")
            .select("slug, updated_at")
            .eq("status", "published")
            .order("updated_at", { ascending: false })
            .limit(1000);
          if (data) {
            for (const a of data) {
              if (!a.slug) continue;
              entries.push({
                path: `/artikel/${a.slug}`,
                lastmod: a.updated_at ? new Date(a.updated_at).toISOString() : undefined,
                changefreq: "monthly",
                priority: "0.7",
              });
            }
          }
        } catch {
          /* ignore — sitemap stays with static + categorical entries */
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
