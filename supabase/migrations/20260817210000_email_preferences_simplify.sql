-- Consolidate email preference toggles into a single marketing subscription.
-- Drops unused per-type columns (welcome_emails, weekly_digest, recommendations, product_updates).

ALTER TABLE public.email_preferences
  ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN,
  ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

UPDATE public.email_preferences
SET
  marketing_emails = (
    unsubscribed_all_at IS NULL
    AND COALESCE(weekly_digest, true)
    AND COALESCE(welcome_emails, true)
  ),
  unsubscribed_at = CASE
    WHEN unsubscribed_all_at IS NOT NULL THEN unsubscribed_all_at
    WHEN weekly_digest = false OR welcome_emails = false THEN COALESCE(updated_at, NOW())
    ELSE NULL
  END
WHERE marketing_emails IS NULL;

ALTER TABLE public.email_preferences
  ALTER COLUMN marketing_emails SET DEFAULT true;

UPDATE public.email_preferences
SET marketing_emails = true
WHERE marketing_emails IS NULL;

ALTER TABLE public.email_preferences
  ALTER COLUMN marketing_emails SET NOT NULL;

ALTER TABLE public.email_preferences
  DROP COLUMN IF EXISTS welcome_emails,
  DROP COLUMN IF EXISTS weekly_digest,
  DROP COLUMN IF EXISTS recommendations,
  DROP COLUMN IF EXISTS product_updates,
  DROP COLUMN IF EXISTS unsubscribed_all_at;
