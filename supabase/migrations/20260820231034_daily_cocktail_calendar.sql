-- Locked Drink of the Day assignments by UTC date.
-- Once a date is assigned, new catalog additions do not reshuffle that day.

CREATE TABLE IF NOT EXISTS public.daily_cocktail_calendar (
  date_key DATE PRIMARY KEY,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS daily_cocktail_calendar_slug_idx
  ON public.daily_cocktail_calendar (slug);

ALTER TABLE public.daily_cocktail_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view daily cocktail calendar"
  ON public.daily_cocktail_calendar
  FOR SELECT
  USING (TRUE);

-- Writes are service-role only (bypasses RLS). No anon/authenticated insert policies.
