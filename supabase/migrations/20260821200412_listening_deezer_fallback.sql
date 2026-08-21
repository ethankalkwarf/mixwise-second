-- Allow Deezer-backed "Listening to" pins (Spotify Web API now requires Premium for new apps)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS listening_deezer_id TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_listening_deezer_id_format;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_listening_deezer_id_format
  CHECK (
    listening_deezer_id IS NULL
    OR listening_deezer_id ~ '^[0-9]{1,20}$'
  );

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_listening_track_consistent;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_listening_track_consistent
  CHECK (
    (
      listening_spotify_id IS NULL
      AND listening_deezer_id IS NULL
      AND listening_track_name IS NULL
      AND listening_track_artist IS NULL
    )
    OR (
      (
        (listening_spotify_id IS NOT NULL AND listening_deezer_id IS NULL)
        OR (listening_spotify_id IS NULL AND listening_deezer_id IS NOT NULL)
      )
      AND listening_track_name IS NOT NULL
      AND char_length(listening_track_name) BETWEEN 1 AND 200
      AND listening_track_artist IS NOT NULL
      AND char_length(listening_track_artist) BETWEEN 1 AND 200
    )
  );

COMMENT ON COLUMN public.profiles.listening_deezer_id IS
  'Pinned Deezer track id for profile embed when Spotify Web API search is unavailable.';
