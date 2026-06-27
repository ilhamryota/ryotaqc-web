import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User2,
  Zap,
  BookOpen,
  Wrench,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  PencilLine,
  Brain,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Container, PageHero } from "../components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { handleAIChat } from "@/lib/ai/chat.functions";
import heroAi from "@/assets/sec-ai-hero.jpg";
import sopFisik from "@/assets/sop/fisik.jpg";
import sopLcd from "@/assets/sop/lcd.jpg";
import sopBattery from "@/assets/sop/battery.jpg";
import sopKeyboard from "@/assets/sop/keyboard.jpg";
import sopSecurity from "@/assets/sop/security.jpg";
import sopBenchmark from "@/assets/sop/benchmark.jpg";

type SearchParams = { q?: string };

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "RyotaQC AI Assistant" },
      {
        name: "description",
        content:
          "Tanya jawab AI seputar SOP QC, troubleshooting, knowledge laptop, software, hardware, dan prosedur pengecekan unit.",
      },
      { property: "og:title", content: "RyotaQC AI Assistant" },
      { property: "og:description", content: "Asisten AI Quality Control laptop & MacBook." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: AiPage,
});

const SUGGEST = [
  "Bagaimana cara cek battery health?",
  "Apa bedanya SSD SATA dan NVMe?",
  "Apa itu Computrace?",
  "Cara cek keyboard laptop?",
  "Laptop overheat masuk kategori retur atau perbaikan?",
];

const FEATURES = [
  { icon: Zap, title: "Jawaban Cepat", desc: "Respon ringkas dalam hitungan detik." },
  { icon: BookOpen, title: "Referensi SOP", desc: "Berbasis SOP resmi RyotaQC." },
  { icon: Wrench, title: "Troubleshooting Pintar", desc: "Bantu diagnosa masalah unit." },
  { icon: BarChart3, title: "Analisis Masalah", desc: "Klasifikasi minus / retur / perbaikan." },
];

const TOPICS = ["Battery Health", "SSD NVMe", "Overheat", "OS Update", "Retur Unit"];

const CATEGORIES = [
  { title: "SOP & Standar QC", desc: "Panduan SOP, checklist, dan standar QC unit.", img: sopFisik, to: "/sop" },
  { title: "Troubleshooting Laptop", desc: "Solusi masalah umum pada laptop dengan cepat.", img: sopBenchmark, to: "/maintenance" },
  { title: "Storage & Battery", desc: "Informasi SSD, HDD, dan battery laptop.", img: sopBattery, to: "/informasi" },
  { title: "LCD Keyboard & Port", desc: "Masalah layar, keyboard, dan port konektor.", img: sopLcd, to: "/sop" },
  { title: "OS Driver & Software", desc: "Driver, software, dan pengaturan sistem laptop.", img: sopKeyboard, to: "/informasi" },
  { title: "Retur & Perbaikan", desc: "Kriteria retur, perbaikan, dan penanganan unit.", img: sopSecurity, to: "/prosedur" },
];

const STEPS = [
  { n: 1, icon: PencilLine, title: "Tulis Pertanyaan", desc: "Ketik pertanyaan seputar SOP QC, troubleshooting, atau masalah unit." },
  { n: 2, icon: Brain, title: "AI Menganalisis", desc: "AI menganalisis pertanyaan dan mencari jawaban dari sumber resmi." },
  { n: 3, icon: CheckCircle2, title: "Dapatkan Jawaban", desc: "Dapatkan jawaban akurat lengkap dengan referensi sumber terkait." },
];

type Msg = { id: string; role: "user" | "assistant"; content: string };

