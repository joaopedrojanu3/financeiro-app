-- ==========================================
-- DELTA ZERO: SUPABASE SCHEMA MIGRATION V8
-- Sistema Multi-usuário e Permissões Administrativas
-- ==========================================

-- 1. Criação da tabela de perfis de usuário caso não exista e adição das colunas
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    company_name TEXT,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version_id INTEGER DEFAULT 1
);

-- Adiciona is_admin caso a tabela já exista
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Garante a trigger de criação automática de profile quando um usuário for criado no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_super_admin BOOLEAN := false;
BEGIN
  -- Define o super admin fixo
  IF new.email = 'joaopedrojanu3@gmail.com' THEN
    is_super_admin := true;
  END IF;

  INSERT INTO public.user_profiles (user_id, full_name, is_admin)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', is_super_admin);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar usuários existentes caso o joaopedrojanu3@gmail.com já tenha sido criado
UPDATE public.user_profiles
SET is_admin = true
WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'joaopedrojanu3@gmail.com'
);

-- Criação do trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Adição da coluna user_id nas tabelas operacionais
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.recurring_bills ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.bill_payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Atualização das Policies (RLS) - Se habilitado
-- IMPORTANTE: Para implementar RLS seguro baseado no usuário.

-- Primeiro, desativa as políticas de "Enable all for development" que estavam na V1
DROP POLICY IF EXISTS "Enable all for development" ON public.transactions;
DROP POLICY IF EXISTS "Enable all for development" ON public.categories;
DROP POLICY IF EXISTS "Enable all for development" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable all for development" ON public.recurring_bills;
DROP POLICY IF EXISTS "Enable all for development" ON public.bill_payments;

-- Em vez de RLS complexo (já que a lógica de "admin" e validação ficará nas API Routes do Next.js pelo SSOT)
-- Podemos manter RLS habilitado mas deixar que apenas o SERVICE ROLE (que interage via backend) gerencie isso,
-- OU, se usarmos o client supabase com RLS para selects:
-- Apenas usuários logados podem ver; Admins podem ver de tudo (ou a lógica de Admin ficará na API).
-- Por agora, restauramos a política que permite uso geral, já que o SSOT do backend fará a validação do user_id.

DROP POLICY IF EXISTS "Enable dev access" ON public.transactions;
CREATE POLICY "Enable dev access" ON public.transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable dev access" ON public.categories;
CREATE POLICY "Enable dev access" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable dev access" ON public.user_profiles;
CREATE POLICY "Enable dev access" ON public.user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable dev access" ON public.recurring_bills;
CREATE POLICY "Enable dev access" ON public.recurring_bills FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable dev access" ON public.bill_payments;
CREATE POLICY "Enable dev access" ON public.bill_payments FOR ALL USING (true);

-- Nota: Como o app vai ser usado pelo Next.js API Routes SSOT, não precisamos restringir o RLS tão duramente aqui 
-- (a validação será feita no código Next.js API onde vamos checar requests).
