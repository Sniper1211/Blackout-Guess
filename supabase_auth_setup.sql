-- Supabase Auth & RLS setup for game_sessions
-- 1) Add columns for authenticated users
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS user_id uuid NULL REFERENCES auth.users (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS username text NULL;

-- 2) Enable RLS (if not already)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- 3) Policies
-- Allow public read (leaderboard needs anonymous SELECT)
DROP POLICY IF EXISTS "Public read leaderboard" ON public.game_sessions;
CREATE POLICY "Public read leaderboard"
  ON public.game_sessions
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own records
DROP POLICY IF EXISTS "Authenticated insert owns row" ON public.game_sessions;
CREATE POLICY "Authenticated insert owns row"
  ON public.game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL -- allow null during transition, but prefer auth.uid()
  );

-- Optional: prevent updates/deletes (immutable scoreboard)
DROP POLICY IF EXISTS "No updates by public" ON public.game_sessions;
CREATE POLICY "No updates by public"
  ON public.game_sessions
  FOR UPDATE
  TO public
  USING (false);

DROP POLICY IF EXISTS "No deletes by public" ON public.game_sessions;
CREATE POLICY "No deletes by public"
  ON public.game_sessions
  FOR DELETE
  TO public
  USING (false);

-- Index suggestion for leaderboard ordering
CREATE INDEX IF NOT EXISTS idx_game_sessions_score_created_at
  ON public.game_sessions (score DESC, created_at DESC);

-- NOTE:
-- - Configure Google provider in Supabase Dashboard > Authentication > Providers.
-- - Set Redirect URLs to your site origin, e.g., http://localhost:8000/ and https://sniper1211.github.io/Blackout-Guess/.
-- - After enabling provider, client-side signInWithOAuth will redirect back to the site.