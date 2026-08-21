-- Phone findability (hashed only) + invite attribution helper index

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_hash TEXT,
  ADD COLUMN IF NOT EXISTS phone_findable BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_hash_unique
  ON public.profiles (phone_hash)
  WHERE phone_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_phone_findable_idx
  ON public.profiles (phone_findable)
  WHERE phone_findable = TRUE AND phone_hash IS NOT NULL;

COMMENT ON COLUMN public.profiles.phone_hash IS
  'HMAC-SHA256 of E.164 phone; never store plaintext numbers';
COMMENT ON COLUMN public.profiles.phone_findable IS
  'Opt-in: allow friends who have this number to find you via contact match';
