-- Ensure authenticated users can record cocktail views, and cannot write as another user.

CREATE OR REPLACE FUNCTION public.upsert_recently_viewed(
  p_user_id UUID,
  p_cocktail_id TEXT,
  p_cocktail_name TEXT DEFAULT NULL,
  p_cocktail_slug TEXT DEFAULT NULL,
  p_cocktail_image_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  INSERT INTO public.recently_viewed_cocktails (
    user_id, cocktail_id, cocktail_name, cocktail_slug, cocktail_image_url, viewed_at
  ) VALUES (
    p_user_id, p_cocktail_id, p_cocktail_name, p_cocktail_slug, p_cocktail_image_url, NOW()
  )
  ON CONFLICT (user_id, cocktail_id)
  DO UPDATE SET
    viewed_at = NOW(),
    cocktail_name = COALESCE(EXCLUDED.cocktail_name, public.recently_viewed_cocktails.cocktail_name),
    cocktail_slug = COALESCE(EXCLUDED.cocktail_slug, public.recently_viewed_cocktails.cocktail_slug),
    cocktail_image_url = COALESCE(EXCLUDED.cocktail_image_url, public.recently_viewed_cocktails.cocktail_image_url);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.upsert_recently_viewed(UUID, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_recently_viewed(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
