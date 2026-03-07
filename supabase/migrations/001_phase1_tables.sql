-- ============================================
-- Trukio — Supabase Tables (Phase 1)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ==========================================
-- OWNERS table
-- ==========================================
create table if not exists public.owners (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  business_name text not null,
  phone text not null default '',
  email text,
  gst_number text,
  address text,
  logo_url text,
  plan_tier text not null default 'starter' check (plan_tier in ('starter', 'growth', 'fleet')),
  plan_status text not null default 'active' check (plan_status in ('active', 'payment_failed', 'cancelled')),
  invoice_prefix text,
  invoice_auto_number boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.owners enable row level security;

create policy "Users can read own owner record"
  on public.owners for select
  using (auth.uid() = user_id);

create policy "Users can insert own owner record"
  on public.owners for insert
  with check (auth.uid() = user_id);

create policy "Users can update own owner record"
  on public.owners for update
  using (auth.uid() = user_id);

-- ==========================================
-- DRIVERS table
-- ==========================================
create table if not exists public.drivers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique,
  owner_id uuid references public.owners(id) on delete cascade not null,
  name text not null,
  phone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.drivers enable row level security;

create policy "Owners can read their drivers"
  on public.drivers for select
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "Owners can insert drivers"
  on public.drivers for insert
  with check (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

create policy "Owners can update their drivers"
  on public.drivers for update
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

-- ==========================================
-- ORDERS table
-- ==========================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.owners(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text,
  pickup_address text not null,
  pickup_lat double precision,
  pickup_lng double precision,
  drop_address text not null,
  drop_lat double precision,
  drop_lng double precision,
  material_type text not null default '',
  quantity_value double precision,
  quantity_unit text,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  notes text,
  scheduled_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Owners can manage their orders"
  on public.orders for all
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

-- ==========================================
-- JOBS table
-- ==========================================
create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  owner_id uuid references public.owners(id) on delete cascade not null,
  driver_id uuid references public.drivers(id) not null,
  driver_name text not null,
  status text not null default 'assigned' check (status in ('assigned', 'accepted', 'picked_up', 'in_transit', 'delivered', 'rejected')),
  pickup_time timestamptz,
  delivery_time timestamptz,
  share_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Owners and assigned drivers can see jobs"
  on public.jobs for select
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
    or driver_id in (select id from public.drivers where user_id = auth.uid())
  );

create policy "Owners can manage jobs"
  on public.jobs for all
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

-- ==========================================
-- INVOICES table
-- ==========================================
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.owners(id) on delete cascade not null,
  order_id uuid references public.orders(id),
  job_id uuid references public.jobs(id),
  invoice_number text not null,
  customer_name text not null,
  from_address text not null,
  to_address text not null,
  material_type text,
  quantity_value double precision,
  quantity_unit text,
  freight_charge double precision not null default 0,
  loading_charge double precision default 0,
  unloading_charge double precision default 0,
  other_charges double precision default 0,
  total_amount double precision not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'overdue')),
  payment_due_date timestamptz,
  vehicle_number text,
  pdf_path text,
  template_id uuid,
  created_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Owners can manage their invoices"
  on public.invoices for all
  using (
    owner_id in (select id from public.owners where user_id = auth.uid())
  );

-- ==========================================
-- NOTIFICATIONS table
-- ==========================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  type text not null default 'system' check (type in ('job_update', 'payment', 'system')),
  is_read boolean not null default false,
  data_json jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

-- ==========================================
-- updated_at auto-trigger
-- ==========================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on public.owners
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.drivers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.jobs
  for each row execute function public.handle_updated_at();
