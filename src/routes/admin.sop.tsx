import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, PageHeader, PrimaryButton, StatusBadge, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import {
  Pencil, Trash2, Search, RotateCcw, Plus, ChevronLeft, ChevronRight, Eye,
  FileText, CheckCircle2, PencilLine, FolderOpen, Sparkles, ArrowRight,
  ShieldCheck, Monitor, Keyboard, BatteryFull, HardDrive, Plug, Camera,
  Wifi, MousePointer, Gauge, Cpu,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export const Route = createFileRoute("/admin/sop")({ ssr: false, component: AdminSop });

type Sop = {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  content: string | null;
  checklist_items: any;
  pass_criteria: string | null;
  minus_criteria: string | null;
  return_criteria: string | null;
  featured_image: string | null;
  status: "draft" | "published";
  updated_at: string;
};

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const SOP_ICONS: { match: RegExp; icon: any; tone: string }[] = [
  { match: /fisik/i, icon: ShieldCheck, tone: "bg-slate-100 text-slate-600" },
  { match: /lcd|layar|display/i, icon: Monitor, tone: "bg-violet-100 text-violet-600" },
  { match: /keyboard/i, icon: Keyboard, tone: "bg-amber-100 text-amber-600" },
  { match: /battery|baterai/i, icon: BatteryFull, tone: "bg-emerald-100 text-emerald-600" },
  { match: /storage|hdd|ssd/i, icon: HardDrive, tone: "bg-sky-100 text-sky-600" },
  { match: /port/i, icon: Plug, tone: "bg-rose-100 text-rose-600" },
  { match: /audio|mic|camera/i, icon: Camera, tone: "bg-teal-100 text-teal-600" },
  { match: /wifi|bluetooth/i, icon: Wifi, tone: "bg-indigo-100 text-indigo-600" },
  { match: /touch/i, icon: MousePointer, tone: "bg-pink-100 text-pink-600" },
  { match: /bench|stress|running/i, icon: Gauge, tone: "bg-orange-100 text-orange-600" },
  { match: /comput|bios|security/i, icon: Cpu, tone: "bg-blue-100 text-blue-600" },
];

function SopIcon({ title }: { title: string }) {
  const match = SOP_ICONS.find((s) => s.match.test(title));
  const Ico = match?.icon || ShieldCheck;
  const tone = match?.tone || "bg-slate-100 text-slate-600";
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
      <Ico className="h-4 w-4" />
    </div>
  );
}

function CategoryChip({ name }: { name: string }) {
  const palette = [
    "bg-sky-50 text-sky-700 ring-sky-100",
    "bg-violet-50 text-violet-700 ring-violet-100",
    "bg-amber-50 text-amber-700 ring-amber-100",
    "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "bg-rose-50 text-rose-700 ring-rose-100",
    "bg-teal-50 text-teal-700 ring-teal-100",
    "bg-indigo-50 text-indigo-700 ring-indigo-100",
    "bg-pink-50 text-pink-700 ring-pink-100",
    "bg-orange-50 text-orange-700 ring-orange-100",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const cls = palette[hash % palette.length];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 lowercase ${cls}`}>{name}</span>
  );
}

function StatTile({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: number; hint: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}\n${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} WIB`;
  } catch { return iso; }
}

