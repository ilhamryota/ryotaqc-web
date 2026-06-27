import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Cpu, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/admin/dashboard" });
  }, [user, loading, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
        });
        if (error) throw error;
        setErr("Cek email untuk konfirmasi, lalu login.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin/dashboard" });
      }
    } catch (e: any) {
      setErr(e.message ?? "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-transparent border border-primary/40">
            <Cpu className="h-5 w-5 text-primary" />
          </span>
          <div>
            <div className="font-display text-xl font-bold">Ryota<span className="text-primary">QC</span> Admin</div>
            <div className="text-xs text-muted-foreground">Panel manajemen konten</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-1">{mode === "signin" ? "Masuk" : "Daftar"}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {mode === "signin" ? "Gunakan email & password admin." : "Daftarkan akun admin baru."}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          {err && <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{err}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>Belum punya akun? <button type="button" onClick={() => setMode("signup")} className="text-primary hover:underline">Daftar</button></>
          ) : (
            <>Sudah punya akun? <button type="button" onClick={() => setMode("signin")} className="text-primary hover:underline">Masuk</button></>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  );
}
