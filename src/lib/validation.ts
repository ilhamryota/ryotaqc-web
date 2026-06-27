import { z } from "zod";

/** Central Zod schemas — single source of truth for client + server validation. */

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama maks 80 karakter"),
  email: z.string().trim().email("Email tidak valid").max(255),
  subject: z.string().trim().min(3, "Subjek minimal 3 karakter").max(120),
  message: z.string().trim().min(10, "Pesan minimal 10 karakter").max(2000),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const articleImportSchema = z.object({
  url: z
    .string()
    .trim()
    .url("URL tidak valid")
    .refine((u) => u.startsWith("https://"), "Hanya URL https yang diperbolehkan"),
  category_id: z.string().uuid().optional(),
  article_type: z.enum(["informasi", "maintenance"]).default("informasi"),
});

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().max(120_000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  article_type: z.enum(["informasi", "maintenance", "knowledge", "blog"]).default("informasi"),
  category_id: z.string().uuid().optional().nullable(),
  featured_image: z.string().url().optional().nullable(),
});

export const sopSchema = z.object({
  kategori: z.string().trim().min(2).max(80),
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  steps: z.array(z.string().min(1).max(500)).max(50).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const toolSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
  platform: z.string().max(60).optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  download_url: z.string().url("URL download tidak valid").optional().nullable(),
  icon_url: z.string().url().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const fileUploadSchema = z.object({
  size: z.number().max(10 * 1024 * 1024, "Ukuran maksimum 10MB"),
  type: z
    .string()
    .regex(/^(image\/(png|jpe?g|webp|gif|svg\+xml)|application\/pdf)$/, "Format tidak didukung"),
});
