-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V7
-- Permite que o usuário escolha quais categorias 
-- aparecem na Tela Inicial
-- ==========================================

ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS show_on_dashboard BOOLEAN DEFAULT false;

-- Vamos definir algumas como visíveis por padrão para não quebrar o layout inicial
UPDATE public.categories SET show_on_dashboard = true WHERE name IN ('Vendas de Produto', 'Serviços', 'Assinaturas', 'Salário', 'Fornecedores', 'Impostos');
