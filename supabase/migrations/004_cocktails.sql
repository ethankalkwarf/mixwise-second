-- =============================================
-- Migration 004: Cocktails table (Supabase source of truth)
-- =============================================
-- Creates the `public.cocktails` table which mirrors the Excel data source
-- and replaces Sanity as the canonical store for cocktail recipes.
-- =============================================

create table if not exists public.cocktails (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  slug text not null unique,
  name text not null,
  short_description text,
  long_description text,
  seo_description text,
  base_spirit text,
  category_primary text,
  categories_all text[] default '{}',
  tags text[] default '{}',
  image_url text,
  image_alt text,
  glassware text,
  garnish text,
  technique text,
  difficulty text,
  flavor_strength smallint,
  flavor_sweetness smallint,
  flavor_tartness smallint,
  flavor_bitterness smallint,
  flavor_aroma text,
  flavor_texture text,
  notes text,
  fun_fact text,
  fun_fact_source text,
  metadata_json jsonb default '{}'::jsonb,
  ingredients jsonb default '[]'::jsonb,
  instructions text,
  is_popular boolean default false,
  is_favorite boolean default false,
  is_trending boolean default false,
  is_hidden boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cocktails_slug_idx on public.cocktails (slug);
create index if not exists cocktails_base_spirit_idx on public.cocktails (base_spirit);
create index if not exists cocktails_category_idx on public.cocktails (category_primary);
create index if not exists cocktails_popular_idx on public.cocktails (is_popular) where is_popular = true;
create index if not exists cocktails_tags_gin on public.cocktails using gin (tags);
create index if not exists cocktails_categories_gin on public.cocktails using gin (categories_all);

alter table public.cocktails enable row level security;

create policy "Public cocktails read access"
  on public.cocktails
  for select
  using (true);

create trigger update_cocktails_updated_at
  before update on public.cocktails
  for each row
  execute function public.update_updated_at_column();
