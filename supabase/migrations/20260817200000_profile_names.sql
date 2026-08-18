-- Add optional first/last name columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update signup trigger to populate name fields from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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

  INSERT INTO public.profiles (id, email, display_name, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    user_first_name,
    user_last_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing users from auth metadata
UPDATE public.profiles p
SET
  first_name = COALESCE(
    NULLIF(TRIM(p.first_name), ''),
    NULLIF(TRIM(au.raw_user_meta_data->>'first_name'), ''),
    NULLIF(split_part(NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''), ' ', 1), '')
  ),
  last_name = COALESCE(
    NULLIF(TRIM(p.last_name), ''),
    NULLIF(TRIM(au.raw_user_meta_data->>'last_name'), ''),
    CASE
      WHEN position(' ' IN NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), '')) > 0
      THEN NULLIF(
        TRIM(substring(
          NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), '')
          FROM position(' ' IN NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), '')) + 1
        )),
        ''
      )
      ELSE NULL
    END
  ),
  updated_at = NOW()
FROM auth.users au
WHERE au.id = p.id
  AND (
    p.first_name IS NULL
    OR p.last_name IS NULL
  );
