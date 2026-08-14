-- ============================================================================
-- Email list signups (homepage / footer / Thirsty Thursday / wedding finder)
--
-- Production was missing this table — POST /api/email/signup 404'd against
-- PostgREST (PGRST205) so every list signup failed.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_signups (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'newsletter',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (email, source)
);

CREATE INDEX IF NOT EXISTS email_signups_email_idx ON public.email_signups(email);
CREATE INDEX IF NOT EXISTS email_signups_source_idx ON public.email_signups(source);

ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert email signups" ON public.email_signups;
CREATE POLICY "Anyone can insert email signups"
  ON public.email_signups
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can read email signups" ON public.email_signups;
CREATE POLICY "Service role can read email signups"
  ON public.email_signups
  FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update email signups" ON public.email_signups;
CREATE POLICY "Service role can update email signups"
  ON public.email_signups
  FOR UPDATE
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can delete email signups" ON public.email_signups;
CREATE POLICY "Service role can delete email signups"
  ON public.email_signups
  FOR DELETE
  USING (auth.role() = 'service_role');

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_signups TO service_role;
GRANT INSERT ON TABLE public.email_signups TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.email_signups_id_seq TO service_role, anon, authenticated;

NOTIFY pgrst, 'reload schema';
