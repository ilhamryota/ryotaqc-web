
-- Lock down direct EXECUTE on SECURITY DEFINER helpers.
-- Policies and triggers continue to call them via the function owner.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
