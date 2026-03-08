-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V4
-- Tabela de pagamentos individuais de parcelas
-- ==========================================

-- Cada pagamento de uma parcela individual é registrado aqui
-- O recurring_bill continua ativo; só a parcela específica é marcada
CREATE TABLE IF NOT EXISTS public.bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_bill_id UUID NOT NULL REFERENCES public.recurring_bills(id) ON DELETE CASCADE,
    occurrence_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- Triggers
CREATE TRIGGER update_bill_payments_modtime
BEFORE UPDATE ON public.bill_payments
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_bill_payments_version
BEFORE UPDATE ON public.bill_payments
FOR EACH ROW EXECUTE PROCEDURE increment_version_id();

-- Realtime e RLS
ALTER publication supabase_realtime ADD TABLE public.bill_payments;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON public.bill_payments FOR ALL USING (true);
