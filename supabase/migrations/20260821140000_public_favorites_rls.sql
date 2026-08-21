-- Public favorites for activity feeds + public bar profiles
DROP POLICY IF EXISTS "Favorites viewable by owner or public when enabled" ON public.favorites;
DROP POLICY IF EXISTS "Users manage their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can update their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can view their own favorites" ON public.favorites;

-- Prefer granular policies over FOR ALL so public SELECT can coexist
CREATE POLICY "Favorites viewable by owner or public when enabled"
  ON public.favorites
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = favorites.user_id
        AND up.public_bar_enabled = true
    )
  );

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.favorites
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);
