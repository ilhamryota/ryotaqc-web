export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          article_type: Database["public"]["Enums"]["article_type"]
          attachment_url: string | null
          category_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          reference_url: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          article_type: Database["public"]["Enums"]["article_type"]
          attachment_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reference_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          article_type?: Database["public"]["Enums"]["article_type"]
          attachment_url?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          reference_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_materials: {
        Row: {
          attachment_url: string | null
          content: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          level: Database["public"]["Enums"]["knowledge_level"]
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          level: Database["public"]["Enums"]["knowledge_level"]
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          level?: Database["public"]["Enums"]["knowledge_level"]
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      procedure_steps: {
        Row: {
          bullets: Json
          created_at: string
          created_by: string | null
          featured_image: string | null
          icon: string | null
          id: string
          image_key: string | null
          phase: number
          phase_label: string
          phase_title: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          step_number: number
          tint: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bullets?: Json
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          icon?: string | null
          id?: string
          image_key?: string | null
          phase?: number
          phase_label?: string
          phase_title?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          step_number: number
          tint?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bullets?: Json
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          icon?: string | null
          id?: string
          image_key?: string | null
          phase?: number
          phase_label?: string
          phase_title?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          step_number?: number
          tint?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      qc_tools: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          download_url: string
          icon: string | null
          id: string
          image_url: string | null
          is_published: boolean
          name: string
          platform: string | null
          size_text: string | null
          slug: string | null
          sort_order: number
          subcategory: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_url: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name: string
          platform?: string | null
          size_text?: string | null
          slug?: string | null
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_url?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          name?: string
          platform?: string | null
          size_text?: string | null
          slug?: string | null
          sort_order?: number
          subcategory?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          created_by: string | null
          explanation: string | null
          id: string
          level: Database["public"]["Enums"]["knowledge_level"]
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          related_material_id: string | null
          status: Database["public"]["Enums"]["content_status"]
          updated_at: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          level: Database["public"]["Enums"]["knowledge_level"]
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          related_material_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          explanation?: string | null
          id?: string
          level?: Database["public"]["Enums"]["knowledge_level"]
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          related_material_id?: string | null
          status?: Database["public"]["Enums"]["content_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_related_material_id_fkey"
            columns: ["related_material_id"]
            isOneToOne: false
            referencedRelation: "knowledge_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          analytics_api_key: string | null
          canonical_url: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          cta_text: string | null
          default_landing: string | null
          enable_ai_widget: boolean | null
          enable_music_widget: boolean | null
          favicon: string | null
          footer_text: string | null
          ga_id: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          instagram_url: string | null
          keywords: string | null
          language: string | null
          maintenance_mode: boolean | null
          meta_description: string | null
          meta_pixel_id: string | null
          meta_title: string | null
          muted_color: string | null
          og_description: string | null
          og_title: string | null
          primary_color: string | null
          search_console_token: string | null
          secondary_color: string | null
          show_ai_widget: boolean | null
          show_main_nav: boolean | null
          show_music_widget: boolean | null
          show_navbar_search: boolean | null
          site_logo: string | null
          site_name: string
          tagline: string | null
          text_color: string | null
          theme_mode: string | null
          timezone: string | null
          updated_at: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          analytics_api_key?: string | null
          canonical_url?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          cta_text?: string | null
          default_landing?: string | null
          enable_ai_widget?: boolean | null
          enable_music_widget?: boolean | null
          favicon?: string | null
          footer_text?: string | null
          ga_id?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          keywords?: string | null
          language?: string | null
          maintenance_mode?: boolean | null
          meta_description?: string | null
          meta_pixel_id?: string | null
          meta_title?: string | null
          muted_color?: string | null
          og_description?: string | null
          og_title?: string | null
          primary_color?: string | null
          search_console_token?: string | null
          secondary_color?: string | null
          show_ai_widget?: boolean | null
          show_main_nav?: boolean | null
          show_music_widget?: boolean | null
          show_navbar_search?: boolean | null
          site_logo?: string | null
          site_name?: string
          tagline?: string | null
          text_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          analytics_api_key?: string | null
          canonical_url?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          cta_text?: string | null
          default_landing?: string | null
          enable_ai_widget?: boolean | null
          enable_music_widget?: boolean | null
          favicon?: string | null
          footer_text?: string | null
          ga_id?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          keywords?: string | null
          language?: string | null
          maintenance_mode?: boolean | null
          meta_description?: string | null
          meta_pixel_id?: string | null
          meta_title?: string | null
          muted_color?: string | null
          og_description?: string | null
          og_title?: string | null
          primary_color?: string | null
          search_console_token?: string | null
          secondary_color?: string | null
          show_ai_widget?: boolean | null
          show_main_nav?: boolean | null
          show_music_widget?: boolean | null
          show_navbar_search?: boolean | null
          site_logo?: string | null
          site_name?: string
          tagline?: string | null
          text_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      sop_items: {
        Row: {
          category_id: string | null
          checklist_items: Json | null
          content: string | null
          created_at: string
          created_by: string | null
          featured_image: string | null
          id: string
          minus_criteria: string | null
          pass_criteria: string | null
          return_criteria: string | null
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          checklist_items?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          id?: string
          minus_criteria?: string | null
          pass_criteria?: string | null
          return_criteria?: string | null
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          checklist_items?: Json | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          featured_image?: string | null
          id?: string
          minus_criteria?: string | null
          pass_criteria?: string | null
          return_criteria?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor" | "moderator" | "viewer"
      article_type: "informasi" | "maintenance"
      category_type:
        | "software"
        | "hardware"
        | "sop"
        | "knowledge"
        | "maintenance"
      content_status: "draft" | "published" | "scheduled"
      knowledge_level: "dasar" | "menengah" | "tinggi" | "lanjutan"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "editor", "moderator", "viewer"],
      article_type: ["informasi", "maintenance"],
      category_type: [
        "software",
        "hardware",
        "sop",
        "knowledge",
        "maintenance",
      ],
      content_status: ["draft", "published", "scheduled"],
      knowledge_level: ["dasar", "menengah", "tinggi", "lanjutan"],
    },
  },
} as const
