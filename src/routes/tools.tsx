import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/site/reveal";
import * as Icons from "lucide-react";
import {
  Download,
  ExternalLink,
  Search,
  Wrench,
  Sparkles,
  Layers,
  CheckCircle2,
  RefreshCw,
  Zap,
  Monitor,
  HardDrive,
  Apple,
  Terminal,
  Battery,
  Cpu,
  Keyboard,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import heroTools from "@/assets/tools/hero-tools.jpg";
import ctaToolbox from "@/assets/tools/cta-toolbox.jpg";
import osWin11 from "@/assets/tools/os-win11.jpg";
import osWin10 from "@/assets/tools/os-win10.jpg";
import osWinpe from "@/assets/tools/os-winpe.jpg";
import osTahoe from "@/assets/tools/os-tahoe.jpg";
import osSequoia from "@/assets/tools/os-sequoia.jpg";
import osSonoma from "@/assets/tools/os-sonoma.jpg";
import osMonterey from "@/assets/tools/os-monterey.jpg";
import osBigsur from "@/assets/tools/os-bigsur.jpg";
import osUbuntu24 from "@/assets/tools/os-ubuntu24.jpg";
import osUbuntu22 from "@/assets/tools/os-ubuntu22.jpg";
import toolHdsentinel from "@/assets/tools/tool-hdsentinel.jpg";
import toolCrystaldiskinfo from "@/assets/tools/tool-crystaldiskinfo.jpg";
import toolCrystaldiskmark from "@/assets/tools/tool-crystaldiskmark.jpg";
import toolLcdtest from "@/assets/tools/tool-lcdtest.jpg";
import toolDeadpixel from "@/assets/tools/tool-deadpixel.jpg";
import toolKeyboard from "@/assets/tools/tool-keyboard.jpg";
import toolBatteryinfo from "@/assets/tools/tool-batteryinfo.jpg";
import toolCoconut from "@/assets/tools/tool-coconut.jpg";
import toolHwinfo from "@/assets/tools/tool-hwinfo.jpg";
import toolCpuz from "@/assets/tools/tool-cpuz.jpg";
import toolGpuz from "@/assets/tools/tool-gpuz.jpg";
import toolRufus from "@/assets/tools/tool-rufus.jpg";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "QC Tools — Download OS & Tools Quality Control | Ryota QC" },
      {
        name: "description",
        content:
          "Pusat download Operating System (Windows, Linux, WinPE, macOS) dan tools QC seperti HDD Sentinel, CrystalDiskInfo, LCD Test untuk pengecekan laptop & MacBook.",
      },
    ],
  }),
  component: ToolsPage,
});

type Tool = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  icon: string | null;
  image_url: string | null;
  download_url: string;
  version: string | null;
  platform: string | null;
};

// Map seed names → bundled AI images. Admin-uploaded image_url still wins.
const IMAGE_MAP: Record<string, string> = {
  "Windows 11": osWin11,
  "Windows 10": osWin10,
  WinPE: osWinpe,
  "macOS Tahoe": osTahoe,
  "macOS Sequoia": osSequoia,
  "macOS Sonoma": osSonoma,
  "macOS Monterey": osMonterey,
  "macOS Big Sur": osBigsur,
  "Ubuntu 24.04 LTS": osUbuntu24,
  "Ubuntu 22.04 LTS": osUbuntu22,
  "Hard Disk Sentinel": toolHdsentinel,
  CrystalDiskInfo: toolCrystaldiskinfo,
  CrystalDiskMark: toolCrystaldiskmark,
  "LCD Test (EIZO Monitor Test)": toolLcdtest,
  "Dead Pixel Test": toolDeadpixel,
  "Keyboard Tester": toolKeyboard,
  BatteryInfoView: toolBatteryinfo,
  coconutBattery: toolCoconut,
  HWiNFO: toolHwinfo,
  "CPU-Z": toolCpuz,
  "GPU-Z": toolGpuz,
  Rufus: toolRufus,
};

const SUBCAT_META: Record<
  string,
  { label: string; desc: string; icon: typeof Monitor }
