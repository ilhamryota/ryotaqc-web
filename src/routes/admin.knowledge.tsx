import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddButton, Field, PageHeader, PrimaryButton, StatusBadge, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import { Pencil, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

export const Route = createFileRoute("/admin/knowledge")({ ssr: false, component: AdminKnowledge });

type K = {
  id: string;
  title: string;
  slug: string;
  level: "dasar" | "menengah" | "tinggi" | "lanjutan";
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  video_url: string | null;
  attachment_url: string | null;
  status: "draft" | "published";
  updated_at: string;
};

const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminKnowledge() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<K | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-knowledge"],
    queryFn: async () => (await supabase.from("knowledge_materials").select("*").order("updated_at", { ascending: false })).data ?? [],
  });

  const filtered = (rows ?? []).filter((r) => filter === "all" || r.level === filter);

  function openNew() {
    setEditing({ id: "", title: "", slug: "", level: "dasar", excerpt: "", content: "", featured_image: "", video_url: "", attachment_url: "", status: "draft", updated_at: "" });
    setModalOpen(true);
  }

  async function save(f: K) {
    const payload = {
      title: f.title, slug: f.slug || slugify(f.title), level: f.level, excerpt: f.excerpt, content: f.content,
      featured_image: f.featured_image, video_url: f.video_url, attachment_url: f.attachment_url, status: f.status,
    };
    if (f.id) await supabase.from("knowledge_materials").update(payload).eq("id", f.id);
    else {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("knowledge_materials").insert({ ...payload, created_by: u.user?.id });
    }
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-knowledge"] });
  }

  async function remove(id: string) {
    await supabase.from("knowledge_materials").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-knowledge"] });
  }

  return (
    <div>
      <PageHeader title="Knowledge" description="Materi pembelajaran 4 level." action={<AddButton onClick={openNew} label="Materi Baru" />} />
      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputCls + " max-w-xs"}>
          <option value="all">Semua level</option>
          <option value="dasar">Dasar</option>
          <option value="menengah">Menengah</option>
          <option value="tinggi">Tinggi</option>
          <option value="lanjutan">Lanjutan</option>
        </select>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Judul</th><th className="text-left px-4 py-3">Level</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Belum ada materi.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-3"><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground">{r.slug}</div></td>
                <td className="px-4 py-3 capitalize">{r.level}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(r as K); setModalOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Edit Materi" : "Materi Baru"} size="xl">
        {editing && <KForm initial={editing} onSave={save} onCancel={() => setModalOpen(false)} />}
      </Modal>
      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="materi ini" />
    </div>
  );
}

function KForm({ initial, onSave, onCancel }: { initial: K; onSave: (k: K) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Judul"><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={inputCls} /></Field>
        <Field label="Slug"><input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} className={inputCls} /></Field>
        <Field label="Level">
          <select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value as any })} className={inputCls}>
            <option value="dasar">Dasar</option><option value="menengah">Menengah</option><option value="tinggi">Tinggi</option><option value="lanjutan">Lanjutan</option>
          </select>
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as any })} className={inputCls}>
            <option value="draft">Draft</option><option value="published">Published</option>
          </select>
        </Field>
      </div>
      <Field label="Deskripsi"><textarea rows={2} value={f.excerpt ?? ""} onChange={(e) => setF({ ...f, excerpt: e.target.value })} className={inputCls} /></Field>
      <Field label="Isi Materi">
        <RichTextEditor
          content={f.content ?? ""}
          onChange={(html) => setF({ ...f, content: html })}
          placeholder="Tulis isi materi di sini..."
        />
      </Field>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="URL Gambar"><input value={f.featured_image ?? ""} onChange={(e) => setF({ ...f, featured_image: e.target.value })} className={inputCls} /></Field>
        <Field label="URL Video"><input value={f.video_url ?? ""} onChange={(e) => setF({ ...f, video_url: e.target.value })} className={inputCls} /></Field>
        <Field label="URL Lampiran"><input value={f.attachment_url ?? ""} onChange={(e) => setF({ ...f, attachment_url: e.target.value })} className={inputCls} /></Field>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
        <PrimaryButton type="submit">Simpan</PrimaryButton>
      </div>
    </form>
  );
}
