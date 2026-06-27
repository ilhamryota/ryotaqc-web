import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Container, PageHero } from "../components/site/page-hero";
import { QUIZ_LEVELS } from "./quiz";

type DbQuiz = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
};

type Q = {
  id: string;
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

function shuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed + 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const Route = createFileRoute("/quiz/$level")({
  head: ({ params }) => {
    const l = QUIZ_LEVELS.find((x) => x.slug === params.level);
    const t = l ? `${l.title} — Ryota QC` : "Quiz";
    return {
      meta: [
        { title: t },
        { name: "description", content: l?.desc ?? "Quiz QC" },
        { property: "og:title", content: t },
        { property: "og:description", content: l?.desc ?? "Quiz QC" },
      ],
    };
  },
  loader: ({ params }) => {
    if (!QUIZ_LEVELS.find((l) => l.slug === params.level)) throw notFound();
    return null;
  },
  component: QuizPlay,
});

function QuizPlay() {
  const { level } = Route.useParams();
  const meta = QUIZ_LEVELS.find((x) => x.slug === level)!;

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["public-quiz", level],
    queryFn: async () => {
      const { data } = await supabase
        .from("quiz_questions")
        .select("id,question,option_a,option_b,option_c,option_d,correct_answer,explanation")
        .eq("status", "published")
        .eq("level", level as "dasar" | "menengah" | "lanjutan" | "tinggi");
      return (data ?? []) as DbQuiz[];
    },
    staleTime: 60_000,
  });

  const [seed, setSeed] = useState(0);
  const questions: Q[] = useMemo(() => {
    const mapped = rows.map((r) => ({
      id: r.id,
      q: r.question,
      options: [r.option_a, r.option_b, r.option_c, r.option_d],
      answer: { A: 0, B: 1, C: 2, D: 3 }[r.correct_answer.toUpperCase()] ?? 0,
      explanation: r.explanation ?? "",
    }));
    return shuffle(mapped, seed);
  }, [rows, seed]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[idx];
  const progress = total ? ((idx + (picked !== null ? 1 : 0)) / total) * 100 : 0;
  const score = answers.reduce((acc, a, i) => acc + (a === questions[i]?.answer ? 1 : 0), 0);
  const pct = done && total ? Math.round((score / total) * 100) : 0;

  const next = () => {
    if (picked === null) return;
    setAnswers([...answers, picked]);
    setPicked(null);
    if (idx + 1 >= total) setDone(true);
    else setIdx(idx + 1);
  };

  const reset = () => {
    setSeed((s) => s + 1);
    setIdx(0); setPicked(null); setAnswers([]); setDone(false);
  };

  return (
    <div>
      <PageHero
        eyebrow="Quiz"
        title={meta.title}
        desc={`${meta.desc} · ${total} soal`}
      >
        <Link to="/quiz" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke daftar quiz
        </Link>
      </PageHero>

      <Container className="max-w-3xl">
        {isLoading && (
          <div className="rounded-2xl border border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
            Memuat soal…
          </div>
        )}

        {!isLoading && total === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
            <div className="font-semibold">Belum ada soal pada level ini.</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Tim editor dapat menambahkan soal melalui Admin Panel.
            </p>
            <Link to="/quiz" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:border-primary/50">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </div>
        )}

        {!isLoading && total > 0 && !done && q && (
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Soal {idx + 1} / {total}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>

            <h2 className="mt-6 text-lg md:text-xl font-semibold">{q.q}</h2>

            <div className="mt-5 grid gap-2">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                return (
                  <button
                    key={i}
                    onClick={() => setPicked(i)}
                    className={`text-left rounded-xl border px-4 py-3 text-sm transition ${
                      isPicked
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:border-primary/40 hover:bg-accent/40"
                    }`}
                  >
                    <span className="mr-2 font-semibold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={next}
                disabled={picked === null}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {idx + 1 === total ? "Selesai" : "Berikutnya"}
              </button>
            </div>
          </div>
        )}

        {done && (
          <div>
            <div className="rounded-2xl glow-border bg-card/60 p-8 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Trophy className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-bold">Hasil Quiz</h2>
              <p className="mt-1 text-muted-foreground">Kamu menjawab benar {score} dari {total} soal.</p>
              <div className="mt-4 text-5xl font-display font-bold tech-gradient-text">{pct}%</div>
              <div className="mt-2 text-sm">
                {pct >= 80 ? "🎉 Lulus dengan baik!" : pct >= 60 ? "👍 Cukup, perlu sedikit pendalaman." : "📚 Pelajari ulang materinya, semangat!"}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  <RotateCcw className="h-4 w-4" /> Ulangi
                </button>
                <Link to="/quiz" className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:border-primary/50">
                  Ganti Level
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold">Pembahasan Jawaban</h3>
              <div className="mt-3 space-y-3">
                {questions.map((qq, i) => {
                  const ok = answers[i] === qq.answer;
                  return (
                    <div key={qq.id} className="rounded-xl border border-border bg-card/60 p-4 text-sm">
                      <div className="flex items-start gap-2">
                        {ok ? <CheckCircle2 className="h-4 w-4 text-success mt-0.5" /> : <XCircle className="h-4 w-4 text-danger mt-0.5" />}
                        <div className="flex-1">
                          <div className="font-medium">{i + 1}. {qq.q}</div>
                          <div className="mt-1 text-muted-foreground">
                            Jawaban kamu: <span className="text-foreground">{qq.options[answers[i]]}</span>
                          </div>
                          {!ok && (
                            <div className="text-success">
                              Jawaban benar: <span className="font-medium">{qq.options[qq.answer]}</span>
                            </div>
                          )}
                          {qq.explanation && (
                            <div className="mt-1 text-xs text-muted-foreground italic">{qq.explanation}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
