import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Mail,
  Phone,
  Instagram,
  Youtube,
  Globe,
  Settings as SettingsIcon,
  Sparkles,
  Search,
  Users,
  BarChart3,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { inputCls } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/settings")({ ssr: false, component: AdminSettings });

function AdminSettings() {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async () => (await supabase.from("site_settings").select("*").limit(1).maybeSingle()).data,
  });

  useEffect(() => { if (data && !f) setF(data); }, [data, f]);

  async function save() {
    if (!f) return;
    setSaving(true);
    const { id, updated_at: _u, ...payload } = f;
    await supabase.from("site_settings").update(payload).eq("id", id);
    setSaving(false);
    setSaved(true);
    qc.invalidateQueries({ queryKey: ["site-settings-admin"] });
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    setTimeout(() => setSaved(false), 2500);
  }

  function reset() {
    if (data) setF({ ...data });
  }

  if (!f) return <div className="text-sm text-muted-foreground p-6">Memuat pengaturan...</div>;

  const set = (k: string, v: any) => setF({ ...f, [k]: v });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top page title */}
      <div className="border-b border-border bg-card/60 backdrop-blur">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Pengaturan global Ryota QC.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 p-6">
        <div className="space-y-6">
          {/* 1. BRAND IDENTITY */}
          <SectionCard
            step={1}
            icon={<Sparkles className="h-4 w-4" />}
            title="BRAND IDENTITY"
            subtitle="Informasi identitas dan visual brand"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Nama Website">
                <input className={inputCls} value={f.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} />
              </Field>
              <Field label="Upload Logo">
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                  <img
                    src={f.site_logo || "/favicon.ico"}
                    alt=""
                    className="h-12 w-12 rounded object-contain bg-background border border-border"
                  />
                  <input
                    className={inputCls + " flex-1"}
                    placeholder="https://..."
                    value={f.site_logo ?? ""}
                    onChange={(e) => set("site_logo", e.target.value)}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">PNG / SVG, maks. 2MB</div>
              </Field>
              <Field label="Tagline">
                <input className={inputCls} value={f.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
              </Field>
              <Field label="URL Favicon">
                <div className="relative">
                  <input className={inputCls + " pr-9"} value={f.favicon ?? ""} onChange={(e) => set("favicon", e.target.value)} />
                  <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </Field>
              <Field label="Default Theme">
                <select className={inputCls} value={f.theme_mode ?? "system"} onChange={(e) => set("theme_mode", e.target.value)}>
                  <option value="system">System (Otomatis)</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </Field>
              <div />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <ColorField label="Primary Color" value={f.primary_color ?? "#1E3A8A"} onChange={(v) => set("primary_color", v)} />
              <ColorField label="Secondary Color" value={f.secondary_color ?? "#2563EB"} onChange={(v) => set("secondary_color", v)} />
              <ColorField label="Warna Teks" value={f.text_color ?? "#0F172A"} onChange={(v) => set("text_color", v)} />
              <ColorField label="Warna Muted" value={f.muted_color ?? "#64748B"} onChange={(v) => set("muted_color", v)} />
            </div>
          </SectionCard>

          {/* 2. SEO & METADATA */}
          <SectionCard
            step={2}
            icon={<Search className="h-4 w-4" />}
            title="SEO & METADATA"
            subtitle="Optimasi mesin pencari & metadata situs"
          >
            <div className="grid md:grid-cols-1 gap-4">
              <Field label="Meta Title">
                <input className={inputCls} value={f.meta_title ?? ""} onChange={(e) => set("meta_title", e.target.value)} />
              </Field>
              <Field label="Meta Description" hint={`${(f.meta_description ?? "").length} / 160`}>
                <textarea rows={3} className={inputCls} value={f.meta_description ?? ""} onChange={(e) => set("meta_description", e.target.value)} />
              </Field>
              <Field label="Keywords">
                <input className={inputCls} placeholder="quality control, qc laptop, ..." value={f.keywords ?? ""} onChange={(e) => set("keywords", e.target.value)} />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Open Graph Title">
                  <input className={inputCls} value={f.og_title ?? ""} onChange={(e) => set("og_title", e.target.value)} />
                </Field>
                <Field label="Open Graph Description">
                  <input className={inputCls} value={f.og_description ?? ""} onChange={(e) => set("og_description", e.target.value)} />
                </Field>
              </div>
              <Field label="Canonical URL">
                <input className={inputCls} placeholder="https://ryotaqc.id" value={f.canonical_url ?? ""} onChange={(e) => set("canonical_url", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* 3. CONTACT & SOCIAL */}
          <SectionCard
            step={3}
            icon={<Users className="h-4 w-4" />}
            title="CONTACT & SOCIAL"
            subtitle="Kontak utama dan media sosial"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <IconField icon={<Mail />} label="Email">
                <input type="email" className={inputCls} value={f.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
              </IconField>
              <IconField icon={<Phone />} label="WhatsApp">
                <input className={inputCls} value={f.contact_whatsapp ?? ""} onChange={(e) => set("contact_whatsapp", e.target.value)} />
              </IconField>
              <IconField icon={<Instagram />} label="Instagram">
                <input className={inputCls} value={f.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} />
              </IconField>
              <IconField icon={<Youtube />} label="YouTube">
                <input className={inputCls} value={f.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value)} />
              </IconField>
              <IconField icon={<Globe />} label="Website URL">
                <input className={inputCls} value={f.website_url ?? ""} onChange={(e) => set("website_url", e.target.value)} />
              </IconField>
              <Field label="Footer Text">
                <input className={inputCls} value={f.footer_text ?? ""} onChange={(e) => set("footer_text", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          {/* 4. HOMEPAGE PREFERENCES */}
          <SectionCard
            step={4}
            icon={<SettingsIcon className="h-4 w-4" />}
            title="HOMEPAGE PREFERENCES"
            subtitle="Pengaturan tampilan beranda & navigasi"
          >
            <div className="grid md:grid-cols-1 gap-4">
              <Field label="Hero Title">
                <input className={inputCls} value={f.hero_title ?? ""} onChange={(e) => set("hero_title", e.target.value)} />
              </Field>
              <Field label="Hero Subtitle">
                <input className={inputCls} value={f.hero_subtitle ?? ""} onChange={(e) => set("hero_subtitle", e.target.value)} />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Teks Tombol CTA">
                  <input className={inputCls} value={f.cta_text ?? ""} onChange={(e) => set("cta_text", e.target.value)} />
                </Field>
                <Field label="Default Landing Page">
                  <select className={inputCls} value={f.default_landing ?? "beranda"} onChange={(e) => set("default_landing", e.target.value)}>
                    <option value="beranda">Beranda</option>
                    <option value="prosedur">Prosedur QC</option>
                    <option value="sop">SOP QC</option>
                    <option value="knowledge">Knowledge</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <Toggle label="Navigasi Utama" value={!!f.show_main_nav} on={() => set("show_main_nav", !f.show_main_nav)} />
                <Toggle label="Pencarian di Navbar" value={!!f.show_navbar_search} on={() => set("show_navbar_search", !f.show_navbar_search)} />
                <Toggle label="Widget AI Assistant" value={!!f.show_ai_widget} on={() => set("show_ai_widget", !f.show_ai_widget)} />
                <Toggle label="Widget Music" value={!!f.show_music_widget} on={() => set("show_music_widget", !f.show_music_widget)} hideLabel="Sembunyikan" />
              </div>
            </div>
          </SectionCard>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 5. SYSTEM PREFERENCES */}
            <SectionCard
              step={5}
              icon={<SettingsIcon className="h-4 w-4" />}
              title="SYSTEM PREFERENCES"
              subtitle="Pengaturan sistem dan perilaku aplikasi"
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bahasa Default">
                  <select className={inputCls} value={f.language ?? "id"} onChange={(e) => set("language", e.target.value)}>
                    <option value="id">Indonesia</option>
                    <option value="en">English</option>
                  </select>
                </Field>
                <Field label="Timezone">
                  <select className={inputCls} value={f.timezone ?? "Asia/Jakarta"} onChange={(e) => set("timezone", e.target.value)}>
                    <option>Asia/Jakarta (UTC+7)</option>
                    <option>Asia/Makassar (UTC+8)</option>
                    <option>Asia/Jayapura (UTC+9)</option>
                    <option>UTC</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-2 pt-3">
                <Toggle label="Maintenance Mode" sub="Situs dalam mode pemeliharaan" value={!!f.maintenance_mode} on={() => set("maintenance_mode", !f.maintenance_mode)} />
                <Toggle label="Enable AI Widget" sub="Tampilkan asisten AI di situs" value={!!f.enable_ai_widget} on={() => set("enable_ai_widget", !f.enable_ai_widget)} />
                <Toggle label="Enable Music Widget" sub="Tampilkan musik latar di situs" value={!!f.enable_music_widget} on={() => set("enable_music_widget", !f.enable_music_widget)} />
              </div>
            </SectionCard>

            {/* 6. ANALYTICS / INTEGRATIONS */}
            <SectionCard
              step={6}
              icon={<BarChart3 className="h-4 w-4" />}
              title="ANALYTICS / INTEGRATIONS"
              subtitle="Analitik, tracking & integrasi pihak ketiga"
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label="Google Analytics ID">
                  <input className={inputCls} placeholder="G-XXXXXXXX" value={f.ga_id ?? ""} onChange={(e) => set("ga_id", e.target.value)} />
                </Field>
                <Field label="Meta Pixel ID">
                  <input className={inputCls} value={f.meta_pixel_id ?? ""} onChange={(e) => set("meta_pixel_id", e.target.value)} />
                </Field>
                <Field label="Search Console Verification">
                  <input className={inputCls} value={f.search_console_token ?? ""} onChange={(e) => set("search_console_token", e.target.value)} />
                </Field>
                <Field label="API Key (Opsional)">
                  <input type="password" className={inputCls} value={f.analytics_api_key ?? ""} onChange={(e) => set("analytics_api_key", e.target.value)} />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4 sticky bottom-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent"
              >
                <RotateCcw className="h-4 w-4" /> Reset ke Default
              </button>
            </div>
            {saved ? (
              <span className="text-sm text-emerald-500 inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Tersimpan
              </span>
            ) : (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Semua perubahan akan tersimpan otomatis saat Anda menekan tombol simpan.
              </span>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR — PREVIEW */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-xs font-semibold text-primary uppercase tracking-widest">Preview & Ringkasan</div>
            <div className="text-xs text-muted-foreground mt-1">Tampilan singkat konfigurasi situs</div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Logo Preview</div>
              <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-3">
                {f.site_logo ? (
                  <img src={f.site_logo} alt="logo" className="h-10 w-10 object-contain" />
                ) : (
                  <div className="h-10 w-10 rounded bg-primary/15" />
                )}
                <div className="font-display text-lg font-bold">{f.site_name || "RyotaQC"}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Favicon Preview</div>
              {f.favicon ? (
                <img src={f.favicon} alt="favicon" className="h-6 w-6" />
              ) : (
                <div className="h-6 w-6 rounded bg-primary/20" />
              )}
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">Warna Brand</div>
              <div className="flex items-center gap-2">
                {[f.primary_color, f.secondary_color, f.text_color, f.muted_color, "#E5E7EB"]
                  .filter(Boolean)
                  .map((c: string, i: number) => (
                    <div key={i} className="h-8 w-8 rounded border border-border" style={{ background: c }} title={c} />
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="text-sm font-semibold mb-3">Informasi Situs</div>
            <dl className="space-y-2 text-sm">
              <Row k="Nama Website" v={f.site_name} />
              <Row k="Tagline" v={f.tagline} />
              <Row
                k="URL Situs"
                v={
                  f.website_url ? (
                    <a href={f.website_url} target="_blank" rel="noreferrer" className="text-primary inline-flex items-center gap-1">
                      {f.website_url} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
              <Row
                k="Status"
                v={
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${f.maintenance_mode ? "bg-amber-500/15 text-amber-600" : "bg-emerald-500/15 text-emerald-600"}`}>
                    {f.maintenance_mode ? "Maintenance" : "Aktif"}
                  </span>
                }
              />
              <Row k="Terakhir Diperbarui" v={f.updated_at ? new Date(f.updated_at).toLocaleString("id-ID") : "-"} />
            </dl>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm flex gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="text-foreground/80">
              Perubahan yang Anda buat akan diterapkan ke seluruh situs setelah disimpan.
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionCard({
  step,
  icon,
  title,
  subtitle,
  children,
}: {
  step: number;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <header className="flex items-start gap-3 mb-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
          {step}
        </div>
        <div>
          <h3 className="font-semibold text-sm tracking-widest text-primary inline-flex items-center gap-2">
            {icon} {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-foreground/80 mb-1.5 flex items-center justify-between">
        <span>{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function IconField({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Field label={label}>
      <div className="relative">
        {children}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
          {icon}
        </span>
      </div>
    </Field>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="relative">
        <input className={inputCls + " pl-10 uppercase"} value={value} onChange={(e) => onChange(e.target.value)} />
        <input
          type="color"
          value={/^#([0-9a-f]{6})$/i.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded border border-border cursor-pointer"
          aria-label={label}
        />
      </div>
    </Field>
  );
}

function Toggle({
  label,
  sub,
  value,
  on,
  hideLabel,
}: {
  label: string;
  sub?: string;
  value: boolean;
  on: () => void;
  hideLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
      <div>
        <div className="text-xs font-medium">{label}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      <button
        type="button"
        onClick={on}
        role="switch"
        aria-checked={value}
        className={`relative h-5 w-9 rounded-full transition ${value ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${value ? "left-4" : "left-0.5"}`} />
      </button>
      {hideLabel && !value && <span className="text-[10px] text-muted-foreground">{hideLabel}</span>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/50 pb-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium max-w-[60%] truncate">{v || "-"}</dd>
    </div>
  );
}
