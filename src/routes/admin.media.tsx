import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Field, PageHeader, PrimaryButton, inputCls } from "@/components/admin/ui";
import { ConfirmDelete } from "@/components/admin/modal";
import {
  Upload, Search, Image as ImageIcon, FileText, Link as LinkIcon,
  LayoutGrid, List, Eye, Copy, Download, Trash2, FileSpreadsheet,
  Plus, UploadCloud, Files, MoreHorizontal,
} from "lucide-react";

export const Route = createFileRoute("/admin/media")({ ssr: false, component: AdminMedia });

type Media = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
};

const isImage = (m: Media) =>
  (m.file_type ?? "").startsWith("image") || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(m.file_url);
const isUrlOnly = (m: Media) =>
  !m.file_size && /^https?:\/\//i.test(m.file_url) && !/^\/?uploads?\//i.test(m.file_url);
const isDoc = (m: Media) => !isImage(m) && !isUrlOnly(m);

function fmtSize(n: number | null) {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch { return iso; }
}
function fmtDateTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${fmtDate(iso)}, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  } catch { return iso; }
}

function StatTile({ icon: Icon, label, value, hint, tone }: { icon: any; label: string; value: number; hint: string; tone: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-[12px] text-muted-foreground truncate">{label}</div>
        <div className="text-2xl font-bold leading-tight tabular-nums">{value}</div>
        <div className="text-[11px] text-muted-foreground truncate">{hint}</div>
      </div>
    </div>
  );
}

