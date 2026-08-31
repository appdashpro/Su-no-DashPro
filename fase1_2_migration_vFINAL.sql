-- 1. TABELA RELACIONAL DE PERMISSÕES
CREATE TABLE IF NOT EXISTS public.usuario_empresas_permitidas (
    usuario_id UUID NOT NULL,
    empresa_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, empresa_id)
);

-- 2. CHAVES ESTRANGEIRAS (NOT VALID preserva os dados legados)
ALTER TABLE public.usuario_empresas_permitidas ADD CONSTRAINT fk_perm_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
ALTER TABLE public.usuario_empresas_permitidas ADD CONSTRAINT fk_perm_empresa FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) ON DELETE CASCADE;
ALTER TABLE public.integrados ADD CONSTRAINT fk_int_empresa FOREIGN KEY (empresa_id) REFERENCES public.empresas(id) NOT VALID;
ALTER TABLE public.lotes ADD CONSTRAINT fk_lot_integrado FOREIGN KEY (integrado_id) REFERENCES public.integrados(id) NOT VALID;
ALTER TABLE public.visitas ADD CONSTRAINT fk_vis_lote FOREIGN KEY (lote_id) REFERENCES public.lotes(id) NOT VALID;
ALTER TABLE public.cargas_racao ADD CONSTRAINT fk_carg_visita FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.tratamentos ADD CONSTRAINT fk_trat_visita FOREIGN KEY (visita_id) REFERENCES public.visitas(id) ON DELETE CASCADE NOT VALID;

-- 3. MIGRAÇÃO SEGURA DOS ARRAYS (Com filtro Regex UUID)
INSERT INTO public.usuario_empresas_permitidas (usuario_id, empresa_id)
SELECT id, CAST(emp_id AS UUID)
FROM (
    SELECT id, unnest(clientes_permitidos) AS emp_id FROM public.usuarios WHERE clientes_permitidos IS NOT NULL
) t
WHERE emp_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ON CONFLICT DO NOTHING;

-- 4. FUNÇÕES RLS BLINDADAS
CREATE OR REPLACE FUNCTION public.get_minhas_empresas() RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY SELECT empresa_id FROM public.usuario_empresas_permitidas
    WHERE usuario_id = (SELECT id FROM public.usuarios WHERE auth_uid = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_master() RETURNS BOOLEAN AS $$
DECLARE v_papel TEXT;
BEGIN
    SELECT papel INTO v_papel FROM public.usuarios WHERE auth_uid = auth.uid();
    RETURN v_papel IN ('MASTER', 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_minha_empresa_matriz() RETURNS UUID AS $$
DECLARE v_empresa_id UUID;
BEGIN
    SELECT empresa_id INTO v_empresa_id FROM public.usuarios WHERE auth_uid = auth.uid();
    RETURN v_empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.get_minhas_empresas() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_master() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_minha_empresa_matriz() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_minhas_empresas() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_master() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_minha_empresa_matriz() TO authenticated;

-- 5. HABILITAÇÃO DO RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_empresas_permitidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas_racao ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tratamentos') THEN
        ALTER TABLE public.tratamentos ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'curvas') THEN
        ALTER TABLE public.curvas ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medicamentos') THEN
        ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 6. POLÍTICAS DE ACESSO (STRICT)

-- A) Controle Administrativo
CREATE POLICY "Usr_Sel" ON public.usuarios FOR SELECT TO authenticated USING (auth_uid = auth.uid() OR public.is_master());
CREATE POLICY "Usr_Mod" ON public.usuarios FOR ALL TO authenticated USING (public.is_master()) WITH CHECK (public.is_master());
CREATE POLICY "Perm_Sel" ON public.usuario_empresas_permitidas FOR SELECT TO authenticated USING (usuario_id = (SELECT id FROM public.usuarios WHERE auth_uid = auth.uid() LIMIT 1) OR public.is_master());
CREATE POLICY "Perm_Mod" ON public.usuario_empresas_permitidas FOR ALL TO authenticated USING (public.is_master()) WITH CHECK (public.is_master());

