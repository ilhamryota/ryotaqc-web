# Rencana: Refactor, Audit, SEO, Performa & Error Handling — Ryota QC

Cakupan besar. Saya bagi menjadi 5 fase yang bisa di-approve sekaligus atau dipecah. Tidak ada perubahan desain visual — fokus struktur, keamanan, performa, SEO, dan stabilitas.

## Fase 1 — Refactor Komponen Reusable

Banyak route mengulang pola yang sama (stats strip, kartu kategori, grid artikel, toolbar admin). Saya ekstrak menjadi komponen di `src/components/site/` dan `src/components/admin/`.

**Komponen baru:**
- `site/stats-strip.tsx` — 3–4 kartu statistik (dipakai prosedur, sop, knowledge, quiz, tools)
- `site/section-header.tsx` — eyebrow + title + subtitle yang konsisten
- `site/article-grid.tsx` — grid kartu artikel + empty/loading state (dipakai informasi & maintenance)
- `site/category-card.tsx` — kartu kategori dengan gambar AI
- `site/empty-state.tsx` & `site/loading-skeleton.tsx`
- `admin/data-toolbar.tsx` — search + filter + sort (dipakai 8 halaman admin)
- `admin/stat-card.tsx` — kartu statistik admin yang seragam
- `admin/data-table.tsx` — tabel generic dengan pagination

**Hook baru:**
- `hooks/use-debounced-value.ts` — debounce search input (sekarang setiap keystroke trigger query)
- `hooks/use-supabase-list.ts` — wrapper TanStack Query untuk list+filter
- `hooks/use-realtime-table.ts` — subscribe Supabase channel reusable

**Library:**
- `lib/format.ts` — `formatDate`, `formatRelative`, `slugify`, `truncate`
- `lib/validation.ts` — schema Zod terpusat (article, sop, procedure, tool, quiz, contact)

## Fase 2 — Code Review (Kualitas, Keamanan, Performa)

### Bug & error yang akan diperbaiki
1. **Autoplay audio** — pause kadang tidak respons karena race condition dengan unmute listener. Saya pastikan `userPausedRef` di-check di semua jalur.
2. **`knowledge.$level.tsx` & `quiz.$level.tsx`** — cast enum sudah diperbaiki turn lalu; saya kunci dengan helper type guard `isLevel()`.
3. **`use-auth.ts`** — `setTimeout(loadRoles, 0)` rentan race; refactor ke channel async aman.
4. **Loader vs SSR** — beberapa route public memakai `useQuery` client-side padahal bisa di-prefetch via loader untuk SEO. Saya prefetch di loader memakai `ensureQueryData`.
5. **`global-search.tsx`** — query tanpa debounce → spam request. Tambah debounce 200ms.
6. **`admin.users.tsx`** — invite modal map email→profile bisa gagal silent. Tambah toast error & loading state.
7. **Hydration warning** — `__root.tsx` sudah `suppressHydrationWarning`, tapi `ThemeProvider` masih bisa mismatch. Pakai `ScriptOnce` untuk inject class theme pra-hidrasi.

### Keamanan
- **Form Kontak** — validasi Zod sebelum `mailto:`, batasi panjang & encode.
- **Article importer (Firecrawl)** — validasi URL (https only, host allowlist opsional) sebelum fetch.
- **Storage upload** — validasi mime type & ukuran di klien sebelum upload (sekarang menerima file apapun).
- **RLS check** — audit policy `articles`, `qc_tools`, `quiz_questions` memastikan anon hanya bisa SELECT `status='published'`.
- **`dangerouslySetInnerHTML`** — sweep semua tempat artikel render konten; pasang DOMPurify.
- **Input length limit** — `maxLength` di semua textarea/input admin.

