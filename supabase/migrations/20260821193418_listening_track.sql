-- Pinned "Listening to" Spotify track on public profiles (manual pin, not live sync)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS listening_spotify_id TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS listening_track_name TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS listening_track_artist TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_listening_spotify_id_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_listening_spotify_id_format
  CHECK (
    listening_spotify_id IS NULL
    OR listening_spotify_id ~ '^[0-9A-Za-z]{22}$'
  );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_listening_track_consistent;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_listening_track_consistent
  CHECK (
    (
      listening_spotify_id IS NULL
      AND listening_track_name IS NULL
      AND listening_track_artist IS NULL
    )
    OR (
      listening_spotify_id IS NOT NULL
      AND listening_track_name IS NOT NULL
      AND char_length(listening_track_name) BETWEEN 1 AND 200
      AND listening_track_artist IS NOT NULL
      AND char_length(listening_track_artist) BETWEEN 1 AND 200
    )
  );

COMMENT ON COLUMN public.profiles.listening_spotify_id IS
  'Pinned Spotify track id for profile embed (manual; not live now-playing).';
