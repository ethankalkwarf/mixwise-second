-- =============================================
-- Social profiles: bio, follows, avatars, public badges
-- =============================================

-- 1. Public bio on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_bio_length;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 160);

-- 2. Follow graph
CREATE TABLE IF NOT EXISTS public.user_follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id),
  CONSTRAINT user_follows_no_self CHECK (follower_id <> followee_id)
);

CREATE INDEX IF NOT EXISTS user_follows_followee_idx
  ON public.user_follows (followee_id);

CREATE INDEX IF NOT EXISTS user_follows_follower_idx
  ON public.user_follows (follower_id);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view follows involving public bars or self"
  ON public.user_follows;
DROP POLICY IF EXISTS "Users can follow others"
  ON public.user_follows;
DROP POLICY IF EXISTS "Users can unfollow"
  ON public.user_follows;

-- Anyone can see follow edges where either side is the viewer,
-- or the followee has a public bar (so follower counts / lists work on public profiles).
CREATE POLICY "Users can view follows involving public bars or self"
  ON public.user_follows
  FOR SELECT
  USING (
    auth.uid() = follower_id
    OR auth.uid() = followee_id
    OR EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = user_follows.followee_id
        AND up.public_bar_enabled = true
    )
  );

CREATE POLICY "Users can follow others"
  ON public.user_follows
  FOR INSERT
  WITH CHECK (
    auth.uid() = follower_id
    AND EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = followee_id
        AND up.public_bar_enabled = true
    )
  );

CREATE POLICY "Users can unfollow"
  ON public.user_follows
  FOR DELETE
  USING (auth.uid() = follower_id);

-- 3. Public badge reads for public bar profiles (tier display)
DROP POLICY IF EXISTS "Users can view all badges for public profiles" ON public.user_badges;
DROP POLICY IF EXISTS "Badges viewable by owner or public when enabled" ON public.user_badges;

CREATE POLICY "Badges viewable by owner or public when enabled"
  ON public.user_badges
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.user_preferences up
      WHERE up.user_id = user_badges.user_id
        AND up.public_bar_enabled = true
    )
  );

-- 4. Avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
