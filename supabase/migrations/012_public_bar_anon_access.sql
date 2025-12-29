-- Allow anonymous users to check if a bar is public
-- This is needed for public bar profile access

-- Add policy for anonymous read access to public_bar_enabled field
CREATE POLICY "Anonymous users can check if bar is public"
  ON public.user_preferences FOR SELECT
  USING (public_bar_enabled = true);

-- Alternative: Allow reading public_bar_enabled for any user (needed for bar visibility checks)
-- This allows anonymous users to read the public_bar_enabled field for any user
-- The actual bar ingredients are still protected by the bar_ingredients RLS policy
