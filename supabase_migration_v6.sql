-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V6
-- Adiciona flag para visibilidade da meta 
-- ==========================================

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS show_savings_goal_on_dashboard BOOLEAN DEFAULT true;
