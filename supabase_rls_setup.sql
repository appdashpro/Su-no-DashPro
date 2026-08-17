-- ==============================================================================
-- SUÍNO DASHPRO - CONFIGURAÇÃO RESILIENTE DE RLS (TABELA ÚNICA: USUARIOS)
-- ==============================================================================
-- Hierarquia e Posicionamento centralizado na tabela public.usuarios:
-- 1. MASTER: Roger Francescon (rogerfrancescon@gmail.com) -> Controle total irrestrito.
-- 2. TÉCNICO NUTRON: Consultor Nutron -> Carteira de clientes em 'clientes_permitidos'.
-- 3. TÉCNICO CLIENTE: Técnico da Rações Pastre -> Acesso apenas ao seu cliente/granja.
-- ==============================================================================

-- 0. EXTENSÃO UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover tabela de vínculo se tiver sido criada anteriormente
DROP TABLE IF EXISTS public.tecnico_integrados CASCADE;

-- ==============================================================================
-- 1. GARANTIR TABELAS: EMPRESAS E USUÁRIOS
-- ==============================================================================

-- 1.1 Tabela de Empresas (Clientes e Matriz)
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    tipo TEXT DEFAULT 'CLIENTE',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'CLIENTE';
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_nome_unique ON public.empresas (LOWER(nome));

-- 1.2 Tabela de Usuários e Colunas de Hierarquia
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    papel TEXT NOT NULL DEFAULT 'TECNICO_CLIENTE',
    empresa_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    integrado_padrao_id UUID,
    clientes_permitidos TEXT[] DEFAULT '{}',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar colunas caso a tabela já existisse no Supabase
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS auth_uid UUID;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS nome TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS papel TEXT DEFAULT 'TECNICO_CLIENTE';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS empresa_id UUID DEFAULT '00000000-0000-0000-0000-000000000001';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS integrado_padrao_id UUID;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS clientes_permitidos TEXT[] DEFAULT '{}';
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT TRUE;

-- Índice único seguro em email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email_unique ON public.usuarios (LOWER(email));

-- ==============================================================================
-- 2. GARANTIR EMPRESAS, CLIENTES E USUÁRIOS INICIAIS
-- ==============================================================================
DO $$
DECLARE
    v_pastre_id UUID := '00000000-0000-0000-0000-000000000001';
    v_bugio_id UUID := '00000000-0000-0000-0000-000000000002';
    v_mugnol_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
    -- --------------------------------------------------------------------------
    -- A) Inserir Empresas na tabela public.empresas
    -- --------------------------------------------------------------------------
    -- 1. Rações Pastre
    IF NOT EXISTS (SELECT 1 FROM public.empresas WHERE LOWER(nome) LIKE '%pastre%') THEN
        INSERT INTO public.empresas (id, nome, tipo, ativo)
        VALUES (v_pastre_id, 'Rações Pastre', 'CLIENTE', TRUE);
    ELSE
        UPDATE public.empresas SET ativo = TRUE WHERE LOWER(nome) LIKE '%pastre%';
        SELECT id INTO v_pastre_id FROM public.empresas WHERE LOWER(nome) LIKE '%pastre%' LIMIT 1;
    END IF;

    -- 2. Grupo Bugio
    IF NOT EXISTS (SELECT 1 FROM public.empresas WHERE LOWER(nome) LIKE '%bugio%') THEN
        INSERT INTO public.empresas (id, nome, tipo, ativo)
        VALUES (v_bugio_id, 'Grupo Bugio', 'CLIENTE', TRUE);
    ELSE
        UPDATE public.empresas SET ativo = TRUE WHERE LOWER(nome) LIKE '%bugio%';
        SELECT id INTO v_bugio_id FROM public.empresas WHERE LOWER(nome) LIKE '%bugio%' LIMIT 1;
    END IF;

    -- 3. Agropecuária Mugnol
    IF NOT EXISTS (SELECT 1 FROM public.empresas WHERE LOWER(nome) LIKE '%mugnol%') THEN
        INSERT INTO public.empresas (id, nome, tipo, ativo)
        VALUES (v_mugnol_id, 'Agropecuaria Mugnol', 'CLIENTE', TRUE);
    ELSE
        UPDATE public.empresas SET ativo = TRUE WHERE LOWER(nome) LIKE '%mugnol%';
        SELECT id INTO v_mugnol_id FROM public.empresas WHERE LOWER(nome) LIKE '%mugnol%' LIMIT 1;
    END IF;

    -- --------------------------------------------------------------------------
    -- B) Inserir Integrados iniciais vinculados (Mocados apenas como exemplo, não as empresas)
    -- --------------------------------------------------------------------------
    -- Não inserimos mais as empresas como "Integrados"
    -- Apenas garantimos a compatibilidade com lotes antigos se necessário


    -- --------------------------------------------------------------------------
    -- C) Usuários Iniciais (Roger Master & Técnico Rações Pastre)
    -- --------------------------------------------------------------------------
    -- 1. Roger Francescon (Master)
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE LOWER(email) = 'rogerfrancescon@gmail.com') THEN
        UPDATE public.usuarios 
        SET papel = 'MASTER', 
            ativo = TRUE, 
            nome = 'Roger Francescon (Master)',
            updated_at = NOW()
        WHERE LOWER(email) = 'rogerfrancescon@gmail.com';
    ELSE
        INSERT INTO public.usuarios (id, email, nome, papel, ativo)
        VALUES (
            '00000000-0000-0000-0000-000000000099',
            'rogerfrancescon@gmail.com',
            'Roger Francescon (Master)',
            'MASTER',
            TRUE
        );
    END IF;

    -- 2. Técnico Rações Pastre (Técnico Cliente)
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE LOWER(email) LIKE '%pastre%') THEN
        UPDATE public.usuarios 
        SET papel = 'TECNICO_CLIENTE',
            empresa_id = v_pastre_id,
            ativo = TRUE,
            updated_at = NOW()
        WHERE LOWER(email) LIKE '%pastre%';
    END IF;
