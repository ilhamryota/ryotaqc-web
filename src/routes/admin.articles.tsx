import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Field, PrimaryButton, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import {
  Download,
  Loader2,
  Pencil,
  MoreVertical,
  Plus,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileEdit,
  Trash2,
  FileText,
  CheckCircle2,
  PenLine,
  CalendarClock,
  Calendar,
  Monitor,
  HardDrive,
  BatteryCharging,
  Monitor as MonitorIcon,
  Wrench,
  Thermometer,
  Settings,
  FileIcon,
  TrendingUp,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { importArticleFromUrl } from "@/lib/firecrawl-import.functions";

export const Route = createFileRoute("/admin/articles")({
  ssr: false,
  component: AdminArticles,
});

type ArticleStatus = "draft" | "published" | "scheduled";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  article_type: "informasi" | "maintenance";
  category_id: string | null;
  featured_image: string | null;
  attachment_url: string | null;
  reference_url: string | null;
  tags: string[] | null;
  status: ArticleStatus;
  published_at?: string | null;
  updated_at: string;
  created_by?: string | null;
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function formatDate(iso?: string | null) {
  if (!iso) return { d: "—", t: "" };
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return {
    d: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    t: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} WIB`,
  };
}

function iconForArticle(a: Article) {
  const t = `${a.title} ${a.slug}`.toLowerCase();
  if (t.includes("windows") || t.includes("install os") || t.includes("bios")) return Monitor;
  if (t.includes("ssd") || t.includes("hdd") || t.includes("storage") || t.includes("disk")) return HardDrive;
  if (t.includes("baterai") || t.includes("battery")) return BatteryCharging;
  if (t.includes("lcd") || t.includes("layar") || t.includes("display") || t.includes("screen")) return MonitorIcon;
  if (t.includes("cleaning") || t.includes("bersih") || t.includes("rawat") || t.includes("maintenance")) return Wrench;
  if (t.includes("overheat") || t.includes("panas") || t.includes("suhu")) return Thermometer;
  if (t.includes("bios") || t.includes("reset") || t.includes("setting")) return Settings;
  return FileIcon;
}

function iconTint(a: Article) {
  if (a.article_type === "maintenance") return "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20";
  return "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20";
}

function TypeBadge({ type, category }: { type: "informasi" | "maintenance"; category?: string | null }) {
  const label = category || (type === "informasi" ? "Informasi" : "Maintenance");
  const styles =
    type === "maintenance"
      ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${styles}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: ArticleStatus }) {
  const styles =
    status === "published"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
      : status === "scheduled"
        ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20"
        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  const dot = status === "published" ? "bg-emerald-500" : status === "scheduled" ? "bg-violet-500" : "bg-amber-500";
  const label = status === "published" ? "Published" : status === "scheduled" ? "Scheduled" : "Draft";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StatCard({
  icon: Icon, label, value, hint, tint,
}: { icon: any; label: string; value: number; hint: string; tint: "blue" | "emerald" | "amber" | "violet" }) {
  const tints: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
    violet: "bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-xl border ${tints[tint]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold tabular-nums leading-tight mt-0.5">{value}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
        </div>
      </div>
    </div>
  );
}

function AdminArticles() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "informasi" | "maintenance">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ArticleStatus>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const [editing, setEditing] = useState<Article | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importType, setImportType] = useState<"informasi" | "maintenance">("informasi");
  const [importCategoryId, setImportCategoryId] = useState<string>("");
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const runImport = useServerFn(importArticleFromUrl);

  const { data: cats } = useQuery({
    queryKey: ["categories-all"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: async () =>
      (await supabase.from("articles").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const total = articles?.length ?? 0;
  const published = (articles ?? []).filter((a: any) => a.status === "published").length;
  const draft = (articles ?? []).filter((a: any) => a.status === "draft").length;
  const scheduled = (articles ?? []).filter((a: any) => a.status === "scheduled").length;
  const publishedPct = total ? Math.round((published / total) * 100) : 0;

  const filtered = useMemo(() => {
    let r = (articles ?? []) as Article[];
    if (typeFilter !== "all") r = r.filter((a) => a.article_type === typeFilter);
    if (statusFilter !== "all") r = r.filter((a) => a.status === statusFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter((a) => a.title.toLowerCase().includes(s) || a.slug.toLowerCase().includes(s));
    }
    r = [...r].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const at = new Date(a.updated_at).getTime();
      const bt = new Date(b.updated_at).getTime();
      return sort === "newest" ? bt - at : at - bt;
    });
    return r;
  }, [articles, typeFilter, statusFilter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  function openNew() {
    setEditing({
      id: "",
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      article_type: "informasi",
      category_id: null,
      featured_image: "",
      attachment_url: "",
      reference_url: "",
      tags: [],
      status: "draft",
      published_at: null,
      updated_at: "",
    });
    setModalOpen(true);
  }

  async function save(form: Article) {
    const payload: any = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      article_type: form.article_type,
      category_id: form.category_id || null,
      featured_image: form.featured_image,
      attachment_url: form.attachment_url,
      reference_url: form.reference_url,
      tags: form.tags,
      status: form.status,
      published_at: form.published_at || null,
    };
    if (form.id) {
      await supabase.from("articles").update(payload).eq("id", form.id);
    } else {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("articles").insert({ ...payload, created_by: u.user?.id });
    }
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-articles"] });
  }

  async function setStatus(id: string, status: ArticleStatus) {
    await supabase.from("articles").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-articles"] });
    setMenuOpen(null);
  }

  async function remove(id: string) {
    await supabase.from("articles").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-articles"] });
    setDeleteId(null);
    setMenuOpen(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola artikel Informasi &amp; Maintenance. Impor dari URL atau buat baru.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setImportError(null); setImportUrl(""); setImportOpen(true); }}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-blue-50/60 dark:bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/15 transition"
          >
            <Download className="h-4 w-4" /> Impor dari URL
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4" /> Artikel Baru
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-6 min-w-0">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Artikel" value={total} hint="Semua artikel" tint="blue" />
            <StatCard icon={CheckCircle2} label="Published" value={published} hint={`${publishedPct}% dari total`} tint="emerald" />
            <StatCard icon={PenLine} label="Draft" value={draft} hint="Siap untuk diterbitkan" tint="amber" />
            <StatCard icon={CalendarClock} label="Scheduled" value={scheduled} hint="Terjadwal" tint="violet" />
          </div>

          {/* Toolbar + Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Cari judul..."
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }}
                className="appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
              >
                <option value="all">Semua tipe</option>
                <option value="informasi">Informasi</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm min-w-[150px]"
              >
                <option value="all">Semua status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <div className="relative ml-auto">
                <ArrowUpDown className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="appearance-none rounded-lg border border-input bg-background pl-9 pr-8 py-2 text-sm"
                >
                  <option value="newest">Terbaru dulu</option>
                  <option value="oldest">Terlama dulu</option>
                  <option value="title">Judul A–Z</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Judul</th>
                    <th className="text-left px-5 py-3 font-medium">Tipe</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium w-12"></th>
                    <th className="text-left px-5 py-3 font-medium">Update</th>
                    <th className="text-right px-5 py-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Memuat...</td></tr>
                  )}
                  {!isLoading && pageRows.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">Belum ada artikel.</td></tr>
                  )}
                  {pageRows.map((a) => {
                    const Icon = iconForArticle(a);
                    const dt = formatDate(a.updated_at);
                    const cat = cats?.find((c: any) => c.id === a.category_id);
                    return (
                      <tr key={a.id} className="hover:bg-muted/30 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`grid h-10 w-10 place-items-center rounded-lg border ${iconTint(a)}`}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{a.title}</div>
                              <div className="text-xs text-muted-foreground truncate">/{a.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <TypeBadge type={a.article_type} category={cat?.name} />
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-4">
                          <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                            IL
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="leading-tight">
                              <div className="text-sm font-medium">{dt.d}</div>
                              <div className="text-xs text-muted-foreground">{dt.t}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 relative">
                            {a.status === "published" && (
                              <a
                                href={`/artikel/${a.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent"
                                title="Lihat"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => { setEditing(a); setModalOpen(true); }}
                              className="inline-grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                              className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>
                            {menuOpen === a.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-9 z-30 w-48 rounded-lg border border-border bg-popover shadow-lg py-1 text-sm">
                                  <button onClick={() => { setEditing(a); setModalOpen(true); setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                    <FileEdit className="h-3.5 w-3.5" /> Edit
                                  </button>
                                  {a.status !== "published" && (
                                    <button onClick={() => setStatus(a.id, "published")} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> Publish
                                    </button>
                                  )}
                                  {a.status !== "draft" && (
                                    <button onClick={() => setStatus(a.id, "draft")} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                      <PenLine className="h-3.5 w-3.5" /> Jadikan Draft
                                    </button>
                                  )}
                                  {a.status !== "scheduled" && (
                                    <button onClick={() => setStatus(a.id, "scheduled")} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                      <CalendarClock className="h-3.5 w-3.5" /> Jadwalkan
                                    </button>
                                  )}
                                  <button onClick={() => { setDeleteId(a.id); setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-accent text-rose-600 flex items-center gap-2">
                                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Menampilkan {pageRows.length === 0 ? 0 : start + 1}-{start + pageRows.length} dari {filtered.length} artikel
              </div>
              <div className="flex items-center gap-1 mx-auto">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`grid h-8 min-w-8 px-2 place-items-center rounded-md text-sm ${
                        page === n ? "bg-blue-600 text-white" : "border border-border hover:bg-accent"
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm"
              >
                <option value={5}>5 / halaman</option>
                <option value={10}>10 / halaman</option>
                <option value={25}>25 / halaman</option>
                <option value={50}>50 / halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="font-semibold">Artikel Insights</div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Tingkat Publikasi</span>
                  <span className="font-semibold text-foreground">{publishedPct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${publishedPct}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Perubahan (30 hari)</span>
                <span className="text-emerald-600 font-medium">↑ {total} artikel</span>
              </div>
              <a href="#" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                Baca Selengkapnya <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <div className="font-semibold">Quick Tips</div>
            </div>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-amber-500">•</span> Gunakan artikel untuk berbagi informasi bermanfaat.</li>
              <li className="flex gap-2"><span className="text-amber-500">•</span> Tambahkan gambar agar artikel lebih menarik.</li>
              <li className="flex gap-2"><span className="text-amber-500">•</span> Pastikan konten selalu up-to-date.</li>
            </ul>
            <a href="#" className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 hover:underline">
              Lihat Panduan Artikel <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </aside>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Edit Artikel" : "Artikel Baru"} size="xl">
        {editing && (
          <ArticleForm
            initial={editing}
            categories={cats ?? []}
            onSave={save}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>

      <ConfirmDelete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && remove(deleteId)}
        label="artikel ini"
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="Impor Artikel dari URL" size="md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setImportError(null);
            setImportLoading(true);
            try {
              const result = await runImport({ data: { url: importUrl } });
              setImportOpen(false);
              setEditing({
                id: "",
                title: result.title,
                slug: "",
                excerpt: result.excerpt,
                content: result.content,
                article_type: importType,
                category_id: importCategoryId || null,
                featured_image: result.featured_image,
                attachment_url: "",
                reference_url: result.reference_url,
                tags: result.tags,
                status: "draft",
                published_at: null,
                updated_at: "",
              });
              setModalOpen(true);
            } catch (err: any) {
              setImportError(err?.message || "Gagal mengimpor artikel.");
            } finally {
              setImportLoading(false);
            }
          }}
          className="space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            Tempel URL artikel dari sumber lain. Sistem akan mengambil judul, konten markdown, gambar utama, dan tag, lalu membuka editor untuk Anda meninjau & menyimpan.
          </p>
          <Field label="URL Artikel">
            <input
              type="url"
              required
              autoFocus
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://contoh.com/artikel-keren"
              className={inputCls}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Tipe">
              <select value={importType} onChange={(e) => setImportType(e.target.value as any)} className={inputCls}>
                <option value="informasi">Informasi</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </Field>
            <Field label="Kategori (opsional)">
              <select value={importCategoryId} onChange={(e) => setImportCategoryId(e.target.value)} className={inputCls}>
                <option value="">— Tanpa kategori —</option>
                {(cats ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
          {importError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {importError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button type="button" onClick={() => setImportOpen(false)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
            <PrimaryButton type="submit" disabled={importLoading}>
              {importLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Mengambil...</span> : "Impor & Edit"}
            </PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ArticleForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial: Article;
  categories: any[];
  onSave: (a: Article) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(initial);
  const tagsStr = (f.tags ?? []).join(", ");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Judul">
          <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Slug" hint="Otomatis dari judul jika kosong">
          <input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Tipe Artikel">
          <select value={f.article_type} onChange={(e) => setF({ ...f, article_type: e.target.value as any })} className={inputCls}>
            <option value="informasi">Informasi</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </Field>
        <Field label="Kategori">
          <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })} className={inputCls}>
            <option value="">— Tanpa kategori —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Deskripsi Singkat (excerpt)">
        <textarea rows={2} value={f.excerpt ?? ""} onChange={(e) => setF({ ...f, excerpt: e.target.value })} className={inputCls} />
      </Field>
      <Field label="Isi Artikel">
        <textarea rows={10} value={f.content ?? ""} onChange={(e) => setF({ ...f, content: e.target.value })} className={inputCls + " font-mono text-xs"} />
      </Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="URL Gambar Utama">
          <input value={f.featured_image ?? ""} onChange={(e) => setF({ ...f, featured_image: e.target.value })} className={inputCls} placeholder="https://..." />
        </Field>
        <Field label="URL Lampiran">
          <input value={f.attachment_url ?? ""} onChange={(e) => setF({ ...f, attachment_url: e.target.value })} className={inputCls} />
        </Field>
        <Field label="URL Referensi">
          <input value={f.reference_url ?? ""} onChange={(e) => setF({ ...f, reference_url: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Tags" hint="Pisahkan dengan koma">
          <input value={tagsStr} onChange={(e) => setF({ ...f, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ArticleStatus })} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </Field>
        {f.status === "scheduled" && (
          <Field label="Jadwal Publikasi">
            <input
              type="datetime-local"
              value={f.published_at ? new Date(f.published_at).toISOString().slice(0, 16) : ""}
              onChange={(e) => setF({ ...f, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className={inputCls}
            />
          </Field>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
        <PrimaryButton type="submit">Simpan</PrimaryButton>
      </div>
    </form>
  );
}
