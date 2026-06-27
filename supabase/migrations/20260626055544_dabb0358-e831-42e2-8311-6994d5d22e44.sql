
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor');
CREATE TYPE public.content_status AS ENUM ('draft', 'published');
CREATE TYPE public.article_type AS ENUM ('informasi', 'maintenance');
CREATE TYPE public.knowledge_level AS ENUM ('dasar', 'menengah', 'tinggi', 'lanjutan');
CREATE TYPE public.category_type AS ENUM ('software', 'hardware', 'sop', 'knowledge', 'maintenance');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "Profiles readable by self or admin" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Super admin manages all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Super admin manages roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first;
  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'editor');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type public.category_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, type)
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  featured_image TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Pages public read published" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Pages staff read all" ON public.pages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Pages admin write" ON public.pages FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  article_type public.article_type NOT NULL,
  featured_image TEXT,
  attachment_url TEXT,
  reference_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Articles public read published" ON public.articles FOR SELECT USING (status='published');
CREATE POLICY "Articles staff read all" ON public.articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Articles staff insert" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Articles staff update" ON public.articles FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Articles admin delete" ON public.articles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.sop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  content TEXT,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  pass_criteria TEXT,
  minus_criteria TEXT,
  return_criteria TEXT,
  featured_image TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sop_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sop_items TO authenticated;
GRANT ALL ON public.sop_items TO service_role;
ALTER TABLE public.sop_items ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER sop_updated_at BEFORE UPDATE ON public.sop_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "SOP public read published" ON public.sop_items FOR SELECT USING (status='published');
CREATE POLICY "SOP staff read all" ON public.sop_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "SOP admin write" ON public.sop_items FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.knowledge_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level public.knowledge_level NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  video_url TEXT,
  attachment_url TEXT,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.knowledge_materials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_materials TO authenticated;
GRANT ALL ON public.knowledge_materials TO service_role;
ALTER TABLE public.knowledge_materials ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER knowledge_updated_at BEFORE UPDATE ON public.knowledge_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Knowledge public read published" ON public.knowledge_materials FOR SELECT USING (status='published');
CREATE POLICY "Knowledge staff read all" ON public.knowledge_materials FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Knowledge staff insert" ON public.knowledge_materials FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Knowledge staff update" ON public.knowledge_materials FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Knowledge admin delete" ON public.knowledge_materials FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

CREATE TABLE public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  explanation TEXT,
  level public.knowledge_level NOT NULL,
  related_material_id UUID REFERENCES public.knowledge_materials(id) ON DELETE SET NULL,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER quiz_updated_at BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Quiz public read published" ON public.quiz_questions FOR SELECT USING (status='published');
CREATE POLICY "Quiz staff read all" ON public.quiz_questions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Quiz admin write" ON public.quiz_questions FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_library TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_library TO authenticated;
GRANT ALL ON public.media_library TO service_role;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media public read" ON public.media_library FOR SELECT USING (true);
CREATE POLICY "Media admin write" ON public.media_library FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'Ryota QC',
  site_logo TEXT,
  favicon TEXT,
  primary_color TEXT DEFAULT '#22D3EE',
  secondary_color TEXT DEFAULT '#0B1720',
  theme_mode TEXT DEFAULT 'system',
  contact_email TEXT,
  contact_whatsapp TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  footer_text TEXT,
  meta_title TEXT,
  meta_description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Settings super admin write" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.site_settings (site_name, meta_title, meta_description, footer_text, contact_email)
VALUES ('Ryota QC','Ryota QC — Quality Control Laptop & MacBook','Sistem panduan Quality Control laptop & MacBook berbasis prosedur.','© Ryota QC','contact@ryotaqc.id');

INSERT INTO public.categories (name, slug, type) VALUES
  ('SOP Fisik','sop-fisik','sop'),
  ('SOP LCD','sop-lcd','sop'),
  ('SOP Keyboard','sop-keyboard','sop'),
  ('SOP Battery','sop-battery','sop'),
  ('SOP Storage','sop-storage','sop'),
  ('SOP Port','sop-port','sop'),
  ('SOP Audio, Mic, Camera','sop-audio-mic-camera','sop'),
  ('SOP WiFi & Bluetooth','sop-wifi-bluetooth','sop'),
  ('SOP Touchpad & Touchscreen','sop-touchpad','sop'),
  ('SOP Benchmark & Running Test','sop-benchmark','sop'),
  ('SOP Computrace & BIOS Security','sop-computrace','sop'),
  ('Software','software','software'),
  ('Hardware','hardware','hardware'),
  ('Maintenance Software','maint-software','maintenance'),
  ('Maintenance Hardware','maint-hardware','maintenance');

INSERT INTO public.pages (title, slug, content, status, meta_title, meta_description) VALUES
  ('Beranda','beranda','Ryota QC — Quality Control Laptop Lebih Cepat, Rapi, dan Terstandarisasi.','published','Beranda — Ryota QC','Quality Control laptop berbasis prosedur, SOP, dan AI.'),
  ('Prosedur QC','prosedur','Alur Quality Control dari terima unit sampai status akhir.','published','Prosedur QC — Ryota QC','Alur 20+ langkah QC laptop & MacBook.'),
  ('SOP QC','sop','Standar Operasional Prosedur pengecekan komponen laptop.','published','SOP QC — Ryota QC','Standar operasional QC laptop & MacBook.'),
  ('Informasi','informasi','Artikel informasi Software & Hardware.','published','Informasi — Ryota QC','Artikel software & hardware.'),
  ('Maintenance','maintenance','Artikel problem solving Software & Hardware.','published','Maintenance — Ryota QC','Problem solving software & hardware.'),
  ('Knowledge','knowledge','Materi pembelajaran 4 level QC laptop.','published','Knowledge — Ryota QC','Materi pembelajaran QC.'),
  ('Quiz','quiz','Quiz pilihan ganda 4 level untuk uji pemahaman QC.','published','Quiz — Ryota QC','Quiz pemahaman QC.'),
  ('RyotaQC AI','ai','Asisten AI tanya jawab QC laptop.','published','RyotaQC AI — Ryota QC','AI assistant QC laptop.'),
  ('Contact','contact','Hubungi developer Ryota QC.','published','Contact — Ryota QC','Hubungi tim Ryota QC.');
