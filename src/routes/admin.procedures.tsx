import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, PageHeader, PrimaryButton, StatusBadge, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import {
  Pencil, Trash2, Search, RotateCcw, Plus, GripVertical, ChevronLeft, ChevronRight,
  CalendarDays, CheckCircle2, ListChecks, Monitor, HardDrive, BatteryFull, Keyboard,
  ClipboardCheck, ShieldCheck, Cpu, Wifi, Camera, Volume2, Gauge, FileCheck2, Settings2,
  PackageCheck, Info,
} from "lucide-react";

export const Route = createFileRoute("/admin/procedures")({ ssr: false, component: AdminProcedures });

type Step = {
  id: string;
  step_number: number;
  phase: number;
  phase_label: string;
  phase_title: string;
  title: string;
  icon: string | null;
  tint: string | null;
  bullets: string[];
  image_key: string | null;
  featured_image: string | null;
  status: "draft" | "published";
  sort_order: number;
};

const EMPTY: Step = {
  id: "", step_number: 1, phase: 1, phase_label: "Tahap 1", phase_title: "Penerimaan & Pemeriksaan Fisik",
  title: "", icon: "ClipboardCheck", tint: "from-sky-100 to-blue-200 text-sky-700",
  bullets: [], image_key: null, featured_image: null, status: "published", sort_order: 0,
};

const ICONS: Record<string, any> = {
  ClipboardCheck, Monitor, HardDrive, BatteryFull, Keyboard, ShieldCheck, Cpu, Wifi,
  Camera, Volume2, Gauge, FileCheck2, Settings2, PackageCheck,
};

function StepIcon({ name, phase }: { name: string | null; phase: number }) {
  const Ico = (name && ICONS[name]) || ClipboardCheck;
  const tints = [
    "bg-sky-50 text-sky-600 ring-sky-100",
    "bg-amber-50 text-amber-600 ring-amber-100",
    "bg-rose-50 text-rose-600 ring-rose-100",
  ];
  const cls = tints[(phase - 1) % 3];
  return (
    <div className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ${cls}`}>
      <Ico className="h-4 w-4" />
    </div>
  );
}

function PhaseBadge({ phase }: { phase: number }) {
  const styles = [
    "bg-sky-50 text-sky-700 ring-sky-100",
    "bg-amber-50 text-amber-700 ring-amber-100",
    "bg-rose-50 text-rose-700 ring-rose-100",
  ];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${styles[(phase - 1) % 3]}`}>
      Tahap {phase}
    </span>
  );
}

