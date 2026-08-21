-- SCRIPT PARA PERMITIR QUE USUÁRIOS DE UMA EMPRESA FAÇAM VISITAS EM OUTRA
-- Execute este script no SQL Editor do seu Supabase:

ALTER TABLE public.visitas DROP CONSTRAINT IF EXISTS visitas_usuario_id_empresa_id_fkey;
