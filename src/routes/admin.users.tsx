import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  Users,
  ShieldCheck,
  PencilLine,
  Activity,
  Shield,
  Edit3,
  ShieldAlert,
  Eye,
  Lightbulb,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/admin/users")({ ssr: false, component: AdminUsers });

const ROLES: AppRole[] = ["super_admin", "admin", "editor", "moderator", "viewer"];

const ROLE_META: Record<AppRole, { label: string; pill: string; dot: string }> = {
  super_admin: {
    label: "Super Admin",
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
    dot: "bg-blue-500",
  },
  admin: {
    label: "Admin",
    pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30",
    dot: "bg-violet-500",
  },
  editor: {
    label: "Editor",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  moderator: {
    label: "Moderator",
    pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
    dot: "bg-amber-500",
  },
  viewer: {
    label: "Viewer",
    pill: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    dot: "bg-slate-500",
  },
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
];

function initials(name?: string | null, email?: string | null) {
  const src = (name || email || "?").trim();
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function timeAgo(iso?: string | null) {
  if (!iso) return "Belum aktif";
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  if (diff < 60_000) return "Sekarang";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

function AdminUsers() {
  const qc = useQueryClient();
  const { user: me, isSuperAdmin } = useAuth();

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () =>
      (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: roles = [] } = useQuery({
    queryKey: ["admin-roles-all"],
    queryFn: async () => (await supabase.from("user_roles").select("*")).data ?? [],
  });

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | AppRole>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function userRole(uid: string): AppRole {
    return ((roles as any[]).find((r) => r.user_id === uid)?.role as AppRole) ?? "editor";
  }

  async function setRole(userId: string, role: AppRole) {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    qc.invalidateQueries({ queryKey: ["admin-roles-all"] });
  }

  const enriched = useMemo(() => {
    return profiles.map((p: any) => {
      const r = userRole(p.id);
      const lastActive = p.updated_at ?? p.created_at;
      const recent = lastActive && Date.now() - new Date(lastActive).getTime() < 1000 * 60 * 60 * 24;
      return {
        ...p,
        role: r,
        lastActive,
        status: recent ? "Aktif" : "Pending",
      };
    });
  }, [profiles, roles]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = enriched.filter((u) => {
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (!q) return true;
      return (u.email ?? "").toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q);
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return (a.full_name ?? "").localeCompare(b.full_name ?? "");
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return list;
  }, [enriched, search, filterRole, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => {
    const total = enriched.length;
    const supers = enriched.filter((u) => u.role === "super_admin").length;
    const editors = enriched.filter((u) => u.role === "editor" || u.role === "moderator").length;
    const today = enriched.filter(
      (u) => u.lastActive && Date.now() - new Date(u.lastActive).getTime() < 1000 * 60 * 60 * 24,
    ).length;
    return { total, supers, editors, today };
  }, [enriched]);

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Hanya Super Admin yang bisa mengelola user.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola akun admin, peran, dan akses pengguna terdaftar.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> Undang Admin
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={<Users className="h-5 w-5" />}
          iconWrap="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
          label="Total Admin"
          value={stats.total}
          hint="Semua akun admin terdaftar"
        />
        <StatTile
          icon={<ShieldCheck className="h-5 w-5" />}
          iconWrap="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
          label="Super Admin"
          value={stats.supers}
          hint="Memiliki akses penuh sistem"
        />
        <StatTile
          icon={<PencilLine className="h-5 w-5" />}
          iconWrap="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
          label="Editor / Staff"
          value={stats.editors}
          hint="Dapat mengelola konten"
        />
        <StatTile
          icon={<Activity className="h-5 w-5" />}
          iconWrap="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
          label="Aktif Hari Ini"
          value={stats.today}
          hint="Admin aktif hari ini"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* Main panel */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari admin..."
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <Select
              value={filterRole}
              onChange={(v) => {
                setFilterRole(v as any);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Semua Peran" },
                ...ROLES.map((r) => ({ value: r, label: ROLE_META[r].label })),
              ]}
            />
            <Select
              value={sort}
              onChange={(v) => setSort(v as any)}
              options={[
                { value: "newest", label: "Urutkan: Terbaru" },
                { value: "oldest", label: "Urutkan: Terlama" },
                { value: "name", label: "Urutkan: Nama" },
              ]}
            />
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-muted/50">
              <SlidersHorizontal className="h-4 w-4" /> Filter Lainnya
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Profil / User</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Last Active</th>
                  <th className="text-right px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      Tidak ada admin yang cocok dengan filter.
                    </td>
                  </tr>
                )}
                {pageItems.map((u) => {
                  const meta = ROLE_META[u.role as AppRole];
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full ${avatarColor(u.id)} text-white grid place-items-center text-xs font-semibold`}
                          >
                            {initials(u.full_name, u.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 font-medium">
                              <span className="truncate">{u.full_name || u.email}</span>
                              {isMe && (
                                <span className="rounded-full bg-blue-50 text-blue-600 text-[10px] px-1.5 py-0.5 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30">
                                  (Anda)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {meta.label === "Super Admin" ? "Super Administrator" : `${meta.label} Staff`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${meta.pill}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${u.status === "Aktif" ? "bg-emerald-500" : "bg-amber-500"}`}
                          />
                          <span className={u.status === "Aktif" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                            {u.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{timeAgo(u.lastActive)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <RoleSelect
                            value={u.role}
                            disabled={isMe}
                            onChange={(r) => setRole(u.id, r)}
                          />
                          <IconBtn title="Audit akses">
                            <Shield className="h-4 w-4" />
                          </IconBtn>
                          <div className="relative">
                            <IconBtn title="Aksi lain" onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}>
                              <MoreVertical className="h-4 w-4" />
                            </IconBtn>
                            {menuOpen === u.id && (
                              <div
                                className="absolute right-0 top-full mt-1 z-10 w-40 rounded-lg border border-border bg-popover shadow-lg py-1 text-sm"
                                onMouseLeave={() => setMenuOpen(null)}
                              >
                                <button className="w-full text-left px-3 py-1.5 hover:bg-muted">Reset password</button>
                                <button className="w-full text-left px-3 py-1.5 hover:bg-muted">Salin email</button>
                                {!isMe && (
                                  <button className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-muted">
                                    Nonaktifkan
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
            <div>
              Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} -{" "}
              {Math.min(page * perPage, filtered.length)} dari {filtered.length} data
            </div>
            <div className="flex items-center gap-1">
              <IconBtn onClick={() => setPage((p) => Math.max(1, p - 1))} title="Sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </IconBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-8 rounded-md text-xs font-medium ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-border hover:bg-muted/50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <IconBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} title="Berikutnya">
                <ChevronRight className="h-4 w-4" />
              </IconBtn>
            </div>
            <Select
              value={String(perPage)}
              onChange={(v) => {
                setPerPage(Number(v));
                setPage(1);
              }}
              options={[
                { value: "10", label: "10 / halaman" },
                { value: "25", label: "25 / halaman" },
                { value: "50", label: "50 / halaman" },
              ]}
            />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Akses Level &amp; Peran</h3>
            <ul className="space-y-4 text-sm">
              <RoleLegend icon={<ShieldCheck className="h-4 w-4 text-blue-500" />} title="Super Admin" titleClass="text-blue-600 dark:text-blue-300" desc="Akses penuh ke semua fitur, pengaturan, dan manajemen pengguna." />
              <RoleLegend icon={<Edit3 className="h-4 w-4 text-violet-500" />} title="Editor" titleClass="text-violet-600 dark:text-violet-300" desc="Dapat membuat, mengedit, dan menerbitkan konten di sistem." />
              <RoleLegend icon={<ShieldAlert className="h-4 w-4 text-amber-500" />} title="Moderator" titleClass="text-amber-600 dark:text-amber-300" desc="Dapat memoderasi konten dan mengelola komentar atau laporan." />
              <RoleLegend icon={<Eye className="h-4 w-4 text-slate-500" />} title="Viewer" titleClass="text-slate-600 dark:text-slate-300" desc="Hanya dapat melihat konten yang telah dipublikasikan." />
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-200/60 bg-blue-50/60 dark:bg-blue-500/10 dark:border-blue-500/30 p-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
              <Lightbulb className="h-4 w-4" /> Tips
            </div>
            <p className="mt-1 text-xs text-blue-700/80 dark:text-blue-200/80">
              Pastikan admin hanya memberikan akses sesuai kebutuhan untuk menjaga keamanan sistem.
            </p>
          </div>
        </aside>
      </div>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} />}
    </div>
  );
}

function StatTile({
  icon,
  iconWrap,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  iconWrap: string;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-4">
        <div className={`h-11 w-11 rounded-xl grid place-items-center ${iconWrap}`}>{icon}</div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold tabular-nums mt-0.5">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
        </div>
      </div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border border-input bg-background pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: AppRole;
  onChange: (r: AppRole) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as AppRole)}
        className="appearance-none h-8 rounded-md border border-border bg-background pl-2 pr-7 text-xs font-medium hover:bg-muted/40 disabled:opacity-50"
        title="Ubah peran"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_META[r].label}
          </option>
        ))}
      </select>
      <PencilLine className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
    </div>
  );
}

function RoleLegend({
  icon,
  title,
  titleClass,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  titleClass: string;
  desc: string;
}) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className={`text-sm font-semibold ${titleClass}`}>{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </li>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("editor");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      // Find existing profile by email and assign role
      const { data: prof } = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();
      if (!prof) {
        setMsg("Email tersebut belum terdaftar. Minta user mendaftar terlebih dahulu, lalu ubah perannya di sini.");
        setBusy(false);
        return;
      }
      await supabase.from("user_roles").delete().eq("user_id", prof.id);
      await supabase.from("user_roles").insert({ user_id: prof.id, role: role as any });
      setMsg("Peran berhasil ditetapkan.");
      setTimeout(onClose, 800);
    } catch (err: any) {
      setMsg(err?.message ?? "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Undang / Tetapkan Admin</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email user</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ryotaqc.com"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Peran</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_META[r].label}
                </option>
              ))}
            </select>
          </div>
          {msg && <div className="text-xs text-muted-foreground">{msg}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted/50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