function StatTile({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5 flex items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function AdminProcedures() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Step | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<"step_asc" | "step_desc" | "updated">("step_asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-procedure-steps"],
    queryFn: async () => {
      const { data } = await supabase.from("procedure_steps").select("*").order("step_number");
      return ((data ?? []) as any[]).map((r) => ({
        ...r, bullets: Array.isArray(r.bullets) ? r.bullets : [],
      })) as Step[];
    },
  });

  const all = rows ?? [];
  const stats = useMemo(() => {
    const total = all.length;
    const published = all.filter((r) => r.status === "published").length;
    const p1 = all.filter((r) => r.phase === 1).length;
    const p2 = all.filter((r) => r.phase === 2).length;
    const p3 = all.filter((r) => r.phase === 3).length;
    return { total, published, p1, p2, p3 };
  }, [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.title.toLowerCase().includes(q) || (x.bullets ?? []).join(" ").toLowerCase().includes(q));
    }
    if (phaseFilter !== "all") r = r.filter((x) => String(x.phase) === phaseFilter);
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (sort === "step_desc") r = [...r].sort((a, b) => b.step_number - a.step_number);
    return r;
  }, [all, search, phaseFilter, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage);

  function resetFilters() {
    setSearch(""); setPhaseFilter("all"); setStatusFilter("all"); setSort("step_asc"); setPage(1);
  }

  function openNew() {
    const next = (rows?.length ?? 0) + 1;
    setEditing({ ...EMPTY, step_number: next, sort_order: next });
    setOpen(true);
  }

  async function save(f: Step) {
    const payload = {
      step_number: Number(f.step_number),
      phase: Number(f.phase),
      phase_label: f.phase_label || `Tahap ${f.phase}`,
      phase_title: f.phase_title,
      title: f.title,
      icon: f.icon,
      tint: f.tint,
      bullets: f.bullets,
      image_key: f.image_key,
      featured_image: f.featured_image,
      status: f.status,
      sort_order: Number(f.sort_order) || Number(f.step_number),
    };
    if (f.id) await supabase.from("procedure_steps").update(payload).eq("id", f.id);
    else await supabase.from("procedure_steps").insert(payload);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-procedure-steps"] });
  }

  async function remove(id: string) {
    await supabase.from("procedure_steps").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-procedure-steps"] });
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    await supabase.from("procedure_steps").delete().in("id", Array.from(selected));
    setSelected(new Set());
    qc.invalidateQueries({ queryKey: ["admin-procedure-steps"] });
  }

  function toggleSel(id: string) {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id); else n.add(id);
    setSelected(n);
  }
  function toggleSelAll() {
    if (pageRows.every((r) => selected.has(r.id))) {
      const n = new Set(selected); pageRows.forEach((r) => n.delete(r.id)); setSelected(n);
    } else {
      const n = new Set(selected); pageRows.forEach((r) => n.add(r.id)); setSelected(n);
    }
  }

  const phaseGroups = useMemo(() => {
    const map = new Map<number, { label: string; title: string; count: number }>();
    all.forEach((r) => {
      const cur = map.get(r.phase);
      if (cur) cur.count++;
      else map.set(r.phase, { label: r.phase_label || `Tahap ${r.phase}`, title: r.phase_title || "", count: 1 });
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [all]);

  return (
    <div>
      <PageHeader
        title="Prosedur QC"
        description="Kelola langkah Quality Control (urutan, tahap, checklist, gambar)."
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari langkah QC..."
            className={inputCls + " pl-9"}
          />
        </div>
        <select value={phaseFilter} onChange={(e) => { setPhaseFilter(e.target.value); setPage(1); }} className={inputCls + " max-w-[160px]"}>
          <option value="all">Semua Tahap</option>
          <option value="1">Tahap 1</option>
          <option value="2">Tahap 2</option>
          <option value="3">Tahap 3</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls + " max-w-[160px]"}>
          <option value="all">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className={inputCls + " max-w-[160px]"}>
          <option value="step_asc">Urutkan: No ↑</option>
          <option value="step_desc">Urutkan: No ↓</option>
        </select>
        <button onClick={resetFilters} className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
          <RotateCcw className="h-3.5 w-3.5" /> Reset Filter
        </button>
        <div className="ml-auto">
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Tambah Langkah
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main */}
        <div className="col-span-12 xl:col-span-9 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatTile icon={CalendarDays} label="Total Langkah" value={stats.total} tone="bg-sky-50 text-sky-600" />
            <StatTile icon={CheckCircle2} label="Published" value={stats.published} tone="bg-emerald-50 text-emerald-600" />
            <StatTile icon={ListChecks} label="Tahap 1" value={stats.p1} tone="bg-violet-50 text-violet-600" />
            <StatTile icon={ListChecks} label="Tahap 2" value={stats.p2} tone="bg-amber-50 text-amber-600" />
            <StatTile icon={ListChecks} label="Tahap 3" value={stats.p3} tone="bg-rose-50 text-rose-600" />
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 w-10">
                      <input type="checkbox" checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))} onChange={toggleSelAll} />
                    </th>
                    <th className="px-2 py-3 w-8"></th>
                    <th className="text-left px-3 py-3 w-12">No</th>
                    <th className="text-left px-3 py-3">Judul Langkah</th>
                    <th className="text-left px-3 py-3">Ringkasan</th>
                    <th className="text-left px-3 py-3 w-24">Tahap</th>
                    <th className="text-left px-3 py-3 w-28">Status</th>
                    <th className="text-right px-3 py-3 w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Memuat...</td></tr>}
                  {!isLoading && pageRows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Tidak ada langkah cocok dengan filter.</td></tr>}
                  {pageRows.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30">
                      <td className="px-3 py-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSel(r.id)} /></td>
                      <td className="px-2 py-3 text-muted-foreground"><GripVertical className="h-4 w-4" /></td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{r.step_number}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <StepIcon name={r.icon} phase={r.phase} />
                          <div className="font-medium">{r.title}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground max-w-md">
                        <div className="line-clamp-1">{(r.bullets ?? []).join(", ")}</div>
                      </td>
                      <td className="px-3 py-3"><PhaseBadge phase={r.phase} /></td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <button onClick={() => { setEditing(r); setOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
              <span>{selected.size} dipilih</span>
              <select disabled={selected.size === 0} onChange={(e) => { if (e.target.value === "delete") bulkDelete(); e.currentTarget.value = ""; }} className={inputCls + " max-w-[140px] py-1 text-xs disabled:opacity-50"}>
                <option value="">Aksi Massal</option>
                <option value="delete">Hapus terpilih</option>
              </select>
              <span className="ml-auto">Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} dari {filtered.length} langkah</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent"><ChevronLeft className="h-3.5 w-3.5" /></button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)} className={`h-7 min-w-[28px] rounded text-xs ${page === i + 1 ? "bg-primary text-primary-foreground" : "border border-input hover:bg-accent"}`}>{i + 1}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="grid h-7 w-7 place-items-center rounded border border-input disabled:opacity-40 hover:bg-accent"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
              <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className={inputCls + " max-w-[110px] py-1 text-xs"}>
                <option value={10}>10 / halaman</option>
                <option value={20}>20 / halaman</option>
                <option value={50}>50 / halaman</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-12 xl:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Struktur Tahap QC</div>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <ul className="space-y-3">
              {phaseGroups.map(([p, g]) => (
                <li key={p} className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${p === 1 ? "bg-sky-500" : p === 2 ? "bg-amber-500" : "bg-rose-500"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{g.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{g.title}</div>
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-muted-foreground">{g.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="font-semibold text-sm mb-3">Tips Penyusunan Prosedur</div>
            <ul className="space-y-2.5 text-xs">
              {[
                "Urutkan langkah sesuai alur kerja QC untuk efisiensi.",
                "Gunakan ringkasan yang jelas dan spesifik.",
                "Pastikan setiap langkah memiliki tahap & status yang tepat.",
                "Gunakan media (gambar/video) untuk panduan visual.",
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-500 mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing?.id ? `Edit Langkah ${editing.step_number}` : "Langkah Baru"} size="xl">
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Field label="No. Langkah"><input type="number" required value={editing.step_number} onChange={(e) => setEditing({ ...editing, step_number: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Tahap (1/2/3)"><input type="number" min={1} max={3} value={editing.phase} onChange={(e) => setEditing({ ...editing, phase: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Phase Label"><input value={editing.phase_label} onChange={(e) => setEditing({ ...editing, phase_label: e.target.value })} className={inputCls} /></Field>
              <Field label="Sort Order"><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className={inputCls} /></Field>
            </div>
            <Field label="Phase Title"><input value={editing.phase_title} onChange={(e) => setEditing({ ...editing, phase_title: e.target.value })} className={inputCls} /></Field>
            <Field label="Judul Langkah"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Icon (lucide name)" hint="Contoh: ClipboardCheck, Monitor, HardDrive"><input value={editing.icon ?? ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className={inputCls} /></Field>
              <Field label="Tint (tailwind gradient classes)"><input value={editing.tint ?? ""} onChange={(e) => setEditing({ ...editing, tint: e.target.value })} className={inputCls + " font-mono text-xs"} /></Field>
            </div>
            <Field label="Bullets / Ringkasan (satu per baris)">
              <textarea rows={5} value={editing.bullets.join("\n")} onChange={(e) => setEditing({ ...editing, bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} className={inputCls + " text-xs"} />
            </Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Image Key" hint="Mapping ke gambar bawaan: p01..p20"><input value={editing.image_key ?? ""} onChange={(e) => setEditing({ ...editing, image_key: e.target.value || null })} className={inputCls} /></Field>
              <Field label="Featured Image URL (opsional)"><input value={editing.featured_image ?? ""} onChange={(e) => setEditing({ ...editing, featured_image: e.target.value || null })} className={inputCls} /></Field>
            </div>
            <Field label="Status">
              <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as any })} className={inputCls + " max-w-[200px]"}>
                <option value="draft">Draft</option><option value="published">Published</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
              <PrimaryButton type="submit">Simpan</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="langkah ini" />
    </div>
  );
}
