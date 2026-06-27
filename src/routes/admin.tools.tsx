import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, PageHeader, PrimaryButton, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import {
  Pencil, Trash2, Search, Plus, ExternalLink, ChevronLeft, ChevronRight,
  Package, Monitor, Wrench, CheckCircle2, HardDrive, Terminal, Laptop, Cpu,
  Keyboard, BatteryFull, Settings2,
} from "lucide-react";

export const Route = createFileRoute("/admin/tools")({ ssr: false, component: AdminTools });

type Tool = {
  id: string;
  name: string;
  description: string | null;
  category: "os" | "tools" | string;
  subcategory: string | null;
  icon: string | null;
  image_url: string | null;
  download_url: string;
  version: string | null;
  platform: string | null;
  sort_order: number;
  is_published: boolean;
  updated_at?: string;
};

const CATEGORIES = ["os", "tools"];
const SUBCATS = ["windows", "linux", "winpe", "macos", "storage", "display", "input", "battery", "system", "utility", "other"];
const PLATFORMS = ["Windows", "macOS", "Linux", "WinPE", "Web"];

const EMPTY: Tool = {
  id: "", name: "", description: "", category: "tools", subcategory: "utility",
  icon: "Wrench", image_url: "", download_url: "", version: "", platform: "Windows",
  sort_order: 0, is_published: true,
};

const SUBCAT_TONE: Record<string, string> = {
  windows: "bg-sky-50 text-sky-700 ring-sky-100",
  linux: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  winpe: "bg-violet-50 text-violet-700 ring-violet-100",
  macos: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  storage: "bg-sky-50 text-sky-700 ring-sky-100",
  display: "bg-violet-50 text-violet-700 ring-violet-100",
  input: "bg-amber-50 text-amber-700 ring-amber-100",
  battery: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  system: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  utility: "bg-orange-50 text-orange-700 ring-orange-100",
  other: "bg-slate-50 text-slate-700 ring-slate-100",
};

function CategoryChip({ category, subcategory }: { category: string; subcategory: string | null }) {
  const tone = SUBCAT_TONE[subcategory ?? "other"] ?? SUBCAT_TONE.other;
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 lowercase ${tone}`}>
      {category} {subcategory ? `/${subcategory}` : ""}
    </span>
  );
}

function ToolIcon({ tool }: { tool: Tool }) {
  if (tool.image_url) {
    return (
      <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
        <img src={tool.image_url} alt={tool.name} className="h-full w-full object-cover" />
      </div>
    );
  }
  const sub = tool.subcategory ?? "";
  const map: Record<string, { I: any; tone: string }> = {
    windows: { I: Monitor, tone: "bg-sky-50 text-sky-600" },
    linux: { I: Terminal, tone: "bg-emerald-50 text-emerald-600" },
    winpe: { I: Terminal, tone: "bg-violet-50 text-violet-600" },
    macos: { I: Laptop, tone: "bg-indigo-50 text-indigo-600" },
    storage: { I: HardDrive, tone: "bg-sky-50 text-sky-600" },
    display: { I: Monitor, tone: "bg-violet-50 text-violet-600" },
    input: { I: Keyboard, tone: "bg-amber-50 text-amber-600" },
    battery: { I: BatteryFull, tone: "bg-emerald-50 text-emerald-600" },
    system: { I: Cpu, tone: "bg-indigo-50 text-indigo-600" },
    utility: { I: Settings2, tone: "bg-orange-50 text-orange-600" },
  };
  const m = map[sub] || { I: Wrench, tone: "bg-slate-50 text-slate-600" };
  const Ico = m.I;
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-lg shrink-0 ${m.tone}`}>
      <Ico className="h-4 w-4" />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, hint }: { icon: any; label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">{label}</div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
      </div>
    </div>
  );
}

