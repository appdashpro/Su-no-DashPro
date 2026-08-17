-- Remover a amarração com a tabela curvas
ALTER TABLE public.lotes DROP CONSTRAINT IF EXISTS lotes_curva_id_fkey;
ALTER TABLE public.lotes DROP COLUMN IF EXISTS curva_id;

-- Podemos até remover a tabela curvas se não for mais ser usada no banco
DROP TABLE IF EXISTS public.curvas CASCADE;
