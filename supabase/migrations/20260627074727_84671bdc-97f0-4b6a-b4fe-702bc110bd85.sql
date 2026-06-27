
CREATE INDEX IF NOT EXISTS articles_status_type_updated_idx
  ON public.articles (status, article_type, updated_at DESC);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON public.articles (slug);
CREATE INDEX IF NOT EXISTS articles_category_idx ON public.articles (category_id);

CREATE INDEX IF NOT EXISTS knowledge_status_level_updated_idx
  ON public.knowledge_materials (status, level, updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_slug_idx ON public.knowledge_materials (slug);

CREATE INDEX IF NOT EXISTS quiz_status_level_idx
  ON public.quiz_questions (status, level);

CREATE INDEX IF NOT EXISTS sop_category_status_idx
  ON public.sop_items (category_id, status);
CREATE INDEX IF NOT EXISTS sop_slug_idx ON public.sop_items (slug);

CREATE INDEX IF NOT EXISTS procedure_sort_idx
  ON public.procedure_steps (sort_order);
CREATE INDEX IF NOT EXISTS procedure_phase_idx
  ON public.procedure_steps (phase, sort_order);

CREATE INDEX IF NOT EXISTS qc_tools_pub_platform_idx
  ON public.qc_tools (is_published, platform);
CREATE INDEX IF NOT EXISTS qc_tools_slug_idx ON public.qc_tools (slug);

CREATE INDEX IF NOT EXISTS user_roles_user_idx ON public.user_roles (user_id);
