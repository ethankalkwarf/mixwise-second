-- =============================================
-- Migration 012: Fix Apple Sign In Display Names
-- =============================================
-- Fixes display names for Apple Sign In users who chose "Hide My Email"
-- Apple provides names in raw_user_meta_data, but the trigger might miss them
-- Also improves the trigger to better handle Apple's name format
-- =============================================

-- ============================================================================
-- 1. UPDATE TRIGGER TO BETTER HANDLE APPLE SIGN IN NAMES
-- ============================================================================
-- Apple Sign In can provide names in different formats:
-- - full_name (first + last combined)
-- - first_name and last_name (separate)
-- - name (fallback)
-- We need to handle all cases, especially when email is hidden (relay email)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_display_name TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  user_full_name TEXT;
BEGIN
  -- Extract name from Apple Sign In metadata (handles multiple formats)
  user_first_name := NEW.raw_user_meta_data->>'first_name';
  user_last_name := NEW.raw_user_meta_data->>'last_name';
  user_full_name := NEW.raw_user_meta_data->>'full_name';
  
  -- Build display name in priority order:
  -- 1. full_name if provided
  -- 2. first_name + last_name combined
  -- 3. name (fallback)
  -- 4. first_name only
  -- 5. email prefix (last resort, but skip for Apple relay emails)
  
  IF user_full_name IS NOT NULL AND user_full_name != '' THEN
    user_display_name := user_full_name;
  ELSIF user_first_name IS NOT NULL AND user_first_name != '' THEN
    IF user_last_name IS NOT NULL AND user_last_name != '' THEN
      user_display_name := user_first_name || ' ' || user_last_name;
    ELSE
      user_display_name := user_first_name;
    END IF;
  ELSIF NEW.raw_user_meta_data->>'name' IS NOT NULL AND NEW.raw_user_meta_data->>'name' != '' THEN
    user_display_name := NEW.raw_user_meta_data->>'name';
  ELSIF user_first_name IS NOT NULL AND user_first_name != '' THEN
    user_display_name := user_first_name;
  -- For Apple relay emails (privaterelay.appleid.com), try to use a generic name
  ELSIF NEW.email LIKE '%@privaterelay.appleid.com' THEN
    user_display_name := 'Apple User'; -- Generic fallback for hidden email
  ELSE
    -- Last resort: use email prefix (but this will be the relay email prefix if hidden)
    user_display_name := split_part(NEW.email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    user_display_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. FIX EXISTING APPLE USERS' DISPLAY NAMES
-- ============================================================================
-- Update profiles for existing Apple Sign In users who have relay emails
-- but should have proper display names from their auth.users metadata

UPDATE public.profiles p
SET display_name = COALESCE(
  -- Try to get name from auth.users metadata
  (SELECT COALESCE(
    au.raw_user_meta_data->>'full_name',
    CASE 
      WHEN au.raw_user_meta_data->>'first_name' IS NOT NULL AND au.raw_user_meta_data->>'last_name' IS NOT NULL
      THEN au.raw_user_meta_data->>'first_name' || ' ' || au.raw_user_meta_data->>'last_name'
      ELSE au.raw_user_meta_data->>'first_name'
    END,
    au.raw_user_meta_data->>'name'
  )
  FROM auth.users au
  WHERE au.id = p.id),
  -- Fallback to generic name for Apple relay emails
  CASE 
    WHEN p.email LIKE '%@privaterelay.appleid.com' THEN 'Apple User'
    ELSE p.display_name
  END
),
updated_at = NOW()
WHERE 
  -- Only update users with Apple relay emails and bad display names
  (p.email LIKE '%@privaterelay.appleid.com' 
   OR (p.email LIKE '%@privaterelay.appleid.com' AND p.display_name ~ '^[a-z0-9]+$'))
  AND EXISTS (
    SELECT 1 
    FROM auth.users au 
    WHERE au.id = p.id 
    AND (
      au.raw_user_meta_data->>'full_name' IS NOT NULL
      OR au.raw_user_meta_data->>'first_name' IS NOT NULL
      OR au.raw_user_meta_data->>'name' IS NOT NULL
    )
  );

-- Log how many profiles were updated
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % Apple Sign In user display names', updated_count;
END $$;

