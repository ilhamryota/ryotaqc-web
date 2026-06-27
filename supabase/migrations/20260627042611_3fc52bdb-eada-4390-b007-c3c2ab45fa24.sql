ALTER TYPE public.content_status ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS published_at timestamptz;