-- B) Empresa e Integrados
CREATE POLICY "Emp_Sel" ON public.empresas FOR SELECT TO authenticated USING (public.is_master() OR id IN (SELECT public.get_minhas_empresas()) OR id = public.get_minha_empresa_matriz());
CREATE POLICY "Emp_Mod" ON public.empresas FOR ALL TO authenticated USING (public.is_master()) WITH CHECK (public.is_master());
CREATE POLICY "Int_Sel" ON public.integrados FOR SELECT TO authenticated USING (public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz());
CREATE POLICY "Int_Mod" ON public.integrados FOR ALL TO authenticated USING (public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz()) WITH CHECK (public.is_master() OR empresa_id IN (SELECT public.get_minhas_empresas()) OR empresa_id = public.get_minha_empresa_matriz());

-- C) Lotes (Anti-Spoofing embutido)
CREATE POLICY "Lot_Sel" ON public.lotes FOR SELECT TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.integrados i WHERE i.id = lotes.integrado_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);
CREATE POLICY "Lot_Mod" ON public.lotes FOR ALL TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.integrados i WHERE i.id = lotes.integrado_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
) WITH CHECK (
    public.is_master() OR EXISTS (SELECT 1 FROM public.integrados i WHERE i.id = lotes.integrado_id AND lotes.empresa_id = i.empresa_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);

-- D) Visitas (Hierarquia Profunda)
CREATE POLICY "Vis_Sel" ON public.visitas FOR SELECT TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.lotes l INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE l.id = visitas.lote_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);
CREATE POLICY "Vis_Mod" ON public.visitas FOR ALL TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.lotes l INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE l.id = visitas.lote_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
) WITH CHECK (
    public.is_master() OR EXISTS (SELECT 1 FROM public.lotes l INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE l.id = visitas.lote_id AND visitas.empresa_id = i.empresa_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);

-- E) Cargas e Tratamentos (Acompanham Visita)
CREATE POLICY "Carg_Sel" ON public.cargas_racao FOR SELECT TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = cargas_racao.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);
CREATE POLICY "Carg_Mod" ON public.cargas_racao FOR ALL TO authenticated USING (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = cargas_racao.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
) WITH CHECK (
    public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = cargas_racao.visita_id AND cargas_racao.empresa_id = i.empresa_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tratamentos') THEN
        EXECUTE 'CREATE POLICY "Trat_Sel" ON public.tratamentos FOR SELECT TO authenticated USING (
            public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = tratamentos.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
        )';
        EXECUTE 'CREATE POLICY "Trat_Mod" ON public.tratamentos FOR ALL TO authenticated USING (
            public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = tratamentos.visita_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
        ) WITH CHECK (
            public.is_master() OR EXISTS (SELECT 1 FROM public.visitas v INNER JOIN public.lotes l ON v.lote_id = l.id INNER JOIN public.integrados i ON l.integrado_id = i.id WHERE v.id = tratamentos.visita_id AND tratamentos.empresa_id = i.empresa_id AND (i.empresa_id IN (SELECT public.get_minhas_empresas()) OR i.empresa_id = public.get_minha_empresa_matriz()))
        )';
    END IF;
END $$;

-- F) Curvas e Medicamentos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'curvas') THEN
        EXECUTE 'CREATE POLICY "Curvas_Sel" ON public.curvas FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "Curvas_Mod" ON public.curvas FOR ALL TO authenticated USING (public.is_master()) WITH CHECK (public.is_master())';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medicamentos') THEN
        EXECUTE 'CREATE POLICY "Med_Sel" ON public.medicamentos FOR SELECT TO authenticated USING (true)';
        EXECUTE 'CREATE POLICY "Med_Mod" ON public.medicamentos FOR ALL TO authenticated USING (public.is_master()) WITH CHECK (public.is_master())';
    END IF;
END $$;

