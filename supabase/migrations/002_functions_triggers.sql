-- ============================================================
-- FUNCTION: update_updated_at_column()
-- Auto-update updated_at on row modification.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_content_items_updated_at
  BEFORE UPDATE ON public.content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_reflections_updated_at
  BEFORE UPDATE ON public.reflections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_opinion_responses_updated_at
  BEFORE UPDATE ON public.opinion_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_daily_activity_updated_at
  BEFORE UPDATE ON public.daily_activity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FUNCTION: upsert_daily_activity()
-- Atomically increments daily engagement counts.
-- ============================================================
CREATE OR REPLACE FUNCTION public.upsert_daily_activity(
  p_user_id UUID,
  p_date DATE,
  p_reflection_delta INTEGER DEFAULT 0,
  p_opinion_delta INTEGER DEFAULT 0,
  p_read_delta INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.daily_activity
    (user_id, activity_date, reflections_written, opinions_answered, items_read)
  VALUES
    (p_user_id, p_date, p_reflection_delta, p_opinion_delta, p_read_delta)
  ON CONFLICT (user_id, activity_date) DO UPDATE SET
    reflections_written = daily_activity.reflections_written + EXCLUDED.reflections_written,
    opinions_answered   = daily_activity.opinions_answered   + EXCLUDED.opinions_answered,
    items_read          = daily_activity.items_read          + EXCLUDED.items_read,
    updated_at          = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: recalculate_streak()
-- Recomputes current and longest streak for a user.
-- ============================================================
CREATE OR REPLACE FUNCTION public.recalculate_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_current_streak  INTEGER := 0;
  v_longest_streak  INTEGER := 0;
  v_temp_streak     INTEGER := 0;
  v_prev_date       DATE    := NULL;
  v_row             RECORD;
  v_last_active     DATE    := NULL;
BEGIN
  -- Walk engaged days newest-to-oldest to find current streak
  FOR v_row IN
    SELECT activity_date
    FROM public.daily_activity
    WHERE user_id = p_user_id
      AND (reflections_written > 0 OR opinions_answered > 0)
    ORDER BY activity_date DESC
  LOOP
    IF v_prev_date IS NULL THEN
      v_temp_streak := 1;
      v_last_active := v_row.activity_date;
    ELSIF v_prev_date - v_row.activity_date = 1 THEN
      v_temp_streak := v_temp_streak + 1;
    ELSE
      EXIT;
    END IF;
    v_prev_date := v_row.activity_date;
  END LOOP;

  -- Streak is active only if last active day is today or yesterday
  IF v_last_active IS NOT NULL AND (CURRENT_DATE - v_last_active) <= 1 THEN
    v_current_streak := v_temp_streak;
  ELSE
    v_current_streak := 0;
  END IF;

  -- Compute longest streak (full ascending pass)
  v_temp_streak := 0;
  v_prev_date   := NULL;
  v_longest_streak := 0;
  FOR v_row IN
    SELECT activity_date
    FROM public.daily_activity
    WHERE user_id = p_user_id
      AND (reflections_written > 0 OR opinions_answered > 0)
    ORDER BY activity_date ASC
  LOOP
    IF v_prev_date IS NULL OR v_row.activity_date - v_prev_date = 1 THEN
      v_temp_streak := v_temp_streak + 1;
    ELSE
      v_temp_streak := 1;
    END IF;
    IF v_temp_streak > v_longest_streak THEN
      v_longest_streak := v_temp_streak;
    END IF;
    v_prev_date := v_row.activity_date;
  END LOOP;

  -- Upsert user_streaks
  INSERT INTO public.user_streaks
    (user_id, current_streak, longest_streak, last_active_date, total_days_active, updated_at)
  SELECT
    p_user_id,
    v_current_streak,
    v_longest_streak,
    MAX(activity_date) FILTER (WHERE reflections_written > 0 OR opinions_answered > 0),
    COUNT(*) FILTER (WHERE reflections_written > 0 OR opinions_answered > 0),
    NOW()
  FROM public.daily_activity
  WHERE user_id = p_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak    = EXCLUDED.current_streak,
    longest_streak    = EXCLUDED.longest_streak,
    last_active_date  = EXCLUDED.last_active_date,
    total_days_active = EXCLUDED.total_days_active,
    updated_at        = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: handle_new_user()
-- Auto-create user_profile and user_streaks on signup.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id) VALUES (NEW.id);
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
