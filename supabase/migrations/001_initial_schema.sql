-- ============================================================
-- PMVIBE Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: content_items
-- Aggregated content from Product Hunt and Lenny RSS.
-- Written exclusively by n8n (service_role).
-- ============================================================
CREATE TABLE public.content_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source            TEXT NOT NULL CHECK (source IN ('product_hunt', 'lenny')),
  external_id       TEXT NOT NULL,
  source_url        TEXT NOT NULL,
  title             TEXT NOT NULL,
  tagline           TEXT,
  thumbnail_url     TEXT,
  author            TEXT,
  published_at      TIMESTAMPTZ NOT NULL,
  ai_summary        TEXT,
  ai_key_insights   JSONB,
  ai_opinion_prompts JSONB,
  ai_processed_at   TIMESTAMPTZ,
  raw_data          JSONB,
  ingested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_items_source_external_id_key UNIQUE (source, external_id)
);

CREATE INDEX idx_content_items_published_at ON public.content_items (published_at DESC);
CREATE INDEX idx_content_items_source ON public.content_items (source);

-- ============================================================
-- TABLE: reflections
-- User free-form journal entries tied to a content item.
-- ============================================================
CREATE TABLE public.reflections (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reflections_user_content_unique UNIQUE (user_id, content_item_id)
);

CREATE INDEX idx_reflections_user_id ON public.reflections (user_id);
CREATE INDEX idx_reflections_content_item_id ON public.reflections (content_item_id);
CREATE INDEX idx_reflections_created_at ON public.reflections (created_at DESC);

-- ============================================================
-- TABLE: opinion_responses
-- Structured answers to PM opinion prompts.
-- ============================================================
CREATE TABLE public.opinion_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  prompt_index    INTEGER NOT NULL CHECK (prompt_index >= 0 AND prompt_index <= 9),
  prompt_text     TEXT NOT NULL,
  response_body   TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT opinion_responses_user_content_prompt_unique
    UNIQUE (user_id, content_item_id, prompt_index)
);

CREATE INDEX idx_opinion_responses_user_id ON public.opinion_responses (user_id);
CREATE INDEX idx_opinion_responses_content_item_id ON public.opinion_responses (content_item_id);

-- ============================================================
-- TABLE: daily_activity
-- One row per user per calendar day.
-- ============================================================
CREATE TABLE public.daily_activity (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date   DATE NOT NULL,
  items_read      INTEGER NOT NULL DEFAULT 0,
  reflections_written INTEGER NOT NULL DEFAULT 0,
  opinions_answered   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT daily_activity_user_date_unique UNIQUE (user_id, activity_date)
);

CREATE INDEX idx_daily_activity_user_id ON public.daily_activity (user_id);
CREATE INDEX idx_daily_activity_date ON public.daily_activity (activity_date DESC);

-- ============================================================
-- TABLE: user_streaks
-- One row per user, tracks current and longest streak.
-- ============================================================
CREATE TABLE public.user_streaks (
  user_id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak    INTEGER NOT NULL DEFAULT 0,
  longest_streak    INTEGER NOT NULL DEFAULT 0,
  last_active_date  DATE,
  total_days_active INTEGER NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: user_profiles
-- Extended user data.
-- ============================================================
CREATE TABLE public.user_profiles (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT,
  pm_experience_level TEXT CHECK (pm_experience_level IN ('aspiring', 'junior', 'mid', 'senior')),
  preferred_sources TEXT[] DEFAULT ARRAY['product_hunt', 'lenny'],
  onboarded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
