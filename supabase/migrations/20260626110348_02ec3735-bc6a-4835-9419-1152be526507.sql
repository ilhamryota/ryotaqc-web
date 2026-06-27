GRANT SELECT ON public.qc_tools TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qc_tools TO authenticated;
GRANT ALL ON public.qc_tools TO service_role;