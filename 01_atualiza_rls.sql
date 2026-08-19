CREATE OR REPLACE FUNCTION public.get_my_allowed_integrados()
RETURNS TABLE (integrado_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_user_id UUID;
    v_papel TEXT;
    v_empresa_id UUID;
    v_integrado_padrao UUID;
    v_clientes_permitidos TEXT[];
BEGIN
    -- 1. Se for Master, tem acesso total a todos os integrados
    IF public.is_master() THEN
        RETURN QUERY SELECT id FROM public.integrados;
        RETURN;
    END IF;

    -- 2. Buscar dados do usuário logado na tabela usuarios
    SELECT u.id, u.papel, u.empresa_id, u.integrado_padrao_id, u.clientes_permitidos
    INTO v_user_id, v_papel, v_empresa_id, v_integrado_padrao, v_clientes_permitidos
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

    -- 4. Técnico Cliente (ex: Rações Pastre): todos os integrados da mesma empresa
    IF v_papel IN ('TECNICO_CLIENTE', 'TECNICO', 'ADMIN_EMPRESA', 'CLIENTE_VISUALIZADOR') THEN
        IF v_empresa_id IS NOT NULL THEN
            RETURN QUERY 
             SELECT i.id 
             FROM public.integrados i 
             WHERE i.empresa_id = v_empresa_id;
        END IF;
        RETURN;
    END IF;
END;
$$;
