import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Wrench, Monitor, Keyboard, Battery, HardDrive, Cable,
  Speaker, Wifi, MousePointer2, Activity, ShieldCheck, ArrowRight,
  BookOpen, GraduationCap, ListChecks, Layers, Gauge, BadgeCheck,
  CheckCircle2, AlertTriangle, XCircle, type LucideIcon,
} from "lucide-react";
import { Container, PageHero, StatusBadge } from "../components/site/page-hero";
import secSop from "@/assets/sec-sop.jpg";
import sopFisik from "@/assets/sop/fisik.jpg";
import sopLcd from "@/assets/sop/lcd.jpg";
import sopKeyboard from "@/assets/sop/keyboard.jpg";
import sopBattery from "@/assets/sop/battery.jpg";
import sopStorage from "@/assets/sop/storage.jpg";
import sopPort from "@/assets/sop/port.jpg";
import sopAudio from "@/assets/sop/audio.jpg";
import sopWifi from "@/assets/sop/wifi.jpg";
import sopTouchpad from "@/assets/sop/touchpad.jpg";
import sopBenchmark from "@/assets/sop/benchmark.jpg";
import sopSecurity from "@/assets/sop/security.jpg";

type SopMeta = { icon: LucideIcon; tint: string; image: string; bullets: string[] };

export const SOP_META: Record<string, SopMeta> = {
  fisik:     { icon: Wrench,       tint: "from-sky-100 to-blue-200 text-sky-700",          image: sopFisik,     bullets: ["Body, engsel & sekrup", "Sticker, garskin & segel", "Charger original/kompatibel"] },
  lcd:       { icon: Monitor,      tint: "from-fuchsia-100 to-pink-200 text-fuchsia-700",  image: sopLcd,       bullets: ["Tes 5 warna dasar", "Dead pixel & flicker", "Backlight bleeding"] },
  keyboard:  { icon: Keyboard,     tint: "from-slate-100 to-zinc-200 text-slate-700",      image: sopKeyboard,  bullets: ["Tes semua tombol", "Double input & ghost", "Backlight & function"] },
  battery:   { icon: Battery,      tint: "from-lime-100 to-emerald-200 text-emerald-700",  image: sopBattery,   bullets: ["Full charge / design", "Cycle count & drop", "Kondisi fisik baterai"] },
  storage:   { icon: HardDrive,    tint: "from-blue-100 to-indigo-200 text-blue-700",      image: sopStorage,   bullets: ["Health & bad sector", "TBW & power on hours", "Speed & suhu drive"] },
  port:      { icon: Cable,        tint: "from-violet-100 to-purple-200 text-violet-700",  image: sopPort,      bullets: ["USB-A & USB-C", "HDMI, VGA, LAN", "Audio jack & SD card"] },
  audio:     { icon: Speaker,      tint: "from-orange-100 to-red-200 text-orange-700",     image: sopAudio,     bullets: ["Speaker kiri & kanan", "Mic internal", "Webcam & rekam"] },
  wifi:      { icon: Wifi,         tint: "from-cyan-100 to-sky-200 text-cyan-700",         image: sopWifi,      bullets: ["Deteksi & stabilitas WiFi", "Pairing Bluetooth", "Transfer data BT"] },
  touchpad:  { icon: MousePointer2,tint: "from-teal-100 to-cyan-200 text-teal-700",        image: sopTouchpad,  bullets: ["Klik, drag & scroll", "Multi-touch gesture", "Kalibrasi touchscreen"] },
  benchmark: { icon: Activity,     tint: "from-red-100 to-orange-200 text-red-700",        image: sopBenchmark, bullets: ["Cinebench & FurMark", "Suhu & throttling", "Running test stabil"] },
  security:  { icon: ShieldCheck,  tint: "from-amber-100 to-orange-200 text-amber-700",    image: sopSecurity,  bullets: ["Status Computrace", "Supervisor password", "Secure boot & TPM"] },
};

export const Route = createFileRoute("/sop")({
  head: () => ({
    meta: [
      { title: "SOP QC — Ryota QC" },
      { name: "description", content: "Standar operasional prosedur pengecekan QC laptop berdasarkan kategori komponen." },
      { property: "og:title", content: "SOP QC — Ryota QC" },
      { property: "og:description", content: "11 kategori SOP QC laptop." },
      { property: "og:image", content: secSop },
    ],
  }),
  component: SopIndex,
});

type DbSop = {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  featured_image: string | null;
};

