-- ─── KusinaCost Database Schema for Supabase ──────────────────────────────
-- Run this in Supabase SQL Editor to set up tables.
-- All tables have RLS (Row Level Security) enabled — users only see their own data.

-- ─── Ingredients Table ───────────────────────────────────────────────────
create table if not exists public.ingredients (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  purchase_price numeric(12, 2) not null default 0,
  purchase_qty numeric(12, 3) not null default 1,
  purchase_unit text not null default 'pcs',
  category text not null default 'Others',
  created_at timestamptz not null default now()
);

create index if not exists ingredients_user_id_idx on public.ingredients(user_id);

alter table public.ingredients enable row level security;

create policy "Users manage own ingredients"
  on public.ingredients for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Recipes Table ───────────────────────────────────────────────────────
create table if not exists public.recipes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null default 'Ulam',
  servings integer not null default 1,
  selling_price numeric(12, 2) not null default 0,
  ingredients jsonb not null default '[]'::jsonb,
  overhead jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists recipes_user_id_idx on public.recipes(user_id);

alter table public.recipes enable row level security;

create policy "Users manage own recipes"
  on public.recipes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Sales Table ─────────────────────────────────────────────────────────
create table if not exists public.sales (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  recipe_id text not null,
  date date not null default current_date,
  batches_made integer not null default 1,
  servings_sold integer not null default 0,
  servings_wasted integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sales_user_id_idx on public.sales(user_id);
create index if not exists sales_recipe_id_idx on public.sales(recipe_id);
create index if not exists sales_date_idx on public.sales(date);

alter table public.sales enable row level security;

create policy "Users manage own sales"
  on public.sales for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Overhead Settings Table (one row per user) ──────────────────────────
create table if not exists public.overhead_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lpg_tank_price numeric(12, 2) not null default 1050,
  lpg_tank_kg numeric(8, 2) not null default 11,
  lpg_burn_rate_kg_per_hr numeric(8, 3) not null default 0.8,
  electricity_per_kwh numeric(8, 2) not null default 12,
  labor_rate_per_hour numeric(8, 2) not null default 75,
  packaging_per_serving numeric(8, 2) not null default 5,
  updated_at timestamptz not null default now()
);

alter table public.overhead_settings enable row level security;

create policy "Users manage own overhead settings"
  on public.overhead_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
