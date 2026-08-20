-- Daily Google Search Console aggregates for off-site cocktail demand
create table if not exists public.search_console_daily (
  id bigserial primary key,
  date date not null,
  query text not null default '',
  page text not null default '',
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric,
  position numeric,
  created_at timestamptz not null default now(),
  unique (date, query, page)
);

create index if not exists search_console_daily_date_idx
  on public.search_console_daily (date desc);

create index if not exists search_console_daily_query_idx
  on public.search_console_daily (query);

create index if not exists search_console_daily_page_idx
  on public.search_console_daily (page);

alter table public.search_console_daily enable row level security;
