-- Content / ops analytics views (read via service role or SQL editor)
-- Join PostHog person id = auth.users.id for cohort work.

create or replace view public.analytics_cocktail_favorites as
select
  cocktail_id,
  cocktail_slug,
  cocktail_name,
  count(*)::int as favorite_count,
  max(created_at) as last_favorited_at
from public.favorites
where cocktail_id is not null
group by cocktail_id, cocktail_slug, cocktail_name;

create or replace view public.analytics_cocktail_views as
select
  cocktail_id,
  cocktail_slug,
  cocktail_name,
  count(*)::int as view_count,
  count(distinct user_id)::int as unique_viewers,
  max(viewed_at) as last_viewed_at
from public.recently_viewed_cocktails
where cocktail_id is not null
group by cocktail_id, cocktail_slug, cocktail_name;

create or replace view public.analytics_bar_sizes as
select
  user_id,
  count(*)::int as bar_size,
  min(created_at) as first_added_at,
  max(created_at) as last_added_at
from public.bar_ingredients
group by user_id;

create or replace view public.analytics_learn_completion as
select
  lesson_kind,
  lesson_slug,
  count(*) filter (where status = 'started')::int as started_count,
  count(*) filter (where status = 'completed')::int as completed_count,
  round(
    100.0 * count(*) filter (where status = 'completed')
    / nullif(count(*), 0),
    1
  ) as completion_pct,
  avg(xp)::numeric(10,1) as avg_xp,
  avg(checks_correct)::numeric(10,2) as avg_checks_correct
from public.learn_progress
group by lesson_kind, lesson_slug;

create or replace view public.analytics_email_campaign_funnel as
select
  campaign,
  count(*)::int as sends,
  count(distinct recipient_email)::int as unique_recipients,
  min(sent_at) as first_sent_at,
  max(sent_at) as last_sent_at
from public.email_campaign_sends
group by campaign;

create or replace view public.analytics_email_engagement as
select
  coalesce(campaign, 'unknown') as campaign,
  event_type,
  count(*)::int as event_count,
  count(distinct email)::int as unique_emails,
  count(distinct cocktail_slug) filter (where cocktail_slug is not null)::int as cocktail_slugs,
  max(created_at) as last_event_at
from public.email_campaign_events
group by coalesce(campaign, 'unknown'), event_type;

-- Rising views + low favorites (weak / under-loved recipes) vs high favorites + low traffic
create or replace view public.analytics_cocktail_demand as
select
  coalesce(v.cocktail_slug, f.cocktail_slug) as cocktail_slug,
  coalesce(v.cocktail_name, f.cocktail_name) as cocktail_name,
  coalesce(v.cocktail_id, f.cocktail_id) as cocktail_id,
  coalesce(v.view_count, 0) as view_count,
  coalesce(v.unique_viewers, 0) as unique_viewers,
  coalesce(f.favorite_count, 0) as favorite_count,
  case
    when coalesce(v.view_count, 0) = 0 then null
    else round(100.0 * coalesce(f.favorite_count, 0) / v.view_count, 1)
  end as favorite_rate_pct,
  case
    when coalesce(v.view_count, 0) >= 10 and coalesce(f.favorite_count, 0) <= 1 then 'weak_recipe'
    when coalesce(f.favorite_count, 0) >= 5 and coalesce(v.view_count, 0) < 10 then 'under_surfaced'
    when coalesce(v.view_count, 0) >= 20 and coalesce(f.favorite_count, 0) >= 5 then 'healthy'
    else 'watch'
  end as demand_signal
from public.analytics_cocktail_views v
full outer join public.analytics_cocktail_favorites f
  on v.cocktail_id = f.cocktail_id;

create or replace view public.analytics_gsc_cocktail_queries as
select
  query,
  page,
  sum(clicks)::int as clicks,
  sum(impressions)::int as impressions,
  round(avg(position)::numeric, 1) as avg_position,
  max(date) as last_date
from public.search_console_daily
where page like '%/cocktails/%'
group by query, page;

-- Service role for ops dashboards (do not expose cross-user aggregates to clients)
grant select on public.analytics_cocktail_favorites to service_role;
grant select on public.analytics_cocktail_views to service_role;
grant select on public.analytics_bar_sizes to service_role;
grant select on public.analytics_learn_completion to service_role;
grant select on public.analytics_email_campaign_funnel to service_role;
grant select on public.analytics_email_engagement to service_role;
grant select on public.analytics_cocktail_demand to service_role;
grant select on public.analytics_gsc_cocktail_queries to service_role;
