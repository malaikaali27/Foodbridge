
-- Approval flag on profiles
alter table public.profiles add column approved boolean not null default false;

-- Auto-approve volunteers; donors and NGOs start pending. Admin trigger update:
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role public.app_role;
begin
  _role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'donor');

  insert into public.profiles (id, full_name, organization, phone, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'organization', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when _role = 'volunteer' then true else false end
  );

  insert into public.user_roles (user_id, role) values (new.id, _role);
  return new;
end; $$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Admin policies: profiles
create policy "Admins manage all profiles"
  on public.profiles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete profiles"
  on public.profiles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Admin policies: user_roles
create policy "Admins view all roles"
  on public.user_roles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins insert roles"
  on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins update roles"
  on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete roles"
  on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

-- Admin policies: donations (delete any post)
create policy "Admins delete any donation"
  on public.donations for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));
