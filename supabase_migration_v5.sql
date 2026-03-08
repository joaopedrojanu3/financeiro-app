-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V5
-- Adiciona 'Único' como frequência válida
-- para lembretes de pagamento avulso
-- ==========================================

-- Remove o constraint antigo e cria um novo com 'Único'
ALTER TABLE public.recurring_bills 
DROP CONSTRAINT IF EXISTS recurring_bills_frequency_check;

ALTER TABLE public.recurring_bills 
ADD CONSTRAINT recurring_bills_frequency_check 
CHECK (frequency IN ('Único', 'Diário', 'Semanal', 'Mensal', 'Anual'));
