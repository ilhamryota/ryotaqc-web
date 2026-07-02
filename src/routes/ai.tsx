import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, Sparkles, User2, Loader2 } from "lucide-react";
import { handleAIChat } from "@/lib/ai/chat.functions";
import { MarkdownRenderer } from "@/components/site/markdown-renderer";

type SearchParams = { q?: string };

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "RyotaQC AI Assistant" },
      {
        name: "description",
        content: "Tanya jawab AI seputar SOP QC, troubleshooting, knowledge laptop, software, hardware, dan prosedur pengecekan unit.",
      },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  component: AiPage,
});

const SUGGESTIONS = [
  { icon: "🔋", text: "Bagaimana cara cek battery health?" },
  { icon: "💾", text: "Apa bedanya SSD SATA dan NVMe?" },
  { icon: "🛡️", text: "Apa itu Computrace?" },
  { icon: "⌨️", text: "Cara cek keyboard laptop?" },
  { icon: "🔥", text: "Laptop overheat masuk kategori retur atau perbaikan?" },
  { icon: "💻", text: "Spek Lengkap Lenovo ThinkPad L13 Yoga i5-11 8/512" },
];

type Msg = { id: string; role: "user" | "assistant"; content: string };

function AiPage() {
  const { q: initialQ } = Route.useSearch();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, pending]);

  useEffect(() => {
    if (!pending) taRef.current?.focus();
  }, [pending]);

  useEffect(() => {
    if (initialQ && !sentInitial.current) {
      sentInitial.current = true;
      send(initialQ);
    }
  }, [initialQ]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);

    if (taRef.current) {
      taRef.current.style.height = "auto";
    }

    try {
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
        const errDetail = response.error || "Unknown error";
        console.error("[AI] Error:", errDetail);
        aiContent = `**Maaf, terjadi kesalahan:**\n\n\`${errDetail}\``;
      }

      const aiMsg: Msg = { id: crypto.randomUUID(), role: "assistant", content: aiContent };
      setMessages((m) => [...m, aiMsg]);
    } catch {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-7.5rem)]">
      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={send} />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}
            {pending && <TypingIndicator />}
            <div ref={endRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={onSubmit} className="relative">
            <div className="flex items-end gap-3 rounded-2xl border border-border bg-card shadow-sm px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              <textarea
                ref={taRef}
                rows={1}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pertanyaan untuk RyotaQC AI..."
                disabled={pending}
                className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground max-h-40 leading-relaxed disabled:opacity-50"
                style={{ minHeight: "24px" }}
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-opacity"
                aria-label="Kirim"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </form>
          <p className="text-[11px] text-muted-foreground text-center mt-2.5">
            RyotaQC AI dapat membuat kesalahan. Verifikasi informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 grid place-items-center mb-6">
        <Bot className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-foreground text-center">
        RyotaQC AI Assistant
      </h1>
      <p className="mt-3 text-sm text-muted-foreground text-center max-w-md">
        Tanya seputar SOP QC, troubleshooting, spesifikasi laptop, dan prosedur pengecekan unit.
      </p>

      <div className="mt-10 w-full max-w-2xl">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
          Bisa tanya apa saja
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.text}
              onClick={() => onSuggestionClick(s.text)}
              className="flex items-start gap-3 rounded-xl border border-border bg-card/60 px-4 py-3.5 text-left text-sm hover:border-primary/40 hover:bg-card transition-all group"
            >
              <span className="text-base shrink-0 mt-0.5">{s.icon}</span>
              <span className="text-foreground/80 group-hover:text-foreground transition-colors leading-relaxed">
                {s.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
          <Bot className="h-4 w-4" />
        </div>
      )}
      <div className={`max-w-[85%] sm:max-w-[75%] ${isUser ? "order-first" : ""}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed">
            {msg.content}
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3 text-sm leading-relaxed">
            <MarkdownRenderer content={msg.content} />
          </div>
        )}
      </div>
      {isUser && (
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
          <User2 className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-card border border-border/50 px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
        </div>
      </div>
    </div>
  );
}
