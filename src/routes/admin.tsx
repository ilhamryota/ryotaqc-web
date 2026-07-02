import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (location.pathname === "/admin/login") return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminGate,
});

function AdminGate() {
  const navigate = useNavigate();
  const { loading, user, isStaff } = useAuth();
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  useEffect(() => {
    if (path !== "/admin/login" && !loading && !user) navigate({ to: "/admin/login" });
  }, [path, loading, user, navigate]);

  if (path === "/admin/login") return <Outlet />;

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !isStaff) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Akun ini belum memiliki hak akses admin. Hubungi super admin.
          </p>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin/login" }); }}
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
}
