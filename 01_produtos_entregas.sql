-- Tabela de Catálogo de Produtos
CREATE TABLE IF NOT EXISTS public.catalogo_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'Injetável', 'Vacina', 'Insumo', 'Equipamento'
    unidade_medida TEXT NOT NULL, -- 'Frasco', 'Caixa', 'Unidade', etc
    preco_base NUMERIC(10, 2) NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Entregas (ligada à visita)
CREATE TABLE IF NOT EXISTS public.visita_entregas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    visita_id UUID NOT NULL REFERENCES public.visitas(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.catalogo_produtos(id) ON DELETE RESTRICT,
    quantidade NUMERIC(10, 2) NOT NULL,
    valor_unitario_aplicado NUMERIC(10, 2) NOT NULL,
    status_faturamento TEXT NOT NULL DEFAULT 'Pendente', -- 'Pendente', 'Faturado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.catalogo_produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visita_entregas ENABLE ROW LEVEL SECURITY;

-- Políticas para catalogo_produtos
CREATE POLICY "CatProd_Sel" ON public.catalogo_produtos FOR SELECT TO authenticated USING (
    public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz()
);
CREATE POLICY "CatProd_Mod" ON public.catalogo_produtos FOR ALL TO authenticated USING (
    public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz()
) WITH CHECK (
    public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz()
);

-- Políticas para visita_entregas
CREATE POLICY "VisEnt_Sel" ON public.visita_entregas FOR SELECT TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = visita_entregas.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);
CREATE POLICY "VisEnt_Mod" ON public.visita_entregas FOR ALL TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = visita_entregas.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
) WITH CHECK (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = visita_entregas.visita_id AND visita_entregas.empresa_id = i.empresa_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);
