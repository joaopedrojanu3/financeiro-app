-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V3
-- Adiciona campo end_date para limitar 
-- contas recorrentes / parcelas
-- ==========================================

ALTER TABLE public.recurring_bills 
ADD COLUMN IF NOT EXISTS end_date DATE DEFAULT NULL;

-- COMMENT: end_date é a data da última parcela/repetição.
-- Se NULL, o lembrete se repete indefinidamente.
-- Se preenchido, o lembrete para de ser exibido após essa data.
