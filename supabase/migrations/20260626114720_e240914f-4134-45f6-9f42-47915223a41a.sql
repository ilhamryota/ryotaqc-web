
-- Ensure anon can SELECT public-readable tables (RLS still filters to published rows)
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT SELECT ON public.sop_items TO anon, authenticated;
GRANT SELECT ON public.knowledge_materials TO anon, authenticated;
GRANT SELECT ON public.quiz_questions TO anon, authenticated;
GRANT SELECT ON public.qc_tools TO anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;

-- Storage policies for media bucket
CREATE POLICY "Media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Media staff insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));

CREATE POLICY "Media staff update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));

CREATE POLICY "Media staff delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
