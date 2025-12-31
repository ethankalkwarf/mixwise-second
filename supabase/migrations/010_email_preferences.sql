-- =============================================
-- Migration 010: Email Preferences
-- =============================================
-- Creates table for managing email subscription preferences
-- and tracking welcome email sends
-- =============================================

-- ===================
-- EMAIL PREFERENCES TABLE
-- ===================
-- Stores user email subscription preferences
CREATE TABLE IF NOT EXISTS public.email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email subscription toggles
  welcome_emails BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  recommendations BOOLEAN NOT NULL DEFAULT true,
  product_updates BOOLEAN NOT NULL DEFAULT true,
  
  -- Tracking
  welcome_email_sent_at TIMESTAMPTZ,
  last_digest_sent_at TIMESTAMPTZ,
  unsubscribed_all_at TIMESTAMPTZ,
  
  -- Unsubscribe token for secure email links
  unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id),
  UNIQUE(unsubscribe_token)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS email_preferences_user_idx ON public.email_preferences(user_id);
CREATE INDEX IF NOT EXISTS email_preferences_token_idx ON public.email_preferences(unsubscribe_token);

-- Enable RLS
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own preferences
CREATE POLICY "Users can view their own email preferences"
  ON public.email_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own email preferences"
  ON public.email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can do anything (for sending emails server-side)
CREATE POLICY "Service role has full access to email preferences"
  ON public.email_preferences FOR ALL
  USING (auth.role() = 'service_role');

-- Allow inserts only for authenticated users creating their own row
CREATE POLICY "Users can insert their own email preferences"
  ON public.email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===================
-- AUTO-CREATE EMAIL PREFERENCES
-- ===================
-- Automatically create email_preferences row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log but don't fail user creation
  RAISE WARNING 'handle_new_user_email_preferences: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create email preferences on signup
DROP TRIGGER IF EXISTS on_auth_user_created_email_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_email_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_email_preferences();

-- ===================
-- UPDATE TIMESTAMP TRIGGER
-- ===================
CREATE OR REPLACE FUNCTION public.update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_preferences_updated_at ON public.email_preferences;
CREATE TRIGGER email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_email_preferences_updated_at();

-- ===================
-- BACKFILL EXISTING USERS
-- ===================
-- Create email_preferences for any existing users who don't have them
INSERT INTO public.email_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.email_preferences)
ON CONFLICT (user_id) DO NOTHING;

