import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "../components/site/theme-provider";
import { Navbar } from "../components/site/navbar";
import { Footer } from "../components/site/footer";
import { MusicProvider, FloatingMusicPlayer } from "../components/site/music-player";
import { SectionErrorBoundary } from "../components/site/error-boundary";
import { ScrollProgress } from "../components/site/reveal";
import logoRq from "../assets/logorq.png.asset.json";
import { useApplySettings, useSiteSettings } from "../hooks/use-site-settings";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          URL yang Anda tuju tidak tersedia.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Terjadi masalah. Coba muat ulang.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ryota QC — Quality Control Laptop & MacBook" },
      {
        name: "description",
        content:
          "Sistem panduan Quality Control laptop, MacBook, dan desktop berbasis prosedur. SOP, knowledge, quiz, dan RyotaQC AI.",
      },
      { name: "author", content: "Ryota QC" },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Ryota QC — Quality Control Laptop & MacBook" },
      { property: "og:description", content: "Sistem panduan QC laptop berbasis prosedur, SOP, knowledge, dan AI assistant." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Ryota QC" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#F8FAFC" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logoRq.url },
      { rel: "apple-touch-icon", href: logoRq.url },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Ryota QC",
              description: "Sistem Quality Control laptop, MacBook, dan desktop berbasis prosedur.",
              logo: logoRq.url,
            },
            {
              "@type": "WebSite",
              name: "Ryota QC",
              description: "Platform Quality Control modern untuk Laptop, MacBook, dan Desktop.",
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: "/ai?q={search_term_string}" },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MusicProvider>
          <SettingsRuntime />
          <ScrollProgress />
          {isAdmin ? (
            <div key={path} className="animate-route-in">
              <Outlet />
            </div>
          ) : (
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">
                <div key={path} className="animate-route-in">
                  <Outlet />
                </div>
              </main>
              <Footer />
            </div>
          )}
          <SectionErrorBoundary boundary="music_widget">
            <MusicWidgetGate />
          </SectionErrorBoundary>
        </MusicProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function SettingsRuntime() {
  useApplySettings();
  return null;
}

function MusicWidgetGate() {
  const { data } = useSiteSettings();
  if (data?.enable_music_widget === false) return null;
  return <FloatingMusicPlayer />;
}