### Performa
- Lazy-load `MusicProvider` audio element (jangan inisialisasi pre-hidrasi).
- Lazy-load `global-search` (Command-K) dengan dynamic import.
- Convert gambar hero & kartu AI yang besar ke WebP via `vite-imagetools`.
- Preload LCP image hero di `head().links`.
- Tambah `staleTime` 60–300s di query yang jarang berubah (categories, settings, tools).
- Set `defaultPreloadStaleTime: 0` (sudah ada) + audit double-fetch.
- Code-split admin: pastikan admin bundle terpisah dari public bundle.

## Fase 3 — SEO Lengkap

### Per-route head metadata
Setiap route public mendapat `head()` unik: title, description, og:title, og:description, og:url, canonical, og:type, og:image (bila ada).

**Routes:** `/`, `/prosedur`, `/sop`, `/sop/$kategori`, `/informasi`, `/maintenance`, `/artikel/$slug`, `/knowledge`, `/knowledge/$level`, `/quiz`, `/quiz/$level`, `/tools`, `/ai`, `/contact`.

### Dynamic OG image
- Artikel: `og:image` dari `featured_image` di loader.
- Knowledge & quiz level: gambar level.
- Tools: tidak perlu og image custom.

### JSON-LD
- Root: `Organization` + `WebSite` (dengan `SearchAction`).
- Artikel: `Article` + `BreadcrumbList`.
- SOP/Knowledge level: `Article` ringkas + `BreadcrumbList`.
- Quiz: `Quiz` schema (tipe Schema.org).
- Tools list: `ItemList`.

### sitemap.xml & robots.txt
- `src/routes/sitemap[.]xml.tsx` dinamis — gabung route statis + artikel + SOP kategori + knowledge level + quiz level dari Supabase (filter `status='published'`).
- `public/robots.txt` — `Allow: /`, `Disallow: /admin`. Sitemap directive ditambah saat domain final tersedia.

### Loader prefetch untuk SSR
Pindahkan list query route public ke loader (`ensureQueryData`) sehingga HTML di-render dengan konten — penting buat crawler & LCP.

### Public reads via server functions
Sekarang beberapa loader dipanggil client. Saya tambah server function publishable-key untuk: `listProcedures`, `listSops`, `listTools`, `listKnowledge`, `listQuiz` agar SSR aman (tanpa bearer token).

## Fase 4 — Error Handling

- `errorComponent` + `notFoundComponent` pada SEMUA route dengan loader (sekarang banyak yang tidak punya).
- Wrap mutasi admin dengan `try/catch` + toast `sonner` konsisten.
- `errorBoundary` per-section di Hero supaya komponen pihak ketiga (animasi, audio) gagal tidak men-crash halaman.
- `console.error` diganti `reportLovableError` di tempat yang relevan.
- Global fetch wrapper untuk Supabase (`from(...).select().throwOnError()`) di hook reusable, sehingga error pasti ditangkap.
- Tampilkan banner "Offline / koneksi gagal" via `navigator.onLine` listener di layout.

## Fase 5 — Migrasi DB Kecil

- Tambah index: `articles(status, article_type, updated_at desc)`, `quiz_questions(status, level)`, `knowledge_materials(status, level)`, `qc_tools(status, platform)`.
- Verifikasi `GRANT SELECT TO anon` untuk seluruh tabel publik (artikel, sop_items, procedure_steps, knowledge_materials, quiz_questions, qc_tools, categories, pages, site_settings) sudah ada — perbaiki bila kurang.

## Cara eksekusi
Saya kerjakan berurutan Fase 1 → 5 dalam beberapa turn (tiap turn 1 fase agar bisa di-review). Setelah selesai, saya jalankan SEO scan resmi dan tandai temuan yang sudah diperbaiki.

## Yang TIDAK akan berubah
- Palet warna & desain visual (tetap "Sapphire Light" + carbon dark mode toggle).
- Konten yang sudah ada di Supabase (seed tetap).
- Music player UX (cuma fix bug pause).
- Struktur admin panel & hak akses.

Mau saya lanjutkan dengan semua fase, atau prioritaskan salah satu dulu (mis. Fase 2+4 bug & error handling dulu, baru SEO)?