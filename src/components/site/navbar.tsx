import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "./theme-toggle";
import logoRq from "@/assets/logorq.png.asset.json";


const links = [
  { to: "/", label: "Beranda" },
  { to: "/prosedur", label: "Prosedur" },
  { to: "/sop", label: "SOP" },
  { to: "/informasi", label: "Informasi" },
  { to: "/maintenance", label: "Maintenance" },
  { to: "/knowledge", label: "Knowledge" },
  { to: "/tools", label: "QC Tools" },
  { to: "/quiz", label: "Quiz" },
  { to: "/ai", label: "AI" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
      {/* ===== TOP ROW: brand tagline · search · admin ===== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link to="/" aria-label="Ryota QC" className="flex items-center gap-2 shrink-0 group">
          <img
            src={logoRq.url}
            alt="Ryota QC"
            className="h-7 w-7 object-contain transition-transform group-hover:scale-110"
          />
          <span className="hidden sm:inline text-xs text-muted-foreground tracking-wide">
            Quality Control Platform untuk unit Laptop, MacBook, dan Desktop.
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <GlobalSearch />
          </div>
          <div className="sm:hidden">
            <GlobalSearch />
          </div>
          <ThemeToggle />
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 sm:px-4 py-2 text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin</span>
          </Link>
        </div>

      </div>

      {/* ===== BOTTOM ROW: nav links with underline active ===== */}
      <nav
        aria-label="Main"
        className="mx-auto max-w-7xl px-2 sm:px-6 border-t border-border/60"
      >
        <ul className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {links.map((l) => {
            const active = isActive(l.to);
            return (
              <li key={l.to} className="shrink-0">
                <Link
                  to={l.to}
                  className={`relative inline-flex items-center px-3 sm:px-4 py-3 text-sm whitespace-nowrap transition ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  <span
                    className={`absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-primary transition-all ${
                      active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    }`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
