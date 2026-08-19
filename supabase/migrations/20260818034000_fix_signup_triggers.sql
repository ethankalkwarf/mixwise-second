-- Fix signup failures ("Database error saving new user")
--
-- Profile slug helpers ran without SECURITY DEFINER during auth signup, so RLS could
-- block slug collision checks. handle_new_user also lacked conflict/error handling.
-- Drop duplicate preferences trigger that could fire twice on profile insert.

CREATE OR REPLACE FUNCTION public.generate_public_slug()
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  max_attempts CONSTANT INTEGER := 10;
BEGIN
  LOOP
    slug := LEFT(REPLACE(gen_random_uuid()::TEXT, '-', ''), 8);

    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_slug = slug);

    counter := counter + 1;
    IF counter >= max_attempts THEN
      slug := LEFT(REPLACE(gen_random_uuid()::TEXT, '-', ''), 8)
        || EXTRACT(epoch FROM NOW())::BIGINT::TEXT;
      EXIT;
    END IF;
  END LOOP;

  RETURN slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_profile_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.public_slug IS NULL THEN
    NEW.public_slug := public.generate_public_slug();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'create_user_preferences: Failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_display_name TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  user_full_name TEXT;
BEGIN
  user_first_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  user_last_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  user_full_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '');

  IF user_full_name IS NOT NULL THEN
    user_display_name := user_full_name;
    IF user_first_name IS NULL THEN
      user_first_name := NULLIF(split_part(user_full_name, ' ', 1), '');
    END IF;
    IF user_last_name IS NULL AND position(' ' IN user_full_name) > 0 THEN
      user_last_name := NULLIF(TRIM(substring(user_full_name FROM position(' ' IN user_full_name) + 1)), '');
    END IF;
  ELSIF user_first_name IS NOT NULL THEN
    IF user_last_name IS NOT NULL THEN
      user_display_name := user_first_name || ' ' || user_last_name;
    ELSE
      user_display_name := user_first_name;
    END IF;
  ELSIF NEW.raw_user_meta_data->>'name' IS NOT NULL AND NEW.raw_user_meta_data->>'name' != '' THEN
    user_display_name := NEW.raw_user_meta_data->>'name';
  ELSIF NEW.email LIKE '%@privaterelay.appleid.com' THEN
    user_display_name := 'Apple User';
  ELSE
    user_display_name := split_part(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    first_name,
    last_name,
    avatar_url,
    role,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    user_first_name,
    user_last_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user: Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_created_slug ON public.profiles;
CREATE TRIGGER on_profile_created_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_slug();

DROP TRIGGER IF EXISTS on_profile_created_preferences ON public.profiles;
CREATE TRIGGER on_profile_created_preferences
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_preferences();

-- Legacy duplicate from migration 009; both fire on every profile insert.
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON public.profiles;