function AiPage() {
  const { q: initialQ } = Route.useSearch();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [placeholder, setPlaceholder] = useState("Tulis pertanyaan untuk RyotaQC AI…");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (!pending) taRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (initialQ && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  useEffect(() => {
    const placeholders = [
      "Tulis pertanyaan untuk RyotaQC AI…",
      "Contoh: Bagaimana cara cek battery health?",
      "Contoh: Spek Lengkap Lenovo ThinkPad L13 Yoga i5-11 8/512",
      "Contoh: Apa bedanya SSD SATA dan NVMe?",
      "Contoh: Cara troubleshooting laptop overheat?",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % placeholders.length;
      setPlaceholder(placeholders[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    try {
      // Call real AI server function
      const response = await handleAIChat({
        data: {
          message: text,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        },
      });

      let aiContent: string;
      if (response.success && response.reply) {
        aiContent = response.reply;
      } else {
        aiContent = "Maaf, saya mengalami kesulitan memproses permintaan Anda. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.";
        console.error("AI Error:", response.error);
      }

      const aiMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: aiContent };
      setMessages((m) => [...m, aiMsg]);
    } catch (error) {
      console.error("Failed to send AI chat:", error);
      const errorMsg: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Terjadi kesalahan saat menghubungi AI. Pastikan konfigurasi AI sudah benar.",
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div>
      <PageHero
        eyebrow="RYOTAQC AI"
        title={
          <>
            RyotaQC <span className="tech-gradient-text">AI Assistant</span>
          </>
        }
        desc="Tanya seputar SOP QC, troubleshooting, knowledge laptop, software, hardware, dan prosedur pengecekan unit."
      >
        <div className="mt-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur hover:border-primary/40 transition"
                >
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                    <f.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <Reveal className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-border bg-card/40 shadow-lg">
              <img
                src={heroAi}
                alt="RyotaQC AI Assistant illustration"
                width={1280}
                height={960}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -left-3 top-6 hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/90 backdrop-blur px-3 py-2 text-xs font-semibold shadow">
              <BookOpen className="h-4 w-4 text-primary" /> SOP Referensi
            </div>
            <div className="absolute -right-3 bottom-8 hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card/90 backdrop-blur px-3 py-2 text-xs font-semibold shadow">
              <BarChart3 className="h-4 w-4 text-primary" /> Analisis Masalah
            </div>
          </Reveal>
        </div>
      </PageHero>

      {/* Chat + Preview */}
      <Container>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mulai percakapan */}
          <Reveal>
            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold">Mulai percakapan</h2>
              </div>

              <form onSubmit={onSubmit} className="mt-4">
                <div className="rounded-xl border border-border bg-background/60 p-2 flex items-end gap-2">
                  <textarea
                    ref={taRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder={placeholder}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={pending || !input.trim()}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
                    aria-label="Kirim"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="text-sm font-semibold mb-3">Contoh pertanyaan</div>
                <div className="space-y-2">
                  {SUGGEST.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="w-full text-left flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm hover:border-primary/50 hover:text-primary transition"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid sm:grid-cols-2 gap-4 pt-6 border-t border-border">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Sumber Jawaban
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Berdasarkan SOP & Knowledge resmi RyotaQC.
                  </p>
                  <Link to="/sop" className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Lihat daftar sumber <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="h-4 w-4 text-primary" /> Topik Populer
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        onClick={() => send("Jelaskan tentang " + t)}
                        className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Preview percakapan */}
          <Reveal delay={100}>
            <div className="rounded-2xl border border-border bg-card/60 p-6 h-full flex flex-col">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-semibold">Preview percakapan</h2>
              </div>

              <div className="mt-4 flex-1 space-y-4 overflow-y-auto max-h-[520px] pr-1">
                {messages.length === 0 && (
                  <>
                    <PreviewBubble role="user" text="Bagaimana cara cek battery health?" />
                    <PreviewBubble
                      role="assistant"
                      text={
                        <div className="space-y-2">
                          <div>Berikut cara cek battery health di laptop Windows:</div>
                          <ol className="list-decimal pl-5 space-y-1 text-xs">
                            <li>Buka Command Prompt (Admin)</li>
                            <li>
                              Ketik perintah:{" "}
                              <code className="rounded bg-primary/15 text-primary px-1.5 py-0.5">
                                powercfg /batteryreport
                              </code>
                            </li>
                            <li>Laporan tersimpan di folder user dalam format HTML</li>
                            <li>Buka battery-report.html untuk melihat kapasitas dan health</li>
                          </ol>
                          <div className="text-[11px] text-muted-foreground pt-1">
                            Sumber: SOP Battery Check – SOP.BAT.001
                          </div>
                        </div>
                      }
                    />
                  </>
                )}
                {messages.map((m) => (
                  <PreviewBubble key={m.id} role={m.role} text={m.content} />
                ))}
                {pending && (
                  <div className="flex gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.1s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Bisa Tanya Apa Saja */}
      <section className="border-t border-border bg-muted/30">
        <Container>
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold">Bisa Tanya Apa Saja?</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Temukan solusi cepat untuk berbagai topik QC yang sering dibutuhkan.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <Link
                  to={c.to}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold leading-tight">{c.title}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{c.desc}</div>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Cara Kerja AI */}
      <Container>
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold">Cara Kerja AI</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Proses sederhana untuk mendapatkan jawaban akurat.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid md:grid-cols-3 gap-4 relative">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="relative rounded-2xl border border-border bg-card/60 p-6 h-full">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">
                    {s.n}. {s.title}
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 text-primary/40">→</div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* CTA */}
      <section className="pb-16">
        <Container className="py-0">
          <Reveal>
            <div className="rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 md:p-10 grid md:grid-cols-2 gap-6 items-center">
              <div className="flex items-center justify-center">
                <img
                  src="/logo-rq.png"
                  alt="RyotaQC Logo"
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="w-full max-w-xs h-auto drop-shadow-xl animate-float-slow"
                />
              </div>
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold">Siap Gunakan RyotaQC AI?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ajukan pertanyaan apa saja dan dapatkan jawaban cepat dari asisten AI terpercaya
                  RyotaQC.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => taRef.current?.focus()}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90"
                  >
                    Mulai Tanya Sekarang <Send className="h-4 w-4" />
                  </button>
                  <Link
                    to="/knowledge"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:border-primary/50"
                  >
                    Lihat Knowledge Center <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}

function PreviewBubble({
  role,
  text,
}: {
  role: "user" | "assistant";
  text: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`grid h-8 w-8 place-items-center rounded-xl shrink-0 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
        }`}
      >
        {isUser ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-background/60"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
