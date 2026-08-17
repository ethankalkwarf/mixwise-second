-- Learn progress: saved lesson completions, XP, and check scores for signed-in users.

CREATE TABLE IF NOT EXISTS public.learn_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_kind TEXT NOT NULL CHECK (lesson_kind IN ('guide', 'method', 'technique', 'path')),
  lesson_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  xp INTEGER NOT NULL DEFAULT 0,
  checks_correct INTEGER NOT NULL DEFAULT 0,
  checks_total INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lesson_kind, lesson_slug)
);

CREATE INDEX IF NOT EXISTS learn_progress_user_idx
  ON public.learn_progress (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS learn_progress_user_status_idx
  ON public.learn_progress (user_id, status);

ALTER TABLE public.learn_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own learn progress" ON public.learn_progress;
CREATE POLICY "Users can view their own learn progress"
  ON public.learn_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own learn progress" ON public.learn_progress;
CREATE POLICY "Users can insert their own learn progress"
  ON public.learn_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own learn progress" ON public.learn_progress;
CREATE POLICY "Users can update their own learn progress"
  ON public.learn_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own learn progress" ON public.learn_progress;
CREATE POLICY "Users can delete their own learn progress"
  ON public.learn_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learn_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learn_progress TO service_role;
REVOKE ALL ON TABLE public.learn_progress FROM anon;

DROP TRIGGER IF EXISTS update_learn_progress_updated_at ON public.learn_progress;
CREATE TRIGGER update_learn_progress_updated_at
  BEFORE UPDATE ON public.learn_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
