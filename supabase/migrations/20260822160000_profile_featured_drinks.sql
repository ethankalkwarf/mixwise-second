-- Profile featured drinks: up to 3 pinned favorites shown on public bar hero
CREATE TABLE IF NOT EXISTS public.profile_featured_drinks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cocktail_id UUID NOT NULL,
  rank SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 3),
  cocktail_name TEXT,
  cocktail_slug TEXT,
  cocktail_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, rank),
  UNIQUE (user_id, cocktail_id)
);

CREATE INDEX IF NOT EXISTS profile_featured_drinks_user_idx
  ON public.profile_featured_drinks(user_id);

ALTER TABLE public.profile_featured_drinks ENABLE ROW LEVEL SECURITY;

-- Owners manage their own featured drinks
CREATE POLICY "Users manage own featured drinks"
  ON public.profile_featured_drinks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public read when bar is public
CREATE POLICY "Featured drinks viewable when public bar enabled"
  ON public.profile_featured_drinks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = profile_featured_drinks.user_id
        AND up.public_bar_enabled = true
    )
  );
