-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION 
-- ==========================================

-- 1. Criação das Funções de Trigger Globais

-- Atualiza a coluna updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Incrementa a coluna version_id e garante o SSOT
CREATE OR REPLACE FUNCTION increment_version_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.version_id = OLD.version_id + 1;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ==========================================
-- 2. Criação das Tabelas
-- ==========================================

-- Tabela: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- Tabela: transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- Tabela: users (informações adicionais do admin/sistema, não substitui o auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Referência ao auth.users, se for o caso
    full_name TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- ==========================================
-- 3. Aplicação das Triggers nas Tabelas
-- ==========================================

-- Categorias
CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_categories_version
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE PROCEDURE increment_version_id();

-- Transações
CREATE TRIGGER update_transactions_modtime
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_transactions_version
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE PROCEDURE increment_version_id();

-- Perfis de Usuário
CREATE TRIGGER update_user_profiles_modtime
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER increment_user_profiles_version
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE PROCEDURE increment_version_id();

-- ==========================================
-- 4. Inserção de Dados Iniciais (Seed)
-- ==========================================

INSERT INTO public.categories (name, type, color, icon) VALUES
('Vendas de Produto', 'income', '#10B981', 'shopping-cart'),
('Serviços', 'income', '#3B82F6', 'briefcase'),
('Assinaturas', 'income', '#8B5CF6', 'calendar'),
('Salário', 'expense', '#EF4444', 'user'),
('Fornecedores', 'expense', '#F59E0B', 'truck'),
('Software', 'expense', '#EC4899', 'monitor'),
('Impostos', 'expense', '#6366F1', 'file-text')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. Configuração do Realtime
-- ==========================================

-- Ativar realtime para as tabelas principais
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.transactions;

-- Habilitar RLS (Row Level Security) - Por enquanto permitindo all para facilitar desenvolvimento,
-- mas num app de prod deve ser ajustado para 'auth.uid() = user_id'
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON public.categories FOR ALL USING (true);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON public.transactions FOR ALL USING (true);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for development" ON public.user_profiles FOR ALL USING (true);
