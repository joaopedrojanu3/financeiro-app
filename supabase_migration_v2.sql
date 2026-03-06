-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V2
-- ==========================================

-- 1. Novas Colunas em user_profiles para Metas Financeiras
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS monthly_spending_goal DECIMAL(12, 2) DEFAULT 2000.00,
ADD COLUMN IF NOT EXISTS monthly_income_goal DECIMAL(12, 2) DEFAULT 1500.00;

-- 2. Tabela de Lembretes / Contas Futuras (recurring_bills)
CREATE TABLE IF NOT EXISTS public.recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    due_date DATE NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('Diário', 'Semanal', 'Mensal', 'Anual')),
    is_active BOOLEAN DEFAULT TRUE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- 3. Triggers para a nova tabela
CREATE TRIGGER update_recurring_bills_modtime
BEFORE UPDATE ON public.recurring_bills
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_recurring_bills_version
BEFORE UPDATE ON public.recurring_bills
FOR EACH ROW EXECUTE PROCEDURE increment_version_id();

-- 4. Realtime e Segurança
alter publication supabase_realtime add table public.recurring_bills;

ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON public.recurring_bills FOR ALL USING (true);
