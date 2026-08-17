-- Private "won't make again" list + optional notes per user/cocktail.
-- Filtered out of Mix, dashboard recs, bar matching, and personalized email.

CREATE TABLE IF NOT EXISTS public.cocktail_skips (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL,
  cocktail_name TEXT,
  cocktail_slug TEXT,
  cocktail_image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS cocktail_skips_user_idx
  ON public.cocktail_skips (user_id, created_at DESC);

ALTER TABLE public.cocktail_skips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cocktail skips" ON public.cocktail_skips;
CREATE POLICY "Users can view their own cocktail skips"
  ON public.cocktail_skips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cocktail skips" ON public.cocktail_skips;
CREATE POLICY "Users can insert their own cocktail skips"
  ON public.cocktail_skips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cocktail skips" ON public.cocktail_skips;
CREATE POLICY "Users can update their own cocktail skips"
  ON public.cocktail_skips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cocktail skips" ON public.cocktail_skips;
CREATE POLICY "Users can delete their own cocktail skips"
  ON public.cocktail_skips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cocktail_skips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cocktail_skips TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cocktail_skips_id_seq TO authenticated, service_role;

REVOKE ALL ON TABLE public.cocktail_skips FROM anon;