function TypeBadge({ kind }: { kind: "image" | "doc" | "url" }) {
  const m = {
    image: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    doc: "bg-violet-50 text-violet-700 ring-violet-100",
    url: "bg-orange-50 text-orange-700 ring-orange-100",
  }[kind];
  const l = { image: "Gambar", doc: "Dokumen", url: "URL" }[kind];
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${m}`}>{l}</span>;
}

function FilePreview({ m, size = "md" }: { m: Media; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-10 w-10" : "h-32 w-full";
  if (isImage(m)) {
    return (
      <div className={`${dim} rounded-md overflow-hidden bg-muted border border-border`}>
        <img src={m.file_url} alt={m.file_name} className="h-full w-full object-cover" />
      </div>
    );
  }
  if (isUrlOnly(m)) {
    return (
      <div className={`${dim} rounded-md grid place-items-center bg-orange-50 text-orange-500 border border-orange-100`}>
        <LinkIcon className={size === "sm" ? "h-4 w-4" : "h-8 w-8"} />
      </div>
    );
  }
  const ext = (m.file_name.split(".").pop() ?? "").toLowerCase();
  const isSheet = /xls|xlsx|csv/.test(ext);
  const Icon = isSheet ? FileSpreadsheet : FileText;
  const tone = isSheet ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-violet-50 text-violet-600 border-violet-100";
  return (
    <div className={`${dim} rounded-md grid place-items-center border ${tone}`}>
      <Icon className={size === "sm" ? "h-4 w-4" : "h-8 w-8"} />
    </div>
  );
}

function AdminMedia() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteUrl, setPasteUrl] = useState("");
  const [pasteName, setPasteName] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err" | "warn"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "image" | "doc" | "url">("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name" | "size">("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [dragging, setDragging] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => (await supabase.from("media_library").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: profiles } = useQuery({
    queryKey: ["admin-media-uploaders"],
    queryFn: async () => (await supabase.from("profiles").select("id,email,full_name")).data ?? [],
  });
  const uploaderEmail = (id: string | null) => {
    if (!id) return "—";
    const p = (profiles ?? []).find((x: any) => x.id === id);
    return p?.email ?? p?.full_name ?? id.slice(0, 8);
  };

  const all = (rows ?? []) as Media[];
  const stats = useMemo(() => ({
    total: all.length,
    images: all.filter(isImage).length,
    docs: all.filter(isDoc).length,
    urls: all.filter(isUrlOnly).length,
  }), [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (tab === "image") r = r.filter(isImage);
    if (tab === "doc") r = r.filter(isDoc);
    if (tab === "url") r = r.filter(isUrlOnly);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) => x.file_name.toLowerCase().includes(q) || x.file_url.toLowerCase().includes(q));
    }
    if (sort === "newest") r = [...r].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "oldest") r = [...r].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    if (sort === "name") r = [...r].sort((a, b) => a.file_name.localeCompare(b.file_name));
    if (sort === "size") r = [...r].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0));
    return r;
  }, [all, tab, search, sort]);

  async function uploadFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setMsg({ kind: "err", text: "Maks. ukuran file 10MB." });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) {
        setMsg({ kind: "warn", text: "Upload gagal ke storage. Gunakan 'Tambah dari URL' sebagai alternatif." });
        return;
      }
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const { error: insErr } = await supabase.from("media_library").insert({
        file_name: file.name, file_url: pub.publicUrl, file_type: file.type, file_size: file.size, uploaded_by: u.user?.id,
      });
      if (insErr) { setMsg({ kind: "err", text: insErr.message }); return; }
      setMsg({ kind: "ok", text: "Berhasil di-upload." });
      qc.invalidateQueries({ queryKey: ["admin-media"] });
    } finally { setBusy(false); }
  }

  async function pasteSave() {
    if (!pasteUrl) return;
    const { data: u } = await supabase.auth.getUser();
    const name = pasteName || pasteUrl.split("/").pop() || "file";
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const guessType = /(png|jpe?g|webp|gif|svg|avif)/.test(ext) ? `image/${ext === "jpg" ? "jpeg" : ext}` : null;
    const { error } = await supabase.from("media_library").insert({
      file_name: name, file_url: pasteUrl, file_type: guessType, uploaded_by: u.user?.id,
    });
    if (error) { setMsg({ kind: "err", text: error.message }); return; }
    setPasteUrl(""); setPasteName("");
    setMsg({ kind: "ok", text: "URL ditambahkan." });
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  async function remove(id: string) {
    await supabase.from("media_library").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setMsg({ kind: "ok", text: "URL disalin." });
  }

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="Kelola gambar & lampiran."
        action={
          <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4" /> Upload Baru
          </button>
        }
      />
      <input ref={fileRef} type="file" hidden onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatTile icon={Files} label="Total Media" value={stats.total} hint="Semua file" tone="bg-sky-50 text-sky-600" />
        <StatTile icon={ImageIcon} label="Images" value={stats.images} hint="File gambar" tone="bg-emerald-50 text-emerald-600" />
        <StatTile icon={FileText} label="Documents" value={stats.docs} hint="File dokumen" tone="bg-violet-50 text-violet-600" />
        <StatTile icon={LinkIcon} label="Links / URL" value={stats.urls} hint="Tautan eksternal" tone="bg-orange-50 text-orange-600" />
      </div>

      {/* Upload + URL */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="font-semibold mb-3">Upload File</div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files?.[0]; if (f) uploadFile(f);
            }}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}
          >
            <UploadCloud className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-sm font-medium">Drag &amp; drop file di sini</div>
            <div className="text-xs text-muted-foreground mb-3">atau klik tombol untuk memilih file</div>
            <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {busy ? "Mengunggah..." : "Pilih File"}
            </button>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground text-center">
            Format didukung: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX (Maks. 10MB)
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="font-semibold mb-3">Tambah dari URL</div>
          <div className="space-y-3">
            <Field label="Nama File">
              <input value={pasteName} onChange={(e) => setPasteName(e.target.value)} className={inputCls} placeholder="Contoh: Panduan QC.pdf" />
            </Field>
            <Field label="URL">
              <input value={pasteUrl} onChange={(e) => setPasteUrl(e.target.value)} className={inputCls} placeholder="https://example.com/file.pdf" />
            </Field>
            <PrimaryButton onClick={pasteSave}>
              <Plus className="h-4 w-4" /> Tambah
            </PrimaryButton>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 text-xs rounded-md px-3 py-2 border ${
          msg.kind === "ok" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : msg.kind === "warn" ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-red-50 text-red-700 border-red-200"
        }`}>{msg.text}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari media..." className={inputCls + " pl-9"} />
        </div>
        <div className="inline-flex p-1 rounded-lg border border-border bg-card">
          {([["all", "Semua"], ["image", "Gambar"], ["doc", "Dokumen"], ["url", "URL"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${tab === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className={inputCls + " ml-auto max-w-[170px]"}>
          <option value="newest">Terbaru dulu</option>
          <option value="oldest">Terlama dulu</option>
          <option value="name">Nama A→Z</option>
          <option value="size">Ukuran terbesar</option>
        </select>
        <div className="inline-flex p-1 rounded-lg border border-border bg-card">
          <button onClick={() => setView("grid")} className={`grid h-8 w-8 place-items-center rounded-md ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} title="Grid"><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView("list")} className={`grid h-8 w-8 place-items-center rounded-md ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`} title="List"><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
          {isLoading && <div className="col-span-full text-center py-10 text-sm text-muted-foreground">Memuat...</div>}
          {!isLoading && filtered.length === 0 && <div className="col-span-full text-center py-10 text-sm text-muted-foreground">Belum ada media.</div>}
          {filtered.map((m) => {
            const kind: "image" | "doc" | "url" = isImage(m) ? "image" : isUrlOnly(m) ? "url" : "doc";
            return (
              <div key={m.id} className="rounded-xl border border-border bg-card overflow-hidden group">
                <FilePreview m={m} />
                <div className="p-3">
                  <div className="text-sm font-medium truncate" title={m.file_name}>{m.file_name}</div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    <TypeBadge kind={kind} />
                    {kind !== "url" && <span className="text-muted-foreground">{fmtSize(m.file_size)}</span>}
                    {kind === "url" && (
                      <a href={m.file_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">↗</a>
                    )}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{fmtDate(m.created_at)}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => copyUrl(m.file_url)} title="Copy URL" className="grid h-6 w-6 place-items-center rounded hover:bg-accent"><Copy className="h-3 w-3" /></button>
                      <a href={m.file_url} target="_blank" rel="noreferrer" title="Buka" className="grid h-6 w-6 place-items-center rounded hover:bg-accent"><Eye className="h-3 w-3" /></a>
                      <button onClick={() => setDeleteId(m.id)} title="Hapus" className="grid h-6 w-6 place-items-center rounded hover:bg-destructive/10 text-destructive"><MoreHorizontal className="h-3 w-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 w-20">Preview</th>
                  <th className="text-left px-4 py-3">Nama</th>
                  <th className="text-left px-4 py-3 w-28">Tipe</th>
                  <th className="text-left px-4 py-3">URL / Path</th>
                  <th className="text-left px-4 py-3 w-48">Uploaded</th>
                  <th className="text-right px-4 py-3 w-44">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Memuat...</td></tr>}
                {!isLoading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada media.</td></tr>}
                {filtered.map((m) => {
                  const kind: "image" | "doc" | "url" = isImage(m) ? "image" : isUrlOnly(m) ? "url" : "doc";
                  return (
                    <tr key={m.id} className="hover:bg-muted/30 align-middle">
                      <td className="px-4 py-2.5"><FilePreview m={m} size="sm" /></td>
                      <td className="px-4 py-2.5 font-medium">{m.file_name}</td>
                      <td className="px-4 py-2.5"><TypeBadge kind={kind} /></td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground truncate max-w-xs" title={m.file_url}>{m.file_url}</td>
                      <td className="px-4 py-2.5 text-xs">
                        <div>{fmtDateTime(m.created_at)}</div>
                        <div className="text-muted-foreground">{uploaderEmail(m.uploaded_by)}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <a href={m.file_url} target="_blank" rel="noreferrer" title="Lihat" className="inline-grid h-8 w-8 place-items-center rounded-md text-sky-600 hover:bg-sky-50"><Eye className="h-4 w-4" /></a>
                        <button onClick={() => copyUrl(m.file_url)} title="Copy URL" className="inline-grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-accent ml-1"><Copy className="h-4 w-4" /></button>
                        <a href={m.file_url} download title="Download" className="inline-grid h-8 w-8 place-items-center rounded-md text-emerald-600 hover:bg-emerald-50 ml-1"><Download className="h-4 w-4" /></a>
                        <button onClick={() => setDeleteId(m.id)} title="Hapus" className="inline-grid h-8 w-8 place-items-center rounded-md text-destructive hover:bg-destructive/10 ml-1"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="media ini" />
    </div>
  );
}
