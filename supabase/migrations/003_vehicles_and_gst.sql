-- ============================================================
-- Migration 003: Add vehicles table + GST fields on invoices
-- ============================================================

-- ── Vehicles ─────────────────────────────────────────────────
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  vehicle_number text not null,         -- e.g. MH-12-AB-1234
  vehicle_type text not null default 'truck', -- truck | mini_truck | trailer | tanker | other
  capacity_tons numeric,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Owners can manage their vehicles"
  on public.vehicles for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index idx_vehicles_owner on public.vehicles(owner_id);

-- ── Invoice schema additions ─────────────────────────────────
-- New status column (draft | sent | paid | overdue | cancelled)
alter table public.invoices
  add column if not exists status text not null default 'draft';

-- Vehicle reference
alter table public.invoices
  add column if not exists vehicle_id uuid references public.vehicles(id);

-- GST breakdown
alter table public.invoices
  add column if not exists gst_rate numeric,
  add column if not exists cgst_amount numeric default 0,
  add column if not exists sgst_amount numeric default 0,
  add column if not exists igst_amount numeric default 0;

-- Payment extras
alter table public.invoices
  add column if not exists advance_received numeric default 0,
  add column if not exists payment_mode text,     -- cash | upi | bank_transfer
  add column if not exists eway_bill_number text;

-- Updated at (was missing)
alter table public.invoices
  add column if not exists updated_at timestamptz not null default now();

-- Index on owner_id (was missing)
create index if not exists idx_invoices_owner on public.invoices(owner_id);
