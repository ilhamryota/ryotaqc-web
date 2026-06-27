import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  site_name: string | null;
  tagline: string | null;
  site_logo: string | null;
  favicon: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  text_color: string | null;
  muted_color: string | null;
  theme_mode: string | null;
  meta_title: string | null;
  meta_description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  footer_text: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  cta_text: string | null;
  default_landing: string | null;
  show_main_nav: boolean | null;
  show_navbar_search: boolean | null;
  show_ai_widget: boolean | null;
  show_music_widget: boolean | null;
  enable_ai_widget: boolean | null;
  enable_music_widget: boolean | null;
  language: string | null;
  timezone: string | null;
  maintenance_mode: boolean | null;
  ga_id: string | null;
  meta_pixel_id: string | null;
  search_console_token: string | null;
  analytics_api_key: string | null;
  updated_at: string;
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      return (data as unknown as SiteSettings) ?? null;
    },
    staleTime: 60_000,
  });
}

/** Apply theme colors from settings to CSS vars at runtime. */
export function useApplySettings() {
  const { data } = useSiteSettings();
  useEffect(() => {
    if (!data || typeof document === "undefined") return;
    const root = document.documentElement;
    if (data.primary_color) root.style.setProperty("--brand-primary", data.primary_color);
    if (data.secondary_color) root.style.setProperty("--brand-secondary", data.secondary_color);
    if (data.meta_title) document.title = data.meta_title;
  }, [data]);
  return data;
}
