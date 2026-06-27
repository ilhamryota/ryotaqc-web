import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddButton, Field, PageHeader, PrimaryButton, StatusBadge, inputCls } from "@/components/admin/ui";
import { ConfirmDelete, Modal } from "@/components/admin/modal";
import { Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/quiz")({ ssr: false, component: AdminQuiz });

type Q = {
  id: string;
  question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  level: "dasar" | "menengah" | "tinggi" | "lanjutan";
  status: "draft" | "published";
  updated_at: string;
};

function AdminQuiz() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Q | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin-quiz"],
    queryFn: async () => (await supabase.from("quiz_questions").select("*").order("updated_at", { ascending: false })).data ?? [],
  });
  const filtered = (rows ?? []).filter((r) => filter === "all" || r.level === filter);

  function openNew() {
    setEditing({ id: "", question: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_answer: "A", explanation: "", level: "dasar", status: "draft", updated_at: "" });
    setModalOpen(true);
  }
  async function save(f: Q) {
    const payload = {
      question: f.question, option_a: f.option_a, option_b: f.option_b, option_c: f.option_c, option_d: f.option_d,
      correct_answer: f.correct_answer, explanation: f.explanation, level: f.level, status: f.status,
    };
    if (f.id) await supabase.from("quiz_questions").update(payload).eq("id", f.id);
    else {
      const { data: u } = await supabase.auth.getUser();
      await supabase.from("quiz_questions").insert({ ...payload, created_by: u.user?.id });
    }
    setModalOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-quiz"] });
  }
  async function remove(id: string) {
    await supabase.from("quiz_questions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-quiz"] });
  }

  return (
    <div>
      <PageHeader title="Quiz" description="Bank soal pilihan ganda." action={<AddButton onClick={openNew} label="Soal Baru" />} />
      <div className="mb-4">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={inputCls + " max-w-xs"}>
          <option value="all">Semua level</option><option value="dasar">Dasar</option><option value="menengah">Menengah</option><option value="tinggi">Tinggi</option><option value="lanjutan">Lanjutan</option>
        </select>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Pertanyaan</th><th className="text-left px-4 py-3">Level</th><th className="text-left px-4 py-3">Jawaban</th><th className="text-left px-4 py-3">Status</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Memuat...</td></tr>}
            {!isLoading && filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada soal.</td></tr>}
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 max-w-md"><div className="line-clamp-2">{r.question}</div></td>
                <td className="px-4 py-3 capitalize">{r.level}</td>
                <td className="px-4 py-3 font-mono">{r.correct_answer}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(r as Q); setModalOpen(true); }} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteId(r.id)} className="inline-grid h-8 w-8 place-items-center rounded-md hover:bg-destructive/10 text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing?.id ? "Edit Soal" : "Soal Baru"} size="lg">
        {editing && <QForm initial={editing} onSave={save} onCancel={() => setModalOpen(false)} />}
      </Modal>
      <ConfirmDelete open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && remove(deleteId)} label="soal ini" />
    </div>
  );
}

function QForm({ initial, onSave, onCancel }: { initial: Q; onSave: (q: Q) => void; onCancel: () => void }) {
  const [f, setF] = useState(initial);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="space-y-3">
      <Field label="Pertanyaan"><textarea required rows={3} value={f.question} onChange={(e) => setF({ ...f, question: e.target.value })} className={inputCls} /></Field>
      <div className="grid md:grid-cols-2 gap-3">
        {(["A", "B", "C", "D"] as const).map((opt) => {
          const key = `option_${opt.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
          return (
            <Field key={opt} label={`Pilihan ${opt}`}>
              <input required value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value } as Q)} className={inputCls} />
            </Field>
          );
        })}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Jawaban Benar">
          <select value={f.correct_answer} onChange={(e) => setF({ ...f, correct_answer: e.target.value as any })} className={inputCls}>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
          </select>
        </Field>
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
      <Field label="Pembahasan"><textarea rows={3} value={f.explanation ?? ""} onChange={(e) => setF({ ...f, explanation: e.target.value })} className={inputCls} /></Field>
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="rounded-lg border border-input px-4 py-2 text-sm hover:bg-accent">Batal</button>
        <PrimaryButton type="submit">Simpan</PrimaryButton>
      </div>
    </form>
  );
}
