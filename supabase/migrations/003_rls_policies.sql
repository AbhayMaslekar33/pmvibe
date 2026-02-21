-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.content_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- content_items: read-only for authenticated users
-- n8n uses service_role key (bypasses RLS entirely)
-- ============================================================
CREATE POLICY "content_items_read_authenticated"
  ON public.content_items FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- reflections: users manage only their own rows
-- ============================================================
CREATE POLICY "reflections_select_own"
  ON public.reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "reflections_insert_own"
  ON public.reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reflections_update_own"
  ON public.reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reflections_delete_own"
  ON public.reflections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- opinion_responses: users manage only their own rows
-- ============================================================
CREATE POLICY "opinion_responses_select_own"
  ON public.opinion_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "opinion_responses_insert_own"
  ON public.opinion_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "opinion_responses_update_own"
  ON public.opinion_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- user_streaks: read-only for owning user
-- Writes happen via SECURITY DEFINER functions
-- ============================================================
CREATE POLICY "user_streaks_select_own"
  ON public.user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- daily_activity: read-only for owning user
-- Writes happen via SECURITY DEFINER functions
-- ============================================================
CREATE POLICY "daily_activity_select_own"
  ON public.daily_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- user_profiles: users manage only their own profile
-- ============================================================
CREATE POLICY "user_profiles_select_own"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