END $$;

-- ==============================================================================
-- 3. FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- ==============================================================================

-- 3.1 Verifica se o usuário é Master
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.usuarios u
        WHERE (u.auth_uid = auth.uid() OR LOWER(u.email) = LOWER(auth.jwt() ->> 'email'))
          AND u.papel IN ('MASTER', 'SUPER_ADMIN')
          AND u.ativo = TRUE
    ) OR LOWER(auth.jwt() ->> 'email') = 'rogerfrancescon@gmail.com';
$$;

-- 3.2 Retorna os IDs dos integrados permitidos consultando a própria tabela 'usuarios'
CREATE OR REPLACE FUNCTION public.get_my_allowed_integrados()
RETURNS TABLE (integrado_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_user_id UUID;
    v_papel TEXT;
    v_integrado_padrao UUID;
    v_clientes_permitidos TEXT[];
BEGIN
    -- 1. Se for Master, tem acesso total a todos os integrados
    IF public.is_master() THEN
        RETURN QUERY SELECT id FROM public.integrados;
        RETURN;
    END IF;

    -- 2. Buscar dados do usuário logado na tabela usuarios
    SELECT u.id, u.papel, u.integrado_padrao_id, u.clientes_permitidos
    INTO v_user_id, v_papel, v_integrado_padrao, v_clientes_permitidos
    FROM public.usuarios u
    WHERE (u.auth_uid = auth.uid() OR LOWER(u.email) = LOWER(auth.jwt() ->> 'email'))
      AND u.ativo = TRUE
    LIMIT 1;

    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    -- 3. Técnico Nutron: integrados especificados no array clientes_permitidos
    IF v_papel IN ('TECNICO_NUTRON', 'COORDENADOR') THEN
        IF v_clientes_permitidos IS NOT NULL AND array_length(v_clientes_permitidos, 1) > 0 THEN
            RETURN QUERY 
            SELECT i.id 
            FROM public.integrados i 
            WHERE i.id::text = ANY(v_clientes_permitidos) 
               OR i.nome = ANY(v_clientes_permitidos);
        ELSE
            -- Se não houver restrição específica cadastrada na lista, acessa todos
            RETURN QUERY SELECT id FROM public.integrados;
        END IF;
        RETURN;
    END IF;

    -- 4. Técnico Cliente (ex: Rações Pastre): apenas o cliente específico
    IF v_papel IN ('TECNICO_CLIENTE', 'TECNICO', 'ADMIN_EMPRESA', 'CLIENTE_VISUALIZADOR') THEN
        IF v_integrado_padrao IS NOT NULL THEN
            RETURN QUERY SELECT v_integrado_padrao;
        ELSIF v_clientes_permitidos IS NOT NULL AND array_length(v_clientes_permitidos, 1) > 0 THEN
            RETURN QUERY 
            SELECT i.id 
            FROM public.integrados i 
            WHERE i.id::text = ANY(v_clientes_permitidos) 
               OR i.nome = ANY(v_clientes_permitidos);
        END IF;
        RETURN;
    END IF;

END;
$$;

-- ==============================================================================
-- 4. ATIVAR RLS NAS TABELAS
-- ==============================================================================
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cargas_racao') THEN
        ALTER TABLE public.cargas_racao ENABLE ROW LEVEL SECURITY;
    END IF;
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

-- ==============================================================================
-- 5. LIMPAR POLÍTICAS ANTERIORES PARA EVITAR CONFLITOS
-- ==============================================================================
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('empresas', 'usuarios', 'integrados', 'lotes', 'visitas', 'cargas_racao', 'tratamentos', 'curvas', 'medicamentos')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 6. POLÍTICAS RLS - EMPRESAS
-- ==============================================================================
CREATE POLICY "Leitura empresas para autenticados"
ON public.empresas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Master gerencia empresas"
ON public.empresas
FOR ALL
TO authenticated
USING (public.is_master())
WITH CHECK (public.is_master());

-- ==============================================================================
-- 7. POLÍTICAS RLS - USUÁRIOS
-- ==============================================================================
CREATE POLICY "Master acesso total usuarios"
ON public.usuarios
FOR ALL
TO authenticated
USING (public.is_master())
WITH CHECK (public.is_master());

CREATE POLICY "Usuario ler proprio perfil"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth_uid = auth.uid() OR LOWER(email) = LOWER(auth.jwt() ->> 'email'));

