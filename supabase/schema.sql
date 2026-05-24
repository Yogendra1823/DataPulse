-- ============================================================
-- DataPulse Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ────────────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  role         TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('viewer','analyst','admin')),
  plan         TEXT NOT NULL DEFAULT 'free'    CHECK (plan IN ('free','pro','enterprise')),
  team_id      UUID,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- UPLOADS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uploads (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name      TEXT NOT NULL,
  file_size      BIGINT NOT NULL DEFAULT 0,
  row_count      INTEGER NOT NULL DEFAULT 0,
  column_names   TEXT[] NOT NULL DEFAULT '{}',
  column_mapping JSONB NOT NULL DEFAULT '{}',
  status         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','completed','failed')),
  error_message  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at DESC);

ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own uploads" ON public.uploads FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- SALES RECORDS (denormalized for fast analytics queries)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upload_id   UUID NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  record_date DATE,
  month_label TEXT,
  revenue     NUMERIC(18,2) NOT NULL DEFAULT 0,
  sales       NUMERIC(18,2),
  orders      NUMERIC(18,2),
  profit      NUMERIC(18,2),
  customers   NUMERIC(18,2),
  region      TEXT,
  product     TEXT,
  category    TEXT,
  raw_data    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_user_id   ON public.sales_records(user_id);
CREATE INDEX idx_sales_upload_id ON public.sales_records(upload_id);
CREATE INDEX idx_sales_date      ON public.sales_records(record_date DESC);
CREATE INDEX idx_sales_region    ON public.sales_records(region);
CREATE INDEX idx_sales_product   ON public.sales_records(product);

ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sales records" ON public.sales_records FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- REPORTS (saved AI-generated reports)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upload_id   UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('executive','trends','anomalies','forecast','products')),
  content     TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_pinned   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_user_id    ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reports" ON public.reports FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- AI INSIGHTS (audit log of all AI queries)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  upload_id    UUID REFERENCES public.uploads(id) ON DELETE SET NULL,
  insight_type TEXT NOT NULL,
  prompt_hash  TEXT,
  response     TEXT NOT NULL,
  model        TEXT NOT NULL,
  tokens_used  INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user_id    ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_created_at ON public.ai_insights(created_at DESC);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own ai insights" ON public.ai_insights FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- DASHBOARD SETTINGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.dashboard_settings (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme                   TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark','light','system')),
  default_date_range      TEXT NOT NULL DEFAULT '6m',
  pinned_charts           TEXT[] NOT NULL DEFAULT '{}',
  kpi_layout              TEXT[] NOT NULL DEFAULT '{}',
  notifications_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.dashboard_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own settings" ON public.dashboard_settings FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- TEAM MEMBERS (for collaboration feature)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id    UUID NOT NULL,
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  invited_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view team" ON public.team_members FOR SELECT
  USING (user_id = auth.uid() OR team_id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid()));

-- ────────────────────────────────────────────────────────────
-- UPDATED_AT trigger helper
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER set_uploads_updated_at           BEFORE UPDATE ON public.uploads           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_profiles_updated_at          BEFORE UPDATE ON public.profiles          FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_dashboard_settings_updated_at BEFORE UPDATE ON public.dashboard_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