function AdminTools() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Tool | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "os" | "tools">("all");
  const [platform, setPlatform] = useState("all");
  const [subcat, setSubcat] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-qc-tools"],
    queryFn: async () => (await supabase.from("qc_tools").select("*").order("category").order("sort_order")).data ?? [],
  });

  const all = (rows ?? []) as Tool[];

  const stats = useMemo(() => ({
    total: all.length,
    os: all.filter((r) => r.category === "os").length,
    tools: all.filter((r) => r.category === "tools").length,
    published: all.filter((r) => r.is_published).length,
  }), [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (tab !== "all") r = r.filter((x) => x.category === tab);
    if (platform !== "all") r = r.filter((x) => (x.platform ?? "").toLowerCase() === platform.toLowerCase());
    if (subcat !== "all") r = r.filter((x) => x.subcategory === subcat);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        x.name.toLowerCase().includes(q) ||
        (x.description ?? "").toLowerCase().includes(q) ||
        (x.platform ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, tab, platform, subcat, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  function openNew() { setEditing({ ...EMPTY }); setOpen(true); }

  async function save(f: Tool) {
    const payload: any = {
      name: f.name, description: f.description || null, category: f.category,
      subcategory: f.subcategory || null, icon: f.icon || null,
      image_url: f.image_url || null, download_url: f.download_url,
      version: f.version || null, platform: f.platform || null,
      sort_order: Number(f.sort_order) || 0, is_published: !!f.is_published,
    };
    if (f.id) await supabase.from("qc_tools").update(payload).eq("id", f.id);
    else await supabase.from("qc_tools").insert(payload);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-qc-tools"] });
  }

  async function remove(id: string) {
    await supabase.from("qc_tools").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-qc-tools"] });
  }

  return (
    <div>
      <PageHeader title="QC Tools" description="Kelola link download OS dan tools QC." />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile icon={Package} label="Total Item" value={stats.total} hint="Semua OS & Tools" />
        <StatTile icon={Monitor} label="Operating System" value={stats.os} hint="Item OS tersedia" />
        <StatTile icon={Wrench} label="QC Tools" value={stats.tools} hint="Tools pendukung" />
        <StatTile icon={CheckCircle2} label="Published" value={stats.published}
          hint={stats.total ? `${Math.round((stats.published / stats.total) * 100)}% dari total item` : "—"} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari tools atau OS..." className={inputCls + " pl-9"} />
        </div>
        <div className="inline-flex p-1 rounded-lg border border-border bg-card">
          {([["all", "Semua"], ["os", "OS"], ["tools", "Tools"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-md transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={platform} onChange={(e) => { setPlatform(e.target.value); setPage(1); }} className={inputCls + " max-w-[160px]"}>
          <option value="all">Platform</option>
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={subcat} onChange={(e) => { setSubcat(e.target.value); setPage(1); }} className={inputCls + " max-w-[160px]"}>
          <option value="all">Kategori</option>
          {SUBCATS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={openNew} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Tool Baru
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-3">Nama</th>
                <th className="text-left px-3 py-3 w-40">Kategori</th>
                <th className="text-left px-3 py-3 w-28">Platform</th>
                <th className="text-left px-3 py-3 w-24">Versi</th>
                <th className="text-left px-3 py-3 w-28">Status</th>
                <th className="text-left px-3 py-3 w-16">Link</th>
                <th className="text-right px-3 py-3 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Memuat...</td></tr>}
              {!isLoading && pageRows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Belum ada tool yang cocok.</td></tr>}
              {pageRows.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 align-middle">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <ToolIcon tool={r} />
                      <div className="min-w-0">
                        <div className="font-medium leading-tight truncate">{r.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{r.description ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><CategoryChip category={r.category} subcategory={r.subcategory} /></td>
                  <td className="px-3 py-2.5 text-xs">{r.platform ?? "—"}</td>
                  <td className="px-3 py-2.5 text-xs font-mono">{r.version ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${
                      r.is_published ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-amber-200"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${r.is_published ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {r.is_published ? "published" : "draft"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {r.download_url ? (
                      <a href={r.download_url} target="_blank" rel="noreferrer" title="Buka link download"
                        className="inline-grid h-8 w-8 place-items-center rounded-md text-primary hover:bg-primary/10">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap">
                    <button onClick={() => { setEditing(r); setOpen(true); }} title="Edit"
                      className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-primary">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeleteId(r.id)} title="Hapus"
                      className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} dari {filtered.length} item</span>
          <div className="ml-auto flex items-center gap-2">
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className={inputCls + " max-w-[120px] py-1 text-xs"}>
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
              <option value={100}>100 / halaman</option>
            </select>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`h-7 min-w-[28px] rounded text-xs ${page === i + 1 ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing?.id ? "Edit Tool" : "Tool Baru"} size="lg">
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="space-y-3">
            <Field label="Nama">
              <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Deskripsi">
              <textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori">
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Subkategori">
                <select value={editing.subcategory ?? ""} onChange={(e) => setEditing({ ...editing, subcategory: e.target.value })} className={inputCls}>
                  {SUBCATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Platform">
                <select value={editing.platform ?? ""} onChange={(e) => setEditing({ ...editing, platform: e.target.value })} className={inputCls}>
                  <option value="">—</option>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Versi">
                <input value={editing.version ?? ""} onChange={(e) => setEditing({ ...editing, version: e.target.value })} className={inputCls} placeholder="Latest / 22H2 / 14" />
              </Field>
            </div>
            <Field label="Download URL">
              <input required type="url" value={editing.download_url} onChange={(e) => setEditing({ ...editing, download_url: e.target.value })} className={inputCls} placeholder="https://..." />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Icon (lucide name)" hint="Contoh: HardDrive, Monitor, Battery, Cpu">
                <input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className={inputCls} />
              </Field>
            </div>
            <Field label="Image URL (opsional)" hint="Thumbnail kartu/tabel">
              <input type="url" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className={inputCls} placeholder="https://..." />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              Published (tampil di publik)
            </label>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
              <PrimaryButton type="submit">Simpan</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="tool ini" />
    </div>
  );
}
