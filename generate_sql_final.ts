import fs from 'fs';

const data = JSON.parse(fs.readFileSync('extracted_curves.json', 'utf8'));

const mistoStr = JSON.stringify(data.misto).replace(/'/g, "''");
const femeaStr = JSON.stringify(data.femea).replace(/'/g, "''");

// Since the old legacy system didn't have a distinct "Macho" curve, it just used the Misto/V2 curve for Macho too. 
// We will assign Misto to Macho as well, so we don't invent data.

const sql = `
-- ==============================================================================
-- 1. LIMPAR A CURVA PADRÃO ANTIGA
-- ==============================================================================
UPDATE public.lotes SET curva_id = NULL;
DELETE FROM public.curvas WHERE empresa_id = '00000000-0000-0000-0000-000000000001';

-- ==============================================================================
-- 2. CRIAR AS 3 CURVAS DE CONSUMO REAIS BASEADAS NO CÓDIGO (V2 PARA MISTO/MACHO, FEMEA)
-- ==============================================================================
DO \\$\\$
DECLARE
    v_empresa_id UUID := '00000000-0000-0000-0000-000000000001';
    v_curva_misto_id UUID := uuid_generate_v4();
    v_curva_macho_id UUID := uuid_generate_v4();
    v_curva_femea_id UUID := uuid_generate_v4();
BEGIN
    -- INSERE CURVA MISTO (A mesma da V2 do código antigo)
    INSERT INTO public.curvas (id, empresa_id, nome, versao, sexo_lote, ativa, metas_json)
    VALUES (v_curva_misto_id, v_empresa_id, 'Curva de Consumo V2 - Misto', 2, 'Misto', TRUE, '${mistoStr}'::jsonb);

    -- INSERE CURVA MACHO (A mesma da V2 do código antigo, já que não havia uma Macho específica)
    INSERT INTO public.curvas (id, empresa_id, nome, versao, sexo_lote, ativa, metas_json)
    VALUES (v_curva_macho_id, v_empresa_id, 'Curva de Consumo V2 - Macho', 2, 'Macho', TRUE, '${mistoStr}'::jsonb);

    -- INSERE CURVA FÊMEA (A curva femea do código antigo)
    INSERT INTO public.curvas (id, empresa_id, nome, versao, sexo_lote, ativa, metas_json)
    VALUES (v_curva_femea_id, v_empresa_id, 'Curva de Consumo - Fêmea', 1, 'Fêmea', TRUE, '${femeaStr}'::jsonb);

    -- ==============================================================================
    -- 3. REATRIBUIR OS 139 LOTES ÀS SUAS RESPECTIVAS CURVAS
    -- ==============================================================================
    UPDATE public.lotes SET curva_id = v_curva_misto_id WHERE tipo_lote ILIKE '%Misto%' OR tipo_lote IS NULL;
    UPDATE public.lotes SET curva_id = v_curva_macho_id WHERE tipo_lote ILIKE '%Macho%';
    UPDATE public.lotes SET curva_id = v_curva_femea_id WHERE tipo_lote ILIKE '%Fêmea%';

END \\$\\$;
`;

fs.writeFileSync('update_curvas_final.sql', sql);