> = {
  windows: {
    label: "Windows",
    desc: "Installer resmi Windows dari Microsoft.",
    icon: Monitor,
  },
  linux: {
    label: "Linux",
    desc: "Distribusi Linux populer untuk kebutuhan diagnostik.",
    icon: Terminal,
  },
  winpe: {
    label: "WinPE",
    desc: "Windows Preinstallation Environment untuk instalasi dan recovery.",
    icon: HardDrive,
  },
  macos: {
    label: "macOS",
    desc: "macOS installer resmi untuk berbagai versi.",
    icon: Apple,
  },
  storage: {
    label: "Storage Tools",
    desc: "Cek health & performa storage.",
    icon: HardDrive,
  },
  battery: {
    label: "Battery Tools",
    desc: "Cek kesehatan & kondisi baterai.",
    icon: Battery,
  },
  display: {
    label: "Display Tools",
    desc: "Uji layar & kualitas display.",
    icon: Monitor,
  },
  input: {
    label: "Input Tools",
    desc: "Pengujian input perangkat.",
    icon: Keyboard,
  },
  system: {
    label: "System Info",
    desc: "Info hardware & komponen sistem.",
    icon: Cpu,
  },
  utility: {
    label: "Utility",
    desc: "Tools pendukung instalasi & bootable.",
    icon: Wrench,
  },
};

const OS_ORDER = ["windows", "winpe", "macos", "linux"];
const TOOLS_ORDER = ["storage", "battery", "display", "input", "system", "utility"];

function ToolIcon({ name, className = "h-5 w-5" }: { name: string | null; className?: string }) {
  const Comp = (name && (Icons as any)[name]) || Wrench;
  return <Comp className={className} />;
}

