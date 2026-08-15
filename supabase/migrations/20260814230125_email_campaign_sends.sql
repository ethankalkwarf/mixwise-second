-- Idempotent log for MixWise marketing / lifecycle emails.
-- send_key is 'once' for one-shot drips, or a date key (YYYY-MM-DD) for recurring sends.
-- App code always stores recipient_email in lowercase.

CREATE TABLE IF NOT EXISTS public.email_campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('account', 'list')),
  recipient_email TEXT NOT NULL CHECK (recipient_email = lower(recipient_email)),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  send_key TEXT NOT NULL,
  resend_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.email_campaign_sends IS
  'Send log for MixWise campaign emails. Unique (campaign, recipient_email, send_key) prevents duplicates.';

CREATE UNIQUE INDEX IF NOT EXISTS email_campaign_sends_unique_send
  ON public.email_campaign_sends (campaign, recipient_email, send_key);

CREATE INDEX IF NOT EXISTS email_campaign_sends_user_idx
  ON public.email_campaign_sends (user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS email_campaign_sends_email_idx
  ON public.email_campaign_sends (recipient_email, sent_at DESC);

ALTER TABLE public.email_campaign_sends ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.email_campaign_sends FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Service role has full access to email campaign sends"
  ON public.email_campaign_sends;
CREATE POLICY "Service role has full access to email campaign sends"
  ON public.email_campaign_sends
  FOR ALL
  USING ((select auth.role()) = 'service_role')
  WITH CHECK ((select auth.role()) = 'service_role');

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_campaign_sends TO service_role;

NOTIFY pgrst, 'reload schema';
