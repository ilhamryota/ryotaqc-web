import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  FolderTree,
  ClipboardCheck,
  ListChecks,
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  Settings,
  Users,
  LogOut,
  Cpu,
  Menu,
  X,
  Download,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/site/theme-provider";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/pages", label: "Pages", icon: FileText },
  { to: "/admin/articles", label: "Articles", icon: Newspaper },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/procedures", label: "Prosedur QC", icon: ListChecks },
  { to: "/admin/sop", label: "SOP QC", icon: ClipboardCheck },
  { to: "/admin/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/admin/quiz", label: "Quiz", icon: HelpCircle },
  { to: "/admin/tools", label: "QC Tools", icon: Download },
  { to: "/admin/media", label: "Media", icon: ImageIcon },
  { to: "/admin/settings", label: "Website Settings", icon: Settings, superOnly: true },
  { to: "/admin/users", label: "Admin Users", icon: Users, superOnly: true },
] as const;

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const { theme, setTheme, resolved } = useTheme();

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  const items = navItems.filter((n) => !("superOnly" in n && n.superOnly) || isSuperAdmin);

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } top-0 h-screen`}
      >
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 border border-primary/30">
            <Cpu className="h-4 w-4 text-primary" />
          </span>
          <div>
            <div className="font-display font-bold text-sm">RyotaQC</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => {
            const active = path === to || path.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="px-2 py-2 mb-2">
            <div className="text-xs font-medium truncate">{user?.email}</div>
            <div className="text-[10px] text-muted-foreground">{isSuperAdmin ? "Super Admin" : "Admin"}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-lg border border-border bg-background p-0.5">
              {([
                { v: "light", icon: Sun, label: "Light" },
                { v: "auto", icon: Monitor, label: "Auto" },
                { v: "dark", icon: Moon, label: "Dark" },
              ] as const).map(({ v, icon: Icon, label }) => (
                <button
                  key={v}
                  onClick={() => setTheme(v)}
                  title={label}
                  className={`grid h-7 w-7 place-items-center rounded-md transition ${
                    theme === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
              className="sm:hidden grid h-9 w-9 place-items-center rounded-lg border border-border"
              title="Toggle theme"
            >
              {resolved === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <a href="/" className="text-xs text-muted-foreground hover:text-foreground hidden md:inline">
              ↗ Lihat website
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