-- ==============================================================================
-- 8. POLÍTICAS RLS - INTEGRADOS
-- ==============================================================================
CREATE POLICY "Master total integrados"
ON public.integrados
FOR ALL
TO authenticated
USING (public.is_master())
WITH CHECK (public.is_master());

CREATE POLICY "Tecnicos visualizam integrados permitidos"
ON public.integrados
FOR SELECT
TO authenticated
USING (
    id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
);

CREATE POLICY "Tecnico Nutron gerencia integrados carteira"
ON public.integrados
FOR UPDATE
TO authenticated
USING (
    id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
)
WITH CHECK (
    id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
);

-- ==============================================================================
-- 9. POLÍTICAS RLS - LOTES
-- ==============================================================================
CREATE POLICY "Master total lotes"
ON public.lotes
FOR ALL
TO authenticated
USING (public.is_master())
WITH CHECK (public.is_master());

CREATE POLICY "Tecnicos operam lotes permitidos"
ON public.lotes
FOR ALL
TO authenticated
USING (
    integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
)
WITH CHECK (
    integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
);

-- ==============================================================================
-- 10. POLÍTICAS RLS - VISITAS
-- ==============================================================================
CREATE POLICY "Master total visitas"
ON public.visitas
FOR ALL
TO authenticated
USING (public.is_master())
WITH CHECK (public.is_master());

CREATE POLICY "Tecnicos operam visitas permitidas"
ON public.visitas
FOR ALL
TO authenticated
USING (
    lote_id IN (
        SELECT l.id FROM public.lotes l
        WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
    )
)
WITH CHECK (
    lote_id IN (
        SELECT l.id FROM public.lotes l
        WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
    )
);

-- ==============================================================================
-- 11. POLÍTICAS RLS - TABELAS ACESSÓRIAS (CARGAS_RACAO, TRATAMENTOS, CURVAS, MEDICAMENTOS)
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'cargas_racao') THEN
        CREATE POLICY "Acesso cargas racao por lote" ON public.cargas_racao
        FOR ALL TO authenticated
        USING (
            public.is_master() OR 
            lote_id IN (
                SELECT l.id FROM public.lotes l 
                WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
            )
        )
        WITH CHECK (
            public.is_master() OR 
            lote_id IN (
                SELECT l.id FROM public.lotes l 
                WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
            )
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tratamentos') THEN
        CREATE POLICY "Acesso tratamentos por lote" ON public.tratamentos
        FOR ALL TO authenticated
        USING (
            public.is_master() OR 
            lote_id IN (
                SELECT l.id FROM public.lotes l 
                WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
            )
        )
        WITH CHECK (
            public.is_master() OR 
            lote_id IN (
                SELECT l.id FROM public.lotes l 
                WHERE l.integrado_id IN (SELECT integrado_id FROM public.get_my_allowed_integrados())
            )
        );
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'curvas') THEN
        CREATE POLICY "Leitura curvas para autenticados" ON public.curvas
        FOR SELECT TO authenticated
        USING (true);

        CREATE POLICY "Master gerencia curvas" ON public.curvas
        FOR ALL TO authenticated
        USING (public.is_master())
        WITH CHECK (public.is_master());
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'medicamentos') THEN
        CREATE POLICY "Leitura medicamentos para autenticados" ON public.medicamentos
        FOR SELECT TO authenticated
        USING (true);

        CREATE POLICY "Master gerencia medicamentos" ON public.medicamentos
        FOR ALL TO authenticated
        USING (public.is_master())
        WITH CHECK (public.is_master());
    END IF;
END $$;
