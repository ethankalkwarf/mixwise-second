-- Email engagement events from Resend webhooks (opens, clicks, etc.)
create table if not exists public.email_campaign_events (
  id bigserial primary key,
  resend_email_id text,
  event_type text not null,
  email text,
  campaign text,
  link_url text,
  cocktail_slug text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists email_campaign_events_type_created_idx
  on public.email_campaign_events (event_type, created_at desc);

create index if not exists email_campaign_events_campaign_idx
  on public.email_campaign_events (campaign, created_at desc);

create index if not exists email_campaign_events_email_idx
  on public.email_campaign_events (email);

alter table public.email_campaign_events enable row level security;

-- Service role only (no anon/authenticated policies)
