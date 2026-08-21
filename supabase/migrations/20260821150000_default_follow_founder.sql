-- Auto-follow MixWise founder (@ethankalkwarf) for every new profile.
-- Users can unfollow later; this only seeds the initial follow graph.

CREATE OR REPLACE FUNCTION public.follow_founder_on_profile_create()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  founder_id UUID;
BEGIN
  SELECT id INTO founder_id
  FROM public.profiles
  WHERE username = 'ethankalkwarf'
  LIMIT 1;

  IF founder_id IS NULL OR founder_id = NEW.id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.user_follows (follower_id, followee_id)
  VALUES (NEW.id, founder_id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'follow_founder_on_profile_create: %', SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_follow_founder ON public.profiles;
CREATE TRIGGER on_profile_created_follow_founder
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.follow_founder_on_profile_create();

-- Backfill: existing users follow the founder (unless already following / is founder)
INSERT INTO public.user_follows (follower_id, followee_id)
SELECT p.id, f.id
FROM public.profiles p
CROSS JOIN public.profiles f
WHERE f.username = 'ethankalkwarf'
  AND p.id <> f.id
ON CONFLICT DO NOTHING;
