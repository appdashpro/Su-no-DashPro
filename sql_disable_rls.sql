-- SCRIPT SQL PARA DESABILITAR / PERMITIR RLS NO SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase se houver bloqueios de RLS:

-- 1. Desabilitar RLS nas tabelas principais para permitir sincronização e leitura direta
ALTER TABLE IF EXISTS public.integrados DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.visitas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.curvas_referencia DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.medicamentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tratamentos DISABLE ROW LEVEL SECURITY;

-- 2. Caso prefira manter RLS ativado com política 100% permissiva (sem bloqueios):
/*
ALTER TABLE public.integrados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissao Total Integrados" ON public.integrados FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissao Total Visitas" ON public.visitas FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permissao Total Usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
*/
