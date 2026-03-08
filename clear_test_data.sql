-- ==========================================
-- LIMPAR TODOS OS DADOS DE TESTE
-- Isso apaga transações, lembretes e pagamentos
-- NÃO apaga categorias nem configurações de usuário
-- ==========================================

-- 1. Apaga pagamentos de parcelas (depende de recurring_bills)
DELETE FROM public.bill_payments;

-- 2. Apaga todos os lembretes/contas recorrentes
DELETE FROM public.recurring_bills;

-- 3. Apaga todas as transações
DELETE FROM public.transactions;

-- Confirma
SELECT 
  (SELECT COUNT(*) FROM public.transactions) AS transactions_count,
  (SELECT COUNT(*) FROM public.recurring_bills) AS reminders_count,
  (SELECT COUNT(*) FROM public.bill_payments) AS payments_count;
