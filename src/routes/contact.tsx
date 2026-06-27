import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import {
  Mail,
  MessageSquare,
  Bug,
  Lightbulb,
  Instagram,
  Send,
  Sparkles,
  Info,
  User2,
  Star,
  Phone,
} from "lucide-react";
import { Container, PageHero } from "../components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import secContact from "@/assets/sec-contact.jpg";

const DEV_EMAIL = "ilhamryota28@gmail.com";
const DEV_WA = "6289699068235";
const DEV_IG = "ilhamryota23";
const APP_VERSION = "RyotaQC V1.0.01";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Developer — Ryota QC" },
      {
        name: "description",
        content:
          "Kirim saran, laporan bug, atau request fitur untuk pengembangan Ryota QC. Hubungi developer via Email, WhatsApp, atau Instagram.",
      },
      { property: "og:title", content: "Contact Developer — Ryota QC" },
      { property: "og:description", content: "Form saran, bug, & request fitur Ryota QC." },
    ],
  }),
  component: Contact,
});

const types = [
  { id: "saran", label: "Saran", icon: Lightbulb },
  { id: "bug", label: "Laporan Bug", icon: Bug },
  { id: "fitur", label: "Request Fitur", icon: Star },
] as const;

type TypeId = (typeof types)[number]["id"];

const CONTACTS = [
  {
    icon: Mail,
    label: "Email",
    value: DEV_EMAIL,
    href: `mailto:${DEV_EMAIL}`,
    tone: "bg-blue-500",
  },
  {
    icon: Phone,
    label: "Whatsapp",
    value: "+" + DEV_WA,
    href: `https://wa.me/${DEV_WA}`,
    tone: "bg-green-500",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: DEV_IG,
    href: `https://instagram.com/${DEV_IG}`,
    tone: "bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400",
  },
  {
    icon: Info,
    label: "Versi",
    value: APP_VERSION,
    href: null,
    tone: "bg-blue-500",
  },
];

function Contact() {
  const [type, setType] = useState<TypeId>("saran");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [subjek, setSubjek] = useState("");
  const [pesan, setPesan] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const typeLabel = types.find((t) => t.id === type)?.label ?? "Saran";
    const subject = `[${typeLabel}] ${subjek || "Tanpa Subjek"}`;
    const body = [
      `Tipe: ${typeLabel}`,
      `Nama: ${nama}`,
      `Email: ${email}`,
      `Subjek: ${subjek}`,
      "",
      "Pesan:",
      pesan,
      "",
      "---",
      "Dikirim dari halaman Contact RyotaQC.",
    ].join("\n");
    const url = `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div>
      <PageHero
        eyebrow="CONTACT"
        title={
          <>
            Contact <span className="tech-gradient-text">Developer</span>
          </>
        }
        desc="Punya masukan atau butuh bantuan? Kirim saran, laporan bug, atau request fitur agar RyotaQC terus berkembang."
      >
        <div className="mt-6 grid md:grid-cols-2 gap-6 items-center">
          <div />
          <Reveal className="hidden md:block">
            <img
              src={secContact}
              alt="Contact developer illustration"
              width={1280}
              height={800}
              loading="lazy"
              className="w-full max-w-md ml-auto h-auto"
            />
          </Reveal>
        </div>
      </PageHero>

      <Container>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Informasi Kontak */}
          <Reveal>
            <div className="rounded-2xl border border-border bg-card/60 p-5 h-full">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <User2 className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold">Informasi Kontak</h2>
              </div>

              <div className="mt-4 space-y-3">
                {CONTACTS.map((c) => {
                  const inner = (
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 group-hover:border-primary/50 transition">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl text-white ${c.tone}`}>
                        <c.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{c.label}</div>
                        <div className="text-sm font-semibold truncate">{c.value}</div>
                      </div>
                    </div>
                  );
                  return c.href ? (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.href.startsWith("http") ? "_blank" : undefined}
                      rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group block"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={c.label} className="group">
                      {inner}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
                <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Terima kasih telah membantu kami meningkatkan RyotaQC menjadi lebih baik!
                </span>
              </div>
            </div>
          </Reveal>

          {/* Kirim Pesan */}
          <Reveal className="lg:col-span-2" delay={100}>
            <div className="rounded-2xl border border-border bg-card/60 p-5 md:p-6">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Send className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold">Kirim Pesan</h2>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {types.map((t) => {
                  const active = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background/40 hover:border-primary/40"
                      }`}
                    >
                      <t.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Nama">
                    <input
                      required
                      maxLength={100}
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      required
                      type="email"
                      maxLength={255}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat email Anda"
                      className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </Field>
                </div>
                <Field label="Subjek">
                  <input
                    required
                    maxLength={150}
                    value={subjek}
                    onChange={(e) => setSubjek(e.target.value)}
                    placeholder="Tulis subjek pesan Anda"
                    className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Pesan">
                  <textarea
                    required
                    maxLength={2000}
                    rows={6}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Tulis pesan Anda di sini..."
                    className="w-full resize-y rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </Field>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
                  >
                    <Send className="h-4 w-4" /> Kirim Pesan
                  </button>
                  {sent && (
                    <span className="inline-flex items-center gap-2 text-xs text-primary">
                      <Sparkles className="h-4 w-4" /> Email client dibuka — kirim untuk mengirim ke
                      developer.
                    </span>
                  )}
                  <a
                    href={`https://wa.me/${DEV_WA}?text=${encodeURIComponent(
                      `[${types.find((t) => t.id === type)?.label}] ${subjek}\n\n${pesan}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold hover:border-primary/50"
                  >
                    <MessageSquare className="h-4 w-4" /> Kirim via WhatsApp
                  </a>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground/80">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
