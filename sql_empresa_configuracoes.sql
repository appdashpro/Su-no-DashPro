-- Create the table for company configurations
CREATE TABLE IF NOT EXISTS public.empresa_configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    tipo_calculo_curva TEXT DEFAULT 'CRONOLOGICO_DIA1',
    meta_mortalidade NUMERIC(5,2),
    medicamentos_permitidos JSONB DEFAULT '[]'::jsonb,
    causas_mortalidade JSONB DEFAULT '[]'::jsonb,
    curva_desempenho JSONB DEFAULT '[]'::jsonb,
    programa_alimentar JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(empresa_id)
);

-- Enable RLS
ALTER TABLE public.empresa_configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies (modify according to your auth roles if needed)
CREATE POLICY "Enable read access for all authenticated users" 
    ON public.empresa_configuracoes FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for master users" 
    ON public.empresa_configuracoes FOR ALL 
    USING (auth.role() = 'authenticated' AND ((auth.jwt() ->> 'papel')::text = 'MASTER' OR (auth.jwt() ->> 'papel')::text = 'SUPER_ADMIN'));

