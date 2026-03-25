-- ============================================
-- MORA — Schema completo de base de datos
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "postgis"; -- Para ubicaciones geográficas

-- ============================================
-- TABLA: profiles (usuarias y proveedoras)
-- Se crea automáticamente al registrarse con Supabase Auth
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  whatsapp text,
  city text,
  avatar_url text,
  role text not null default 'usuaria' check (role in ('usuaria', 'proveedora', 'admin')),
  verification_status text not null default 'pending' check (
    verification_status in ('pending', 'in_review', 'approved', 'rejected')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table public.profiles enable row level security;

create policy "Usuarios pueden ver su propio perfil"
  on public.profiles for select using (auth.uid() = id);

create policy "Usuarios pueden actualizar su propio perfil"
  on public.profiles for update using (auth.uid() = id);

create policy "Perfiles aprobados son públicos"
  on public.profiles for select using (verification_status = 'approved');

-- ============================================
-- TABLA: provider_profiles (info adicional de proveedoras)
-- ============================================
create table public.provider_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  service_type text not null, -- 'Fitness / Entrenamiento', 'Nutrición', etc.
  description text,
  specialties text[] default '{}',
  service_mode text not null default 'A domicilio' check (
    service_mode in ('A domicilio', 'Consultorio', 'Ambos')
  ),
  address text, -- solo si service_mode != 'A domicilio'
  city text not null,
  price_from integer, -- precio en COP
  price_label text, -- ej: "Desde $80.000 / sesión"
  availability text, -- ej: "Lunes a Viernes, 6am - 8pm"
  whatsapp text not null,
  is_active boolean default false, -- se activa cuando verification_status = approved
  -- Coordenadas para el mapa
  latitude double precision,
  longitude double precision,
  -- Stats (actualizados por triggers/funciones)
  profile_views integer default 0,
  contact_count integer default 0,
  average_rating numeric(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.provider_profiles enable row level security;

create policy "Proveedoras pueden ver/editar su propio perfil"
  on public.provider_profiles for all using (auth.uid() = user_id);

create policy "Perfiles activos son públicos"
  on public.provider_profiles for select using (is_active = true);

-- ============================================
-- TABLA: verification_requests (para admin)
-- ============================================
create table public.verification_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  cedula_url text, -- URL del archivo en Supabase Storage
  selfie_url text,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  admin_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.verification_requests enable row level security;

create policy "Usuarias ven su propia solicitud"
  on public.verification_requests for select using (auth.uid() = user_id);

create policy "Usuarias crean su solicitud"
  on public.verification_requests for insert with check (auth.uid() = user_id);

create policy "Admins ven todas las solicitudes"
  on public.verification_requests for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- TABLA: reviews (reseñas de proveedoras)
-- ============================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique(provider_id, reviewer_id) -- una reseña por usuaria por proveedora
);

alter table public.reviews enable row level security;

create policy "Reseñas son públicas"
  on public.reviews for select using (true);

create policy "Usuarias aprobadas pueden dejar reseñas"
  on public.reviews for insert with check (
    auth.uid() = reviewer_id and
    exists (select 1 from public.profiles where id = auth.uid() and verification_status = 'approved')
  );

create policy "Usuarias pueden editar/borrar sus propias reseñas"
  on public.reviews for all using (auth.uid() = reviewer_id);

-- ============================================
-- TABLA: saved_providers (proveedoras guardadas)
-- ============================================
create table public.saved_providers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  provider_id uuid references public.provider_profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, provider_id)
);

alter table public.saved_providers enable row level security;

create policy "Usuarias gestionan sus guardadas"
  on public.saved_providers for all using (auth.uid() = user_id);

-- ============================================
-- TABLA: notifications
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'verification_approved',
    'verification_rejected',
    'new_contact',
    'profile_view',
    'new_review',
    'welcome',
    'reminder',
    'nearby_provider'
  )),
  title text not null,
  body text not null,
  is_read boolean default false,
  data jsonb default '{}', -- metadata adicional
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Usuarias ven sus propias notificaciones"
  on public.notifications for all using (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );

  -- Notificación de bienvenida
  insert into public.notifications (user_id, type, title, body)
  values (
    new.id,
    'welcome',
    '¡Bienvenida a Mora! 💜',
    'Gracias por unirte. Completa tu verificación para acceder a toda la plataforma.'
  );

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- FUNCIÓN: actualizar rating promedio al crear reseña
-- ============================================
create or replace function public.update_provider_rating()
returns trigger as $$
begin
  update public.provider_profiles
  set
    average_rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where provider_id = new.provider_id
    ),
    review_count = (
      select count(*) from public.reviews where provider_id = new.provider_id
    ),
    updated_at = now()
  where id = new.provider_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_review_created
  after insert or update or delete on public.reviews
  for each row execute function public.update_provider_rating();

-- ============================================
-- FUNCIÓN: aprobar verificación → activar perfil
-- ============================================
create or replace function public.approve_verification(request_id uuid, notes text default null)
returns void as $$
declare
  v_user_id uuid;
begin
  -- Obtener user_id de la solicitud
  select user_id into v_user_id
  from public.verification_requests where id = request_id;

  -- Actualizar solicitud
  update public.verification_requests
  set status = 'approved', admin_notes = notes, reviewed_by = auth.uid(), reviewed_at = now()
  where id = request_id;

  -- Actualizar perfil
  update public.profiles
  set verification_status = 'approved', updated_at = now()
  where id = v_user_id;

  -- Activar perfil de proveedora si existe
  update public.provider_profiles
  set is_active = true, updated_at = now()
  where user_id = v_user_id;

  -- Enviar notificación
  insert into public.notifications (user_id, type, title, body)
  values (
    v_user_id,
    'verification_approved',
    '¡Tu cuenta fue verificada!',
    'Ya puedes explorar Mora y conectar con otras mujeres.'
  );
end;
$$ language plpgsql security definer;

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Bucket para fotos de verificación (privado)
insert into storage.buckets (id, name, public) values ('verifications', 'verifications', false);

-- Bucket para fotos de perfil (público)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Políticas de storage
create policy "Usuarias suben su propia verificación"
  on storage.objects for insert with check (
    bucket_id = 'verifications' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins ven verificaciones"
  on storage.objects for select using (
    bucket_id = 'verifications' and
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Avatares son públicos"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Usuarias suben su propio avatar"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- VISTA: proveedoras activas con info completa
-- ============================================
create or replace view public.active_providers as
  select
    pp.id,
    pp.user_id,
    p.full_name,
    p.avatar_url,
    pp.service_type,
    pp.description,
    pp.specialties,
    pp.service_mode,
    pp.address,
    pp.city,
    pp.price_from,
    pp.price_label,
    pp.availability,
    pp.whatsapp,
    pp.latitude,
    pp.longitude,
    pp.profile_views,
    pp.contact_count,
    pp.average_rating,
    pp.review_count,
    pp.created_at
  from public.provider_profiles pp
  join public.profiles p on p.id = pp.user_id
  where pp.is_active = true and p.verification_status = 'approved';
