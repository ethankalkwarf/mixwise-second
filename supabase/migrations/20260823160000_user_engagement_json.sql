-- Sync pour streaks, mixed drinks, and onboarding checklist flags to the account.

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS engagement_json jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.user_preferences.engagement_json IS
  'Client-synced engagement: pour dates, mixed cocktail slugs, checklist flags';
