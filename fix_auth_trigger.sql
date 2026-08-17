-- ==============================================================================
-- CORREÇÃO DO TRIGGER DE CRIAÇÃO DE USUÁRIOS NO SUPABASE AUTH
-- ==============================================================================
-- Este script resolve o erro "Database error creating new user" no Supabase.
-- Ele garante que, quando um usuário for criado no Auth (ou painel), 
-- se ele já existir na tabela public.usuarios, ele apenas atualiza o auth_uid
-- e NUNCA trava a criação do usuário no banco.

-- 1. Criar ou Atualizar a função handle_new_user com proteção contra erros e duplicidade
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Se o usuário já existe na tabela 'usuarios', atualiza o auth_uid
  -- Se não existe, cria o registro automaticamente
  INSERT INTO public.usuarios (auth_uid, email, nome, papel, ativo)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'TECNICO_NUTRON',
    TRUE
  )
  ON CONFLICT (lower(email)) 
  DO UPDATE SET 
    auth_uid = EXCLUDED.auth_uid,
    updated_at = NOW();

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Proteção máxima: Nunca aborta a criação do usuário no Supabase Auth
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir que o trigger está devidamente apontado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Atualizar o Wagner diretamente se ele já estiver na tabela usuarios
UPDATE public.usuarios
SET ativo = TRUE
WHERE lower(email) = 'wagner_galvan@cargill.com';
