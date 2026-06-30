import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, PrimaryButton, inputCls } from "@/components/admin/ui";
import { Modal } from "@/components/admin/modal";
import {
  Pencil,
  MoreVertical,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  FileEdit,
  Trash2,
  Calendar,
  Home,
  Phone,
  Info,
  BookOpen,
  Wrench,
  ClipboardList,
  HelpCircle,
  Sparkles,
  ClipboardCheck,
  File as FileIcon,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export const Route = createFileRoute("/admin/pages")({ ssr: false, component: AdminPages });

const slugIcon: Record<string, any> = {
  beranda: Home,
  "": Home,
  contact: Phone,
  informasi: Info,
  knowledge: BookOpen,
  maintenance: Wrench,
  prosedur: ClipboardList,
  quiz: HelpCircle,
  ai: Sparkles,
  sop: ClipboardCheck,
  tools: Wrench,
};

function iconFor(slug: string) {
  return slugIcon[slug?.toLowerCase()] ?? FileIcon;
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

function AdminPages() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sort, setSort] = useState<"title" | "updated">("title");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => (await supabase.from("pages").select("*").order("title")).data ?? [],
  });

  const filtered = useMemo(() => {
    let r = rows ?? [];
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter((x: any) => x.title?.toLowerCase().includes(s) || x.slug?.toLowerCase().includes(s));
    }
    if (statusFilter !== "all") r = r.filter((x: any) => x.status === statusFilter);
    r = [...r].sort((a: any, b: any) => {
      if (sort === "title") return (a.title ?? "").localeCompare(b.title ?? "");
      return new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime();
    });
    return r;
  }, [rows, search, statusFilter, sort]);

  const total = rows?.length ?? 0;
  const published = (rows ?? []).filter((r: any) => r.status === "published").length;
  const draft = (rows ?? []).filter((r: any) => r.status === "draft").length;
  const trash = (rows ?? []).filter((r: any) => r.status === "trash").length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function save(f: any) {
    if (f.id) {
      await supabase.from("pages").update({
        title: f.title, slug: f.slug, content: f.content, featured_image: f.featured_image,
        meta_title: f.meta_title, meta_description: f.meta_description, status: f.status,
      }).eq("id", f.id);
    } else {
      await supabase.from("pages").insert({
        title: f.title, slug: f.slug, content: f.content, featured_image: f.featured_image,
        meta_title: f.meta_title, meta_description: f.meta_description, status: f.status ?? "draft",
      });
    }
    setEditing(null);
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["admin-pages"] });
  }

  async function setStatus(id: string, status: "draft" | "published") {
    await supabase.from("pages").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-pages"] });
    setMenuOpen(null);
  }

  async function remove(id: string) {
    if (!confirm("Hapus halaman ini?")) return;
    await supabase.from("pages").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-pages"] });
    setMenuOpen(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola semua halaman utama website RyotaQC.</p>
        </div>
        <button
          onClick={() => setEditing({ title: "", slug: "", content: "", status: "draft" })}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
        >
          <Plus className="h-4 w-4" /> Buat Halaman
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Halaman" value={total} hint="Halaman utama" tint="blue" />
        <StatCard icon={ClipboardCheck} label="Published" value={published} hint="Halaman aktif" tint="emerald" />
        <StatCard icon={Eye} label="Draft" value={draft} hint="Belum diterbitkan" tint="amber" />
        <StatCard icon={Trash2} label="Trash" value={trash} hint="Dihapus" tint="rose" />
      </div>

      {/* Toolbar + Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari halaman..."
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Filter className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
                className="appearance-none rounded-lg border border-input bg-background pl-9 pr-8 py-2 text-sm"
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="relative">
              <ArrowUpDown className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="appearance-none rounded-lg border border-input bg-background pl-9 pr-8 py-2 text-sm"
              >
                <option value="title">Urutkan: Judul</option>
                <option value="updated">Urutkan: Diperbarui</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Halaman</th>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Terakhir Diperbarui</th>
                <th className="text-right px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Memuat...</td></tr>
              )}
              {!isLoading && pageRows.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Tidak ada halaman.</td></tr>
              )}
              {pageRows.map((r: any) => {
                const Icon = iconFor(r.slug);
                const dt = formatDate(r.updated_at ?? r.created_at);
                return (
                  <tr key={r.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div className="font-semibold">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.meta_description || r.meta_title || "Halaman website"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">/{r.slug}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        r.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {r.status === "published" ? "Published" : "Draft"}
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
                        <button
                          onClick={() => setEditing(r)}
                          className="inline-grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                          className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                        {menuOpen === r.id && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-9 z-30 w-44 rounded-lg border border-border bg-popover shadow-lg py-1 text-sm">
                              <button onClick={() => { setEditing(r); setMenuOpen(null); }} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                <FileEdit className="h-3.5 w-3.5" /> Edit
                              </button>
                              {r.status === "published" ? (
                                <button onClick={() => setStatus(r.id, "draft")} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5" /> Jadikan Draft
                                </button>
                              ) : (
                                <button onClick={() => setStatus(r.id, "published")} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                                  <Eye className="h-3.5 w-3.5" /> Publish
                                </button>
                              )}
                              <button onClick={() => remove(r.id)} className="w-full text-left px-3 py-2 hover:bg-accent text-rose-600 flex items-center gap-2">
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
            Menampilkan {pageRows.length} dari {filtered.length} halaman
          </div>
          <div className="flex items-center gap-2 mx-auto">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`grid h-8 min-w-8 px-2 place-items-center rounded-md text-sm ${
                  page === i + 1 ? "bg-blue-600 text-white" : "border border-border hover:bg-accent"
                }`}
              >
                {i + 1}
              </button>
            ))}
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

      <Modal open={!!editing || creating} onClose={() => { setEditing(null); setCreating(false); }} title={editing?.id ? "Edit Halaman" : "Buat Halaman"} size="xl">
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Judul"><input required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field>
              <Field label="Slug"><input required value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Konten">
              <RichTextEditor
                content={editing.content ?? ""}
                onChange={(html) => setEditing({ ...editing, content: html })}
                placeholder="Tulis konten halaman di sini..."
              />
            </Field>
            <Field label="URL Gambar"><input value={editing.featured_image ?? ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })} className={inputCls} /></Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Meta Title"><input value={editing.meta_title ?? ""} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} className={inputCls} /></Field>
              <Field label="Meta Description"><input value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} className={inputCls} /></Field>
            </div>
            <Field label="Status">
              <select value={editing.status ?? "draft"} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputCls + " max-w-[180px]"}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => { setEditing(null); setCreating(false); }} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
              <PrimaryButton type="submit">Simpan</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, hint, tint,
}: { icon: any; label: string; value: number; hint: string; tint: "blue" | "emerald" | "amber" | "rose" }) {
  const tints: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20",
    rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20",
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