function AdminSop() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Sop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const { data: cats } = useQuery({
    queryKey: ["sop-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").eq("type", "sop").order("name")).data ?? [],
  });
  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-sop"],
    queryFn: async () => (await supabase.from("sop_items").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const all = (rows ?? []) as Sop[];

  const stats = useMemo(() => {
    const total = all.length;
    const published = all.filter((r) => r.status === "published").length;
    const draft = all.filter((r) => r.status === "draft").length;
    const activeCats = new Set(all.map((r) => r.category_id).filter(Boolean)).size;
    return { total, published, draft, activeCats };
  }, [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.title.toLowerCase().includes(q) || (x.slug ?? "").toLowerCase().includes(q));
    }
    if (catFilter !== "all") r = r.filter((x) => x.category_id === catFilter);
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (sort === "newest") r = [...r].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
    if (sort === "oldest") r = [...r].sort((a, b) => +new Date(a.updated_at) - +new Date(b.updated_at));
    if (sort === "title") r = [...r].sort((a, b) => a.title.localeCompare(b.title));
    return r;
  }, [all, search, catFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  function resetFilters() {
    setSearch(""); setCatFilter("all"); setStatusFilter("all"); setSort("newest"); setPage(1);
  }

  function openNew() {
    setEditing({ id: "", title: "", slug: "", category_id: null, content: "", checklist_items: [], pass_criteria: "", minus_criteria: "", return_criteria: "", featured_image: "", status: "draft", updated_at: "" });
    setModalOpen(true);
  }

  async function save(f: Sop) {
    const payload = {
      title: f.title, slug: f.slug || slugify(f.title), category_id: f.category_id || null,
      content: f.content, checklist_items: Array.isArray(f.checklist_items) ? f.checklist_items : [],
      pass_criteria: f.pass_criteria, minus_criteria: f.minus_criteria, return_criteria: f.return_criteria,
      featured_image: f.featured_image, status: f.status,
    };
    if (f.id) await supabase.from("sop_items").update(payload).eq("id", f.id);
    else {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("sop_items").insert({ ...payload, created_by: u.user?.id });
    }
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-sop"] });
  }

  async function remove(id: string) {
    await supabase.from("sop_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-sop"] });
  }

  const catRows = useMemo(() => {
    const map = new Map<string, number>();
    all.forEach((r) => {
      const name = cats?.find((c: any) => c.id === r.category_id)?.name;
      if (!name) return;
      map.set(name, (map.get(name) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [all, cats]);

  return (
    <div>
      <PageHeader
        title="SOP QC"
        description="Kelola standar operasional prosedur quality control secara terstruktur."
        action={
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Tambah SOP Baru
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile icon={FileText} label="Total SOP" value={stats.total} hint="Semua SOP terdaftar" tone="bg-sky-50 text-sky-600" />
        <StatTile icon={CheckCircle2} label="Published" value={stats.published} hint="SOP telah dipublikasikan" tone="bg-emerald-50 text-emerald-600" />
        <StatTile icon={PencilLine} label="Draft" value={stats.draft} hint="SOP dalam penyusunan" tone="bg-amber-50 text-amber-600" />
        <StatTile icon={FolderOpen} label="Kategori Aktif" value={stats.activeCats} hint="Kategori digunakan" tone="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari SOP..." className={inputCls + " pl-9"} />
            </div>
            <select value={catFilter} onChange={(e) => { setCatFilter(e.target.value); setPage(1); }} className={inputCls + " max-w-[180px]"}>
              <option value="all">Semua Kategori</option>
              {cats?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls + " max-w-[160px]"}>
              <option value="all">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className={inputCls + " max-w-[180px]"}>
              <option value="newest">Urutkan: Terbaru</option>
              <option value="oldest">Urutkan: Terlama</option>
              <option value="title">Urutkan: Judul A→Z</option>
            </select>
            <button onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-3">Judul</th>
                    <th className="text-left px-3 py-3 w-36">Slug / Kategori</th>
                    <th className="text-left px-3 py-3 w-28">Checklist</th>
                    <th className="text-left px-3 py-3 w-28">Status</th>
                    <th className="text-left px-3 py-3 w-36">Update Terakhir</th>
                    <th className="text-right px-3 py-3 w-28">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Memuat...</td></tr>}
                  {!isLoading && pageRows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada SOP.</td></tr>}
                  {pageRows.map((r) => {
                    const cat = cats?.find((c: any) => c.id === r.category_id);
                    const checklistCount = Array.isArray(r.checklist_items) ? r.checklist_items.length : 0;
                    return (
                      <tr key={r.id} className="hover:bg-muted/30 align-top">
                        <td className="px-3 py-3">
                          <div className="flex items-start gap-3">
                            <SopIcon title={r.title} />
                            <div className="min-w-0">
                              <div className="font-medium">{r.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{r.content ?? "Pemeriksaan terstandarisasi."}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">{cat ? <CategoryChip name={cat.name} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{checklistCount} langkah</td>
                        <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-3 py-3 text-xs text-muted-foreground whitespace-pre-line">{fmtDate(r.updated_at)}</td>
                        <td className="px-3 py-3 text-right whitespace-nowrap">
                          <button onClick={() => { setEditing(r); setModalOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => { setEditing(r); setModalOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-primary ml-1"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(r.id)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
              <span>Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} dari {filtered.length} SOP</span>
              <div className="ml-auto flex items-center gap-2">
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className={inputCls + " max-w-[120px] py-1 text-xs"}>
                  <option value={20}>20 / halaman</option>
                  <option value={50}>50 / halaman</option>
                  <option value={100}>100 / halaman</option>
                </select>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent"><ChevronLeft className="h-3.5 w-3.5" /></button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} className={`h-7 min-w-[28px] rounded text-xs ${page === i + 1 ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent"><ChevronRight className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="font-semibold text-sm">Struktur SOP</div>
            </div>
            <ul className="space-y-2 text-sm">
              {catRows.map(([name, count]) => (
                <li key={name} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="flex-1 truncate">{name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Kategori</span>
              <span className="font-semibold tabular-nums">{catRows.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="font-semibold text-sm">Panduan Cepat</div>
            </div>
            <ul className="space-y-3 text-xs">
              {[
                ["Gunakan bahasa yang jelas", "Tulis langkah dengan bahasa yang mudah dipahami."],
                ["Checklist lengkap", "Pastikan semua langkah tercakup detail."],
                ["Update berkala", "Perbarui SOP sesuai standar terbaru."],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-foreground">{t}</div>
                    <div className="text-muted-foreground">{d}</div>
                  </div>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10">
              Lihat Panduan Lengkap <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Edit SOP" : "SOP Baru"} size="xl">
        {editing && <SopForm initial={editing} cats={cats ?? []} onSave={save} onCancel={() => setModalOpen(false)} />}
      </Modal>
      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="SOP ini" />
    </div>
  );
}

function SopForm({ initial, cats, onSave, onCancel }: { initial: Sop; cats: any[]; onSave: (s: Sop) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  const checklistStr = Array.isArray(f.checklist_items) ? f.checklist_items.join("\n") : "";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Judul"><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></Field>
        <Field label="Slug"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={inputCls} /></Field>
        <Field label="Kategori SOP">
          <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })} className={inputCls}>
            <option value="">— pilih —</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })} className={inputCls}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </Field>
      </div>
      <Field label="Isi SOP">
        <RichTextEditor
          content={f.content ?? ""}
          onChange={(html) => setF({ ...f, content: html })}
          placeholder="Tulis isi SOP di sini..."
        />
      </Field>
      <Field label="Checklist (satu item per baris)">
        <textarea rows={4} value={checklistStr} onChange={(e) => setF({ ...f, checklist_items: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className={inputCls + " text-xs"} />
      </Field>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Kriteria Lolos"><textarea rows={3} value={f.pass_criteria ?? ""} onChange={(e) => setF({ ...f, pass_criteria: e.target.value })} className={inputCls + " text-xs"} /></Field>
        <Field label="Kriteria Minus"><textarea rows={3} value={f.minus_criteria ?? ""} onChange={(e) => setF({ ...f, minus_criteria: e.target.value })} className={inputCls + " text-xs"} /></Field>
        <Field label="Kriteria Retur"><textarea rows={3} value={f.return_criteria ?? ""} onChange={(e) => setF({ ...f, return_criteria: e.target.value })} className={inputCls + " text-xs"} /></Field>
      </div>
      <Field label="URL Gambar"><input value={f.featured_image ?? ""} onChange={(e) => setF({ ...f, featured_image: e.target.value })} className={inputCls} /></Field>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
        <PrimaryButton type="submit">Simpan</PrimaryButton>
      </div>
    </form>
  );
}
