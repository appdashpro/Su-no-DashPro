-- ==============================================================================
-- SCRIPT DE RESGATE DOS 593 REGISTROS (MIGRAÇÃO DE DADOS LEGADOS)
-- Este script lê a tabela "registros" e reconstrói as tabelas relacionais
-- ==============================================================================

DO $$
DECLARE
    v_empresa_id UUID := '00000000-0000-0000-0000-000000000001'; -- Rações Pastre
    v_usuario_id UUID;
    r RECORD;
    v_integrado_id UUID;
    v_lote_id UUID;
    v_visita_id UUID;
    v_animais_alojados NUMERIC;
BEGIN
    -- Busca o ID do primeiro usuário ativo para ser o dono da migração
    SELECT id INTO v_usuario_id FROM public.usuarios WHERE ativo = TRUE LIMIT 1;

    -- Iterar sobre todos os registros antigos que não possuem equivalente em visitas
    FOR r IN (
        SELECT * FROM public.registros ORDER BY "created_at" ASC
    )
    LOOP
        -- 1. IDENTIFICAR OU CRIAR INTEGRADO
        SELECT id INTO v_integrado_id FROM public.integrados WHERE LOWER(nome) = LOWER(TRIM(r."Integrado")) LIMIT 1;
        
        IF v_integrado_id IS NULL THEN
            v_integrado_id := uuid_generate_v4();
            INSERT INTO public.integrados (id, empresa_id, nome, ativo)
            VALUES (v_integrado_id, v_empresa_id, TRIM(r."Integrado"), TRUE);
        END IF;

        -- 2. IDENTIFICAR OU CRIAR LOTE
        SELECT id INTO v_lote_id 
        FROM public.lotes 
        WHERE integrado_id = v_integrado_id 
          AND data_alojamento::text = r."Alojamento"::text 
        LIMIT 1;

        IF v_lote_id IS NULL THEN
            v_lote_id := uuid_generate_v4();
            
            -- Descobrir a quantidade de animais real do lote (da visita de Alojamento ou primeiro valor > 0)
            SELECT "Animais Alojados" INTO v_animais_alojados FROM public.registros 
            WHERE "Integrado" = r."Integrado" AND "Alojamento" = r."Alojamento" AND "Animais Alojados" > 0 AND "Animais Alojados" NOT IN (100, 500, 550)
            ORDER BY "Data" ASC LIMIT 1;
            
            INSERT INTO public.lotes (id, empresa_id, integrado_id, data_alojamento, animais_alojados, status, peso_alojamento_kg, tipo_lote)
            VALUES (
                v_lote_id, 
                v_empresa_id, 
                v_integrado_id, 
                r."Alojamento", 
                COALESCE(v_animais_alojados, r."Animais Alojados", 0),
                'Ativo',
                COALESCE(r."Peso aloj", 0),
                COALESCE(r."Tipo Lote", 'Misto')
            );
        END IF;

        -- 3. IDENTIFICAR OU CRIAR VISITA
        -- Evita duplicidade validando a data da visita
        SELECT id INTO v_visita_id FROM public.visitas WHERE lote_id = v_lote_id AND data_visita::text = r."Data"::text LIMIT 1;

        IF v_visita_id IS NULL THEN
            -- Se o ID do registro for UUID válido, tentamos reaproveitar, caso contrário geramos
            BEGIN
                v_visita_id := r.id::UUID;
            EXCEPTION WHEN OTHERS THEN
                v_visita_id := uuid_generate_v4();
            END;
            
            BEGIN
                INSERT INTO public.visitas (
                    id, empresa_id, lote_id, usuario_id, data_visita, 
                    mortalidade_periodo, descartes_periodo, sobra_silo_kg, 
                    tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg, created_at
                ) VALUES (
                    v_visita_id, v_empresa_id, v_lote_id, v_usuario_id, r."Data",
                    COALESCE(r."Animais Mortos", 0), 0, 0,
                    r."Colaborador", r."Recomendação", r."Pontuação Sanitária"::text, r."Peso aloj", r.created_at
                );
            EXCEPTION WHEN OTHERS THEN
                -- Se o ID já existir, gera um novo
                v_visita_id := uuid_generate_v4();
                INSERT INTO public.visitas (
                    id, empresa_id, lote_id, usuario_id, data_visita, 
                    mortalidade_periodo, descartes_periodo, sobra_silo_kg, 
                    tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg, created_at
                ) VALUES (
                    v_visita_id, v_empresa_id, v_lote_id, v_usuario_id, r."Data",
                    COALESCE(r."Animais Mortos", 0), 0, 0,
                    r."Colaborador", r."Recomendação", r."Pontuação Sanitária"::text, r."Peso aloj", r.created_at
                );
            END;
        ELSE
            -- Se a visita já existir, garante que o empresa_id está correto
            UPDATE public.visitas SET empresa_id = v_empresa_id WHERE id = v_visita_id;
        END IF;

        -- Garante que o Lote tem o empresa_id correto
        UPDATE public.lotes SET empresa_id = v_empresa_id WHERE id = v_lote_id;
        -- Garante que o Integrado tem o empresa_id correto
        UPDATE public.integrados SET empresa_id = v_empresa_id WHERE id = v_integrado_id;

    END LOOP;
END;
$$;
