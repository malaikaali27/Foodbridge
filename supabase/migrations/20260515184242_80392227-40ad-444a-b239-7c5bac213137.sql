
-- Fix mutable search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

-- Revoke public execute on SECURITY DEFINER functions; RLS evaluator runs as table owner so policies still work
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
