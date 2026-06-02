-- =============================================
-- Migration 020: Newsletter signup enhancements
-- =============================================
-- Unsubscribe tokens and send tracking for email_signups (Thirsty Thursday, etc.)

ALTER TABLE public.email_signups
  ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS opted_out_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS email_signups_unsubscribe_token_idx
  ON public.email_signups(unsubscribe_token);

-- Backfill tokens for any legacy rows (DEFAULT handles new; this is for safety)
UPDATE public.email_signups
SET unsubscribe_token = gen_random_uuid()
WHERE unsubscribe_token IS NULL;
