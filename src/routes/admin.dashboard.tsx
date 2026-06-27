import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  FileText, ClipboardCheck, BookOpen, HelpCircle, Image as ImageIcon,
  Settings, Download, ListChecks, FileEdit, CheckCircle2, Plus, ArrowRight,
  Activity, Database, Globe, HardDrive, Film, FileType2, Hand,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  ssr: false,
  component: AdminDashboard,
});

type Trend = "up" | "down" | "flat";
const fmt = (n: number) => n.toLocaleString("id-ID");
const bytes = (n: number) => {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  return `${(n / Math.pow(1024, i)).toFixed(2)} ${u[i]}`;
};

function AdminDashboard() {
  const { user, isSuperAdmin } = useAuth();
  const qc = useQueryClient();

  // Realtime: refetch stats when any tracked table changes
  useEffect(() => {
    const ch = supabase
      .channel("admin-dashboard-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, () => {
        qc.invalidateQueries({ queryKey: ["admin-stats"] });
        qc.invalidateQueries({ queryKey: ["admin-recent"] });
        qc.invalidateQueries({ queryKey: ["admin-latest-content"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sop_items" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "knowledge_materials" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "quiz_questions" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "qc_tools" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "pages" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "procedure_steps" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "media_library" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-stats"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [a, sop, kn, q, dr, pub, tools, pages, proc, media] = await Promise.all([
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("sop_items").select("id", { count: "exact", head: true }),
        supabase.from("knowledge_materials").select("id", { count: "exact", head: true }),
        supabase.from("quiz_questions").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("qc_tools").select("id", { count: "exact", head: true }),
        supabase.from("pages").select("id", { count: "exact", head: true }),
        supabase.from("procedure_steps").select("id", { count: "exact", head: true }),
        supabase.from("media_library").select("file_type,file_size"),
      ]);
      const mediaRows = media.data ?? [];
      const images = mediaRows.filter((m: any) => (m.file_type ?? "").startsWith("image")).length;
      const videos = mediaRows.filter((m: any) => (m.file_type ?? "").startsWith("video")).length;
      const docs = mediaRows.length - images - videos;
      const totalBytes = mediaRows.reduce((s: number, m: any) => s + (m.file_size ?? 0), 0);
      return {
        articles: a.count ?? 0,
        sop: sop.count ?? 0,
        knowledge: kn.count ?? 0,
        quiz: q.count ?? 0,
        drafts: dr.count ?? 0,
        published: pub.count ?? 0,
        tools: tools.count ?? 0,
        pages: pages.count ?? 0,
        procedures: proc.count ?? 0,
        mediaTotal: mediaRows.length,
        images, videos, docs, totalBytes,
      };
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["admin-recent"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id,title,status,article_type,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: latest } = useQuery({
    queryKey: ["admin-latest-content"],
    queryFn: async () => {
      const { data } = await supabase
        .from("articles")
        .select("id,title,article_type,status,updated_at")
        .order("updated_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const STORAGE_QUOTA = 5 * 1024 * 1024 * 1024; // 5 GB

  const statCards: { label: string; value: number; icon: any; hint: string; tint: string; trend: Trend; trendValue: string; spark: number[] }[] = [
    { label: "Artikel", value: stats?.articles ?? 0, icon: FileText, hint: "Total artikel", tint: "from-blue-500/15 to-blue-500/0 text-blue-600", trend: "up", trendValue: "12%", spark: [4,8,6,10,7,12,15] },
    { label: "SOP", value: stats?.sop ?? 0, icon: ClipboardCheck, hint: "Dokumen SOP", tint: "from-cyan-500/15 to-cyan-500/0 text-cyan-600", trend: "up", trendValue: "8%", spark: [6,5,7,9,8,11,12] },
    { label: "Knowledge", value: stats?.knowledge ?? 0, icon: BookOpen, hint: "Materi knowledge", tint: "from-indigo-500/15 to-indigo-500/0 text-indigo-600", trend: "up", trendValue: "15%", spark: [3,6,5,9,11,10,14] },
    { label: "Quiz", value: stats?.quiz ?? 0, icon: HelpCircle, hint: "Total quiz", tint: "from-violet-500/15 to-violet-500/0 text-violet-600", trend: "up", trendValue: "5%", spark: [5,7,6,8,7,10,11] },
    { label: "Draft", value: stats?.drafts ?? 0, icon: FileEdit, hint: "Dalam draft", tint: "from-amber-500/15 to-amber-500/0 text-amber-600", trend: "flat", trendValue: "0%", spark: [4,5,4,6,5,5,6] },
    { label: "Published", value: stats?.published ?? 0, icon: CheckCircle2, hint: "Telah dipublish", tint: "from-emerald-500/15 to-emerald-500/0 text-emerald-600", trend: "up", trendValue: "18%", spark: [2,5,7,9,12,14,17] },
  ];

  const quick = [
    { to: "/admin/articles", icon: FileText, label: "Buat Artikel", desc: "Tulis artikel baru untuk website" },
    { to: "/admin/sop", icon: ClipboardCheck, label: "Buat SOP", desc: "Tambah dokumen SOP baru" },
    { to: "/admin/knowledge", icon: BookOpen, label: "Buat Materi", desc: "Buat materi knowledge" },
    { to: "/admin/quiz", icon: HelpCircle, label: "Buat Quiz", desc: "Buat kuis interaktif" },
    { to: "/admin/tools", icon: Download, label: "Tambah Tool", desc: "Tambah alat QC baru" },
    { to: "/admin/media", icon: ImageIcon, label: "Upload Media", desc: "Upload gambar, video, atau file" },
    { to: "/admin/procedures", icon: ListChecks, label: "Edit Prosedur", desc: "Atur langkah prosedur QC" },
    { to: "/admin/settings", icon: Settings, label: "Setting Website", desc: "Kelola pengaturan website" },
  ];

  const totalContent = (stats?.articles ?? 0) + (stats?.sop ?? 0) + (stats?.knowledge ?? 0) + (stats?.quiz ?? 0) + (stats?.tools ?? 0) + (stats?.procedures ?? 0);
  const dist = [
    { label: "Artikel", value: stats?.articles ?? 0, color: "#3b82f6" },
    { label: "SOP", value: stats?.sop ?? 0, color: "#06b6d4" },
    { label: "Knowledge", value: stats?.knowledge ?? 0, color: "#6366f1" },
    { label: "Quiz", value: stats?.quiz ?? 0, color: "#8b5cf6" },
    { label: "Lainnya", value: (stats?.tools ?? 0) + (stats?.procedures ?? 0) + (stats?.pages ?? 0), color: "#94a3b8" },
  ];

  const storagePct = Math.min(100, Math.round(((stats?.totalBytes ?? 0) / STORAGE_QUOTA) * 1000) / 10);
  const greetingName =
    (user?.user_metadata as any)?.full_name ||
    user?.email?.split("@")[0] ||
    "Admin";
  const greetingRole = isSuperAdmin ? "Super Admin" : "Admin";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Ryota QC Admin</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan konten Ryota QC.</p>
        </div>
      </div>

      {/* Welcome card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <h2 className="text-xl font-bold flex items-center gap-2">
          Selamat datang, {greetingName}! <Hand className="h-5 w-5 text-amber-500" />
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Kelola konten, pantau aktivitas, dan tingkatkan kualitas platform Ryota QC dengan mudah.
        </p>
        <div className="mt-2 text-xs text-muted-foreground">Login sebagai <span className="font-medium text-foreground">{greetingRole}</span></div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition">
            <div className="flex items-start justify-between">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-muted-foreground">{s.label}</div>
              <div className="text-3xl font-bold tabular-nums mt-0.5">{fmt(s.value)}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`text-[11px] font-medium ${s.trend === "up" ? "text-emerald-600" : s.trend === "down" ? "text-rose-600" : "text-muted-foreground"}`}>
                {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"} {s.trendValue}
              </span>
              <Sparkline data={s.spark} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Quick Action</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quick.map((q) => (
            <Link
              key={q.to}
              to={q.to as any}
              className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/50 hover:bg-primary/5 transition"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <q.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight">{q.label}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{q.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity + Latest Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Aktivitas Terkini</h3>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          {(recent ?? []).length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Belum ada aktivitas.</div>
          ) : (
            <ul className="relative space-y-4 before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-px before:bg-border">
              {recent!.map((r) => (
                <li key={r.id} className="relative pl-8">
                  <span className="absolute left-0 top-1 grid h-6 w-6 place-items-center rounded-full bg-primary/15 border border-primary/30">
                    <FileText className="h-3 w-3 text-primary" />
                  </span>
                  <div className="text-sm font-medium leading-tight truncate">{r.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {r.article_type} · {new Date(r.updated_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/articles" className="mt-5 inline-flex items-center text-xs text-primary font-medium hover:underline">
            Lihat semua aktivitas <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Konten Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 pr-2 font-medium">Judul</th>
                  <th className="py-2 px-2 font-medium">Kategori</th>
                  <th className="py-2 px-2 font-medium">Status</th>
                  <th className="py-2 pl-2 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {(latest ?? []).length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">Belum ada konten.</td></tr>
                ) : latest!.map((l) => (
                  <tr key={l.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-2 truncate max-w-[180px]">{l.title}</td>
                    <td className="py-2 px-2 capitalize text-muted-foreground">{l.article_type}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                        l.status === "published"
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                          : "border-amber-500/30 text-amber-600 bg-amber-500/10"
                      }`}>{l.status}</span>
                    </td>
                    <td className="py-2 pl-2 text-muted-foreground whitespace-nowrap">
                      {new Date(l.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/admin/articles" className="mt-3 inline-flex items-center text-xs text-primary font-medium hover:underline">
            Lihat semua konten <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Distribusi + System status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Distribusi Konten</h3>
          <div className="flex items-center gap-6 flex-wrap">
            <Donut data={dist} total={totalContent} />
            <ul className="space-y-2 text-sm flex-1 min-w-[180px]">
              {dist.map((d) => {
                const pct = totalContent ? ((d.value / totalContent) * 100).toFixed(1) : "0.0";
                return (
                  <li key={d.label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      {d.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">System Status</h3>
          <ul className="space-y-3 text-sm">
            <StatusRow icon={Globe} label="Website" value="Online" tone="ok" />
            <StatusRow icon={Database} label="Database" value="Normal" tone="ok" />
            <StatusRow icon={HardDrive} label="Storage" value={`${storagePct}%`} tone={storagePct > 80 ? "warn" : "ok"} />
          </ul>
        </div>
      </div>

      {/* Storage & Media */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Storage & Media</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {bytes(stats?.totalBytes ?? 0)} / {bytes(STORAGE_QUOTA)} digunakan
          </span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-cyan-500 transition-all" style={{ width: `${storagePct}%` }} />
        </div>
        <div className="mt-1 text-right text-xs font-medium tabular-nums">{storagePct}%</div>
      </div>

      {/* Media counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MediaCount icon={FileType2} label="Total File" value={stats?.mediaTotal ?? 0} tint="text-blue-600 bg-blue-500/10" />
        <MediaCount icon={ImageIcon} label="Gambar" value={stats?.images ?? 0} tint="text-emerald-600 bg-emerald-500/10" />
        <MediaCount icon={FileText} label="Dokumen" value={stats?.docs ?? 0} tint="text-amber-600 bg-amber-500/10" />
        <MediaCount icon={Film} label="Video" value={stats?.videos ?? 0} tint="text-violet-600 bg-violet-500/10" />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 70, h = 22;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts} className="text-primary/70" />
    </svg>
  );
}

function Donut({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) {
  const size = 160, stroke = 22, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" className="opacity-40" />
        {total > 0 && data.map((d) => {
          const len = (d.value / total) * c;
          const seg = (
            <circle
              key={d.label}
              cx={size / 2} cy={size / 2} r={r}
              stroke={d.color} strokeWidth={stroke} fill="none"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-bold tabular-nums">{fmt(total)}</div>
          <div className="text-[11px] text-muted-foreground">Total Konten</div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string; tone: "ok" | "warn" | "bad" }) {
  const toneCls = tone === "ok" ? "text-emerald-600 bg-emerald-500/10" : tone === "warn" ? "text-amber-600 bg-amber-500/10" : "text-rose-600 bg-rose-500/10";
  return (
    <li className="flex items-center gap-3">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneCls}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{value}</div>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${toneCls}`}>{tone === "ok" ? "OK" : tone.toUpperCase()}</span>
    </li>
  );
}

function MediaCount({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center gap-3">
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold tabular-nums leading-tight">{fmt(value)}</div>
      </div>
    </div>
  );
}