const stats = [
  { icon: ListChecks, label: "Kategori SOP", value: "11", desc: "Cakupan menyeluruh tiap komponen utama unit." },
  { icon: Layers, label: "Standar Terstruktur", value: "Konsisten", desc: "Format pengecekan seragam di setiap kategori." },
  { icon: Gauge, label: "Detail & Spesifik", value: "100%", desc: "Setiap kategori dijabarkan secara rinci." },
  { icon: BadgeCheck, label: "Status Keputusan", value: "Lolos · Minus · Retur", desc: "Tiga jalur penilaian per kategori SOP." },
];

function SopCard({ item }: { item: DbSop }) {
  const meta = SOP_META[item.slug];
  const Icon = meta?.icon ?? Wrench;
  const tint = meta?.tint ?? "from-sky-100 to-blue-200 text-sky-700";
  const img = item.featured_image || meta?.image;
  return (
    <Link
      to="/sop/$kategori"
      params={{ kategori: item.slug }}
      target="_blank"
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className={`relative aspect-[16/9] bg-gradient-to-br ${tint} overflow-hidden`}>
        {img && (
          <img src={img} alt={item.title} loading="lazy" width={896} height={512}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/85 backdrop-blur px-3 py-1 text-[11px] font-semibold text-foreground/80 ring-1 ring-black/5">SOP</span>
        <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur shadow ring-1 ring-black/5">
          <Icon className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold leading-snug">{item.title}</h3>
        {item.content && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.content}</p>}
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {(meta?.bullets ?? []).map((b) => (
            <li key={b} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Buka SOP <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

const statuses = [
  { kind: "lolos" as const, icon: CheckCircle2, title: "Lolos", desc: "Memenuhi seluruh standar SOP, fungsi normal, aman untuk dijual." },
  { kind: "minus" as const, icon: AlertTriangle, title: "Minus", desc: "Ada kekurangan ringan, perlu disampaikan transparan ke customer." },
  { kind: "retur" as const, icon: XCircle, title: "Retur", desc: "Tidak memenuhi standar, wajib dikembalikan atau ditolak." },
];

function SopIndex() {
  const { data: rows, isLoading } = useQuery({
    queryKey: ["public-sop-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sop_items")
        .select("id,slug,title,content,featured_image")
        .eq("status", "published")
        .order("title");
      return (data ?? []) as DbSop[];
    },
  });

  // Order by known slug order, then any extras alphabetically
  const ORDER = ["fisik","lcd","keyboard","battery","storage","port","audio","wifi","touchpad","benchmark","security"];
  const sorted = (rows ?? []).slice().sort((a, b) => {
    const ia = ORDER.indexOf(a.slug); const ib = ORDER.indexOf(b.slug);
    if (ia === -1 && ib === -1) return a.title.localeCompare(b.title);
    if (ia === -1) return 1; if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <div>
      <PageHero
        eyebrow="SOP QC"
        title={<>Standar Operasional<br className="hidden sm:block" /> Quality Control Laptop</>}
        desc="Setiap kategori berisi standar pengecekan detail agar tim QC bekerja konsisten — mulai fisik, layar, baterai, storage hingga keamanan BIOS."
        image={secSop}
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="lolos">Lolos</StatusBadge>
          <StatusBadge kind="minus">Minus</StatusBadge>
          <StatusBadge kind="retur">Retur</StatusBadge>
        </div>
      </PageHero>

      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <s.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm font-medium">{s.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-3xl border border-border bg-card/40 p-5 sm:p-7">
          <div className="mb-5 flex items-baseline gap-3">
            <span className="text-sm font-semibold text-primary">Daftar SOP</span>
            <span className="h-px flex-1 bg-border" />
            <h2 className="font-display text-base sm:text-lg font-semibold">{sorted.length} Kategori Komponen</h2>
          </div>
          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Memuat SOP…</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sorted.map((item) => <SopCard key={item.id} item={item} />)}
            </div>
          )}
        </section>

        <div className="mt-16 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Tiga Jalur Keputusan SOP</h2>
          <p className="mt-2 text-muted-foreground">Setiap kategori SOP memiliki tiga kemungkinan hasil penilaian.</p>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {statuses.map((st) => (
              <div key={st.title} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <st.icon className="h-5 w-5 text-primary" />
                  <StatusBadge kind={st.kind}>{st.title}</StatusBadge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Lanjutkan Pembelajaran SOP</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Perdalam pemahamanmu dengan Knowledge Center atau uji penguasaanmu lewat Quiz QC.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/knowledge" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold transition hover:shadow-md hover:-translate-y-0.5">
                <BookOpen className="h-4 w-4" /> Knowledge Center
              </Link>
              <Link to="/quiz" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:shadow-lg hover:-translate-y-0.5">
                <GraduationCap className="h-4 w-4" /> Mulai Quiz QC <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
