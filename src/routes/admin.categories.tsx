import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddButton, Field, PageHeader, PrimaryButton, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import { Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ ssr: false, component: AdminCategories });

const TYPES = ["software", "hardware", "sop", "knowledge", "maintenance"] as const;
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("type")).data ?? [],
  });

  function openNew() {
    setEditing({ id: "", name: "", slug: "", description: "", type: "software" });
    setModalOpen(true);
  }
  async function save(f: any) {
    const payload = { name: f.name, slug: f.slug || slugify(f.name), description: f.description, type: f.type };
    if (f.id) await supabase.from("categories").update(payload).eq("id", f.id);
    else await supabase.from("categories").insert(payload);
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }
  async function remove(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-cats"] });
  }

  return (
    <div>
      <PageHeader title="Categories" description="Kelola kategori konten." action={<AddButton onClick={openNew} label="Kategori Baru" />} />
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Nama</th><th className="text-left px-4 py-3">Tipe</th><th className="text-left px-4 py-3">Slug</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>}
            {(rows ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded bg-muted">{r.type}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.slug}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(r); setModalOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Edit Kategori" : "Kategori Baru"}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(editing); }} className="space-y-3">
            <Field label="Nama"><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
            <Field label="Slug"><input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className={inputCls} /></Field>
            <Field label="Tipe">
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={inputCls}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Deskripsi"><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
              <PrimaryButton type="submit">Simpan</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="kategori ini" />
    </div>
  );
}
