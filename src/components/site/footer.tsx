import { Link } from "@tanstack/react-router";
import logoRq from "@/assets/logorq.png.asset.json";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { data: s } = useSiteSettings();
  const name = s?.site_name || "Ryota QC";
  const tagline =
    s?.tagline ||
    "Sistem panduan Quality Control laptop, MacBook, dan desktop yang rapi dan terstandarisasi.";
  const footerText =
    s?.footer_text || `© ${new Date().getFullYear()} ${name} · v1.0`;

  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <img src={s?.site_logo || logoRq.url} alt={name} className="h-8 w-8 object-contain" />
            <div className="font-display text-lg font-bold">
              {name.replace(/QC$/i, "")}<span className="text-primary">QC</span>
            </div>
          </div>
          <p className="mt-3 text-muted-foreground">{tagline}</p>
        </div>
        <div>
          <div className="font-semibold mb-3">Workflow</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/prosedur" className="hover:text-primary">Prosedur QC</Link></li>
            <li><Link to="/sop" className="hover:text-primary">SOP QC</Link></li>
            <li><Link to="/quiz" className="hover:text-primary">Quiz</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Belajar</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/knowledge" className="hover:text-primary">Knowledge Center</Link></li>
            <li><Link to="/informasi" className="hover:text-primary">Informasi</Link></li>
            <li><Link to="/maintenance" className="hover:text-primary">Maintenance</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Bantuan</div>
          <ul className="space-y-2 text-muted-foreground">
            {s?.enable_ai_widget !== false && (
              <li><Link to="/ai" className="hover:text-primary">RyotaQC AI</Link></li>
            )}
            <li><Link to="/contact" className="hover:text-primary">Contact Developer</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        {footerText}
      </div>
    </footer>
  );
}
