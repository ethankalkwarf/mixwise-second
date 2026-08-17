-- Private tasting notes for any cocktail, independent of skip/favorite.
-- Copies existing skip notes so nothing is lost, then drops notes off skips.

CREATE TABLE IF NOT EXISTS public.cocktail_notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id TEXT NOT NULL,
  cocktail_name TEXT,
  cocktail_slug TEXT,
  cocktail_image_url TEXT,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS cocktail_notes_user_idx
  ON public.cocktail_notes (user_id, updated_at DESC);

ALTER TABLE public.cocktail_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cocktail notes" ON public.cocktail_notes;
CREATE POLICY "Users can view their own cocktail notes"
  ON public.cocktail_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cocktail notes" ON public.cocktail_notes;
CREATE POLICY "Users can insert their own cocktail notes"
  ON public.cocktail_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cocktail notes" ON public.cocktail_notes;
CREATE POLICY "Users can update their own cocktail notes"
  ON public.cocktail_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cocktail notes" ON public.cocktail_notes;
CREATE POLICY "Users can delete their own cocktail notes"
  ON public.cocktail_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cocktail_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cocktail_notes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.cocktail_notes_id_seq TO authenticated, service_role;
REVOKE ALL ON TABLE public.cocktail_notes FROM anon;

INSERT INTO public.cocktail_notes (
  user_id,
  cocktail_id,
  cocktail_name,
  cocktail_slug,
  cocktail_image_url,
  notes,
  created_at,
  updated_at
)
SELECT
  user_id,
  cocktail_id,
  cocktail_name,
  cocktail_slug,
  cocktail_image_url,
  notes,
  created_at,
  updated_at
FROM public.cocktail_skips
WHERE notes IS NOT NULL AND btrim(notes) <> ''
ON CONFLICT (user_id, cocktail_id) DO NOTHING;

ALTER TABLE public.cocktail_skips DROP COLUMN IF EXISTS notes;
