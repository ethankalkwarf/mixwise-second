-- =============================================
-- Migration 010: Public Profile Slugs
-- =============================================
-- Adds username and public_slug columns to profiles table
-- Creates function to generate URL-safe public slugs
-- Adds trigger for auto-generation and backfills existing profiles
-- =============================================

-- ============================================================================
-- 1. ADD COLUMNS TO PROFILES TABLE
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE;

-- ============================================================================
-- 2. CREATE SLUG GENERATION FUNCTION
-- ============================================================================
-- Generates URL-safe public slugs using base64url encoding of random bytes
-- Short and collision-safe approach using gen_random_uuid()

CREATE OR REPLACE FUNCTION public.generate_public_slug()
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
  counter INTEGER := 0;
  max_attempts CONSTANT INTEGER := 10;
BEGIN
  -- Generate URL-safe slug from random bytes
  -- Use base64url encoding (replace + with -, / with _) and take first 8 chars
  LOOP
    -- Generate random bytes and encode as base64url, take first 8 characters
    slug := LEFT(
      REPLACE(
        REPLACE(
          ENCODE(gen_random_bytes(6), 'base64'),
          '+', '-'
        ),
        '/', '_'
      ),
      8
    );

    -- Ensure we don't have a collision
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE public_slug = slug);

    counter := counter + 1;
    IF counter >= max_attempts THEN
      -- Fallback: use timestamp + random for guaranteed uniqueness
      slug := LEFT(
        REPLACE(
          REPLACE(
            ENCODE(gen_random_bytes(6), 'base64'),
            '+', '-'
          ),
          '/', '_'
        ),
        6
      ) || EXTRACT(epoch FROM NOW())::TEXT;
      EXIT;
    END IF;
  END LOOP;

  RETURN slug;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- 3. CREATE TRIGGER FOR AUTO-GENERATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if it's NULL (don't overwrite existing slugs)
  IF NEW.public_slug IS NULL THEN
    NEW.public_slug := public.generate_public_slug();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS on_profile_created_slug ON public.profiles;
CREATE TRIGGER on_profile_created_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_slug();

-- ============================================================================
-- 4. BACKFILL EXISTING PROFILES
-- ============================================================================

-- Update existing profiles that don't have a public_slug
UPDATE public.profiles
SET public_slug = public.generate_public_slug()
WHERE public_slug IS NULL;

-- ============================================================================
-- 5. ADD INDEXES (Unique constraints already create indexes, but explicit for clarity)
-- ============================================================================

-- These indexes are created automatically by UNIQUE constraints, but making them explicit
-- Note: In PostgreSQL, UNIQUE constraints automatically create indexes, so these are optional but explicit
CREATE INDEX IF NOT EXISTS profiles_public_slug_idx ON public.profiles(public_slug);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
