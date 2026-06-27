DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['articles','sop_items','knowledge_materials','quiz_questions','qc_tools','pages','procedure_steps','media_library']
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END$$;