function platformBadgeClass(platform: string | null | undefined) {
  switch (platform) {
    case "Windows":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "macOS":
      return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    case "Linux":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "WinPE":
      return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    case "Web":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/* ============ OS Card (large, wallpaper-style) ============ */
function OsCard({ t, i }: { t: Tool; i: number }) {
  const img = t.image_url || IMAGE_MAP[t.name];
  return (
    <Reveal delay={i * 40}>
      <a
        href={t.download_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] transition"
      >
        <div className="relative w-32 sm:w-40 shrink-0 overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={t.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/15 to-primary/5">
              <ToolIcon name={t.icon} className="h-10 w-10 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold leading-tight">{t.name}</h4>
            {t.version && (
              <span className="shrink-0 text-[10px] rounded bg-primary/10 text-primary px-1.5 py-0.5 font-mono">
                {t.version}
              </span>
            )}
          </div>
          {t.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {t.description}
            </p>
          )}
          <div className="mt-auto pt-3 flex items-center justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[120px]">
              {safeHost(t.download_url)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-primary-foreground font-medium group-hover:gap-2 transition-all">
              <Download className="h-3.5 w-3.5" />
              Download
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

/* ============ Tool Card (compact) ============ */
function ToolCard({ t, i }: { t: Tool; i: number }) {
  const img = t.image_url || IMAGE_MAP[t.name];
  return (
    <Reveal delay={i * 40}>
      <a
        href={t.download_url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] transition"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {img ? (
            <img
              src={img}
              alt={t.name}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/15 to-primary/5">
              <ToolIcon name={t.icon} className="h-10 w-10 text-primary" />
            </div>
          )}
          {t.platform && (
            <span
              className={`absolute top-2 right-2 text-[10px] uppercase tracking-wider rounded-md backdrop-blur px-2 py-0.5 border ${platformBadgeClass(
                t.platform,
              )}`}
            >
              {t.platform}
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <h4 className="text-sm font-semibold leading-tight line-clamp-1">{t.name}</h4>
          {t.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
              {t.description}
            </p>
          )}
          <div className="mt-auto pt-2 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground truncate max-w-[110px]">
              {safeHost(t.download_url)}
            </span>
            <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:gap-1.5 transition-all">
              <ExternalLink className="h-3 w-3" />
              Buka
            </span>
          </div>
        </div>
      </a>
    </Reveal>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : "https://" + url).host.replace(
      /^www\./,
      "",
    );
  } catch {
    return "";
  }
}

function ToolsPage() {
  const [osPlatform, setOsPlatform] = useState<string>("all");
  const [toolsPlatform, setToolsPlatform] = useState<string>("all");
  const [toolQuery, setToolQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["public-qc-tools"],
    queryFn: async () => {
      const { data } = await supabase
        .from("qc_tools")
        .select("*")
        .eq("is_published", true)
        .order("category")
        .order("sort_order");
      return (data ?? []) as Tool[];
    },
  });

  const osTools = useMemo(
    () => (data ?? []).filter((t) => t.category === "os"),
    [data],
  );
  const utilTools = useMemo(
    () => (data ?? []).filter((t) => t.category !== "os"),
    [data],
  );

  const osPlatforms = useMemo(() => {
    const set = new Set<string>();
    osTools.forEach((t) => t.subcategory && set.add(t.subcategory));
    return Array.from(set);
  }, [osTools]);

  const toolPlatforms = useMemo(() => {
    const set = new Set<string>();
    utilTools.forEach((t) => t.platform && set.add(t.platform));
    return Array.from(set);
  }, [utilTools]);

  const filteredOs = useMemo(
    () =>
      osTools.filter((t) =>
        osPlatform === "all" ? true : t.subcategory === osPlatform,
      ),
    [osTools, osPlatform],
  );

  const filteredTools = useMemo(() => {
    const q = toolQuery.trim().toLowerCase();
    return utilTools.filter((t) => {
      const matchP = toolsPlatform === "all" || t.platform === toolsPlatform;
      const text = `${t.name} ${t.description ?? ""} ${t.subcategory ?? ""}`.toLowerCase();
      const matchQ = !q || text.includes(q);
      return matchP && matchQ;
    });
  }, [utilTools, toolsPlatform, toolQuery]);

  const groupedOs = useMemo(() => groupBy(filteredOs, OS_ORDER), [filteredOs]);
  const groupedTools = useMemo(
    () => groupBy(filteredTools, TOOLS_ORDER),
    [filteredTools],
  );

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_25%_15%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(circle_at_85%_75%,hsl(var(--primary)/0.08),transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Resources
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mt-3">
              QC Tools &amp; <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Download Center
              </span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-lg">
              Pusat terpusat untuk installer Operating System, utilities, dan tools QC
              yang digunakan tim untuk pengecekan laptop, MacBook, PC desktop, dan unit
              sebelum proses QC.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl">
              {[
                { icon: Layers, t: "Tersusun Rapi", d: "Mudah dicari & dipakai" },
                { icon: Monitor, t: "Multi Platform", d: "Windows, macOS, Linux" },
                { icon: Download, t: "Siap Download", d: "Akses & temukannya" },
                { icon: CheckCircle2, t: "Dipakai Tim QC", d: "Tools relevan & praktis" },
              ].map((f) => (
                <div
                  key={f.t}
                  className="rounded-xl border border-border bg-card/70 backdrop-blur p-3"
                >
                  <f.icon className="h-4 w-4 text-primary" />
                  <div className="mt-1.5 text-xs font-semibold">{f.t}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">
                    {f.d}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative">
              <img
                src={heroTools}
                alt="QC Tools Library"
                width={1280}
                height={896}
                className="w-full h-auto rounded-2xl border border-border shadow-xl"
              />
              <div className="absolute -bottom-4 -left-4 hidden md:block rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold">{(data ?? []).length} tools</span>
                  <span className="text-muted-foreground">siap pakai</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ STATS STRIP ============ */}
      <section className="mx-auto max-w-6xl px-4 -mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Layers, t: "Subkategori OS", d: "Windows, WinPE, macOS, Linux" },
            { icon: Wrench, t: "Tools Lengkap", d: "Storage, battery, display, input, system info, utility" },
            { icon: Search, t: "Akses Cepat", d: "Cari dan filter sesuai kebutuhan Anda" },
            { icon: RefreshCw, t: "Update Berkala", d: "Tools relevan untuk operasional QC" },
          ].map((s) => (
            <div
              key={s.t}
              className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-semibold">{s.t}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ OS SECTION ============ */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
            <div className="flex items-center gap-3 flex-1">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">
                  Kategori Operating System
                </h2>
                <p className="text-xs text-muted-foreground">
                  Pilih dan download installer OS sesuai kebutuhan perangkat Anda.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-border bg-background">
              <FilterChip
                active={osPlatform === "all"}
                onClick={() => setOsPlatform("all")}
              >
                Semua OS
              </FilterChip>
              {osPlatforms.map((p) => (
                <FilterChip
                  key={p}
                  active={osPlatform === p}
                  onClick={() => setOsPlatform(p)}
                >
                  {SUBCAT_META[p]?.label ?? p}
                </FilterChip>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Memuat OS…
            </div>
          )}

          {!isLoading && filteredOs.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Tidak ada OS yang cocok.
            </div>
          )}

          <div className="space-y-8">
            {groupedOs.map(([sub, items]) => {
              const meta = SUBCAT_META[sub];
              const Icon = meta?.icon ?? Monitor;
              return (
                <div key={sub}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{meta?.label ?? sub}</h3>
                    <span className="text-xs text-muted-foreground">
                      {meta?.desc}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-3">
                    {items.map((t, i) => (
                      <OsCard key={t.id} t={t} i={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ TOOLS SECTION ============ */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
            <div className="flex items-center gap-3 flex-1">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">Kategori Tools QC</h2>
                <p className="text-xs text-muted-foreground">
                  Utilities &amp; tools yang digunakan tim QC untuk pengecekan dan
                  troubleshooting.
                </p>
              </div>
            </div>

            <div className="flex flex-1 md:flex-none gap-2 items-center">
              <div className="relative flex-1 md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={toolQuery}
                  onChange={(e) => setToolQuery(e.target.value)}
                  placeholder="Cari tools…"
                  className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <select
                value={toolsPlatform}
                onChange={(e) => setToolsPlatform(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="all">Semua Platform</option>
                {toolPlatforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!isLoading && filteredTools.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Tidak ada tools yang cocok dengan pencarian.
            </div>
          )}

          <div className="space-y-8">
            {groupedTools.map(([sub, items]) => {
              const meta = SUBCAT_META[sub];
              const Icon = meta?.icon ?? Wrench;
              return (
                <div key={sub}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">{meta?.label ?? sub}</h3>
                    <span className="text-xs text-muted-foreground">
                      {meta?.desc}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map((t, i) => (
                      <ToolCard key={t.id} t={t} i={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ QUICK + GUIDE ============ */}
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Paling Sering Dipakai</h3>
              <span className="text-xs text-muted-foreground">
                Akses cepat tools yang paling sering digunakan tim QC.
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: HardDrive, t: "Cek SSD", d: "Storage Health" },
                { icon: Battery, t: "Cek Battery", d: "Battery Health" },
                { icon: Download, t: "Install OS", d: "Installer OS" },
                { icon: Monitor, t: "Cek Display", d: "Pixel & Screen" },
              ].map((q) => (
                <div
                  key={q.t}
                  className="rounded-xl border border-border bg-background p-3 hover:border-primary/40 hover:-translate-y-0.5 transition"
                >
                  <q.icon className="h-5 w-5 text-primary" />
                  <div className="mt-2 text-sm font-semibold">{q.t}</div>
                  <div className="text-[11px] text-muted-foreground">{q.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Panduan Penggunaan</h3>
            </div>
            <p className="text-xs text-muted-foreground flex-1">
              Semua tools idealnya dikerjakan sesuai SOP &amp; Prosedur QC agar proses
              pengecekan tetap akurat dan konsisten.
            </p>
            <Link
              to="/prosedur"
              className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:gap-2 transition-all"
            >
              Buka Prosedur QC <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-6 md:p-10 order-2 md:order-1">
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                Siapkan tools QC dalam satu tempat
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Download dan akses cepat semua tools yang digunakan dalam proses QC
                harian. Hemat waktu, kerja lebih efisien.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/prosedur"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:gap-2 transition-all"
                >
                  Buka Prosedur QC <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/knowledge"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:border-primary/50 transition"
                >
                  Lihat Knowledge <BookOpen className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="order-1 md:order-2 relative h-44 md:h-full min-h-[180px]">
              <img
                src={ctaToolbox}
                alt="Toolbox"
                width={1024}
                height={640}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function groupBy(items: Tool[], order: string[]) {
  const map = new Map<string, Tool[]>();
  for (const t of items) {
    const key = t.subcategory || t.category;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  // Apply preferred ordering
  const ordered: [string, Tool[]][] = [];
  for (const k of order) {
    if (map.has(k)) {
      ordered.push([k, map.get(k)!]);
      map.delete(k);
    }
  }
  // Append any extras
  for (const [k, v] of map.entries()) ordered.push([k, v]);
  return ordered;
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
