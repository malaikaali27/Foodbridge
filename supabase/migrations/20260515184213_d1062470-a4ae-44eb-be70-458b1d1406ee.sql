
-- Roles enum
create type public.app_role as enum ('donor', 'ngo', 'volunteer', 'admin');

-- Donation status enum
create type public.donation_status as enum ('available', 'accepted', 'picked_up', 'delivered', 'expired', 'cancelled');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  organization text,
  phone text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);

create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Users view own roles"
  on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- Security definer role check
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Donations
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  food_type text not null,
  quantity numeric not null,
  unit text not null default 'servings',
  pickup_address text not null,
  latitude numeric,
  longitude numeric,
  expiry_at timestamptz not null,
  image_url text,
  status donation_status not null default 'available',
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

create policy "Donations viewable by authenticated"
  on public.donations for select to authenticated using (true);

create policy "Donors create own donations"
  on public.donations for insert to authenticated
  with check (auth.uid() = donor_id);

create policy "Donors update own donations"
  on public.donations for update to authenticated
  using (auth.uid() = donor_id);

create policy "NGOs and volunteers can accept/update"
  on public.donations for update to authenticated
  using (
    public.has_role(auth.uid(), 'ngo') or
    public.has_role(auth.uid(), 'volunteer') or
    public.has_role(auth.uid(), 'admin')
  );

create policy "Donors delete own donations"
  on public.donations for delete to authenticated
  using (auth.uid() = donor_id);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger donations_updated_at before update on public.donations
  for each row execute function public.set_updated_at();

-- Auto-create profile + role on signup (reads role from raw_user_meta_data)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _role app_role;
begin
  insert into public.profiles (id, full_name, organization, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'organization', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  );

  _role := coalesce((new.raw_user_meta_data->>'role')::app_role, 'donor');
  insert into public.user_roles (user_id, role) values (new.id, _role);

  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
