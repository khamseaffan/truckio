-- ============================================
-- Trukio — Phase 2 Schema Fix
-- Simplify FK references so owner_id and driver_id
-- point directly to auth.users(id) instead of
-- the owners/drivers table PKs.
--
-- This aligns Supabase with what the app sends:
--   orders.owner_id  = auth.uid()
--   jobs.owner_id    = auth.uid()
--   jobs.driver_id   = driver's auth.uid()
--   drivers.owner_id = owner's auth.uid()
-- ============================================

-- ==========================================
-- DRIVERS: owner_id → auth.users(id)
-- ==========================================
alter table public.drivers
  drop constraint if exists drivers_owner_id_fkey;

alter table public.drivers
  add constraint drivers_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete cascade;

drop policy if exists "Owners can read their drivers" on public.drivers;
drop policy if exists "Owners can insert drivers" on public.drivers;
drop policy if exists "Owners can update their drivers" on public.drivers;

create policy "Owners can read their drivers"
  on public.drivers for select
  using (auth.uid() = owner_id or auth.uid() = user_id);

create policy "Owners can insert drivers"
  on public.drivers for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their drivers"
  on public.drivers for update
  using (auth.uid() = owner_id);

-- ==========================================
-- ORDERS: owner_id → auth.users(id)
-- ==========================================
alter table public.orders
  drop constraint if exists orders_owner_id_fkey;

alter table public.orders
  add constraint orders_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete cascade;

drop policy if exists "Owners can manage their orders" on public.orders;

create policy "Owners can manage their orders"
  on public.orders for all
  using (auth.uid() = owner_id);

-- ==========================================
-- JOBS: owner_id + driver_id → auth.users(id)
-- ==========================================
alter table public.jobs
  drop constraint if exists jobs_owner_id_fkey;

alter table public.jobs
  drop constraint if exists jobs_driver_id_fkey;

alter table public.jobs
  add constraint jobs_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete cascade;

alter table public.jobs
  add constraint jobs_driver_id_fkey
  foreign key (driver_id) references auth.users(id);

drop policy if exists "Owners and assigned drivers can see jobs" on public.jobs;
drop policy if exists "Owners can manage jobs" on public.jobs;

create policy "Owners and assigned drivers can see jobs"
  on public.jobs for select
  using (auth.uid() = owner_id or auth.uid() = driver_id);

create policy "Owners can manage jobs"
  on public.jobs for all
  using (auth.uid() = owner_id);

-- Drivers can update their own job status
create policy "Drivers can update assigned jobs"
  on public.jobs for update
  using (auth.uid() = driver_id);

-- ==========================================
-- INVOICES: owner_id → auth.users(id)
-- ==========================================
alter table public.invoices
  drop constraint if exists invoices_owner_id_fkey;

alter table public.invoices
  add constraint invoices_owner_id_fkey
  foreign key (owner_id) references auth.users(id) on delete cascade;

drop policy if exists "Owners can manage their invoices" on public.invoices;

create policy "Owners can manage their invoices"
  on public.invoices for all
  using (auth.uid() = owner_id);
