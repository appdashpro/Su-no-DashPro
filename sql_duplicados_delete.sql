-- ==============================================================================
-- SCRIPT DE LIMPEZA DE VISITAS DUPLICADAS (MANTÉM APENAS A MAIS RECENTE)
-- ==============================================================================

-- Usamos uma Common Table Expression (CTE) com ROW_NUMBER()
-- para identificar visitas idênticas (mesmo lote e mesma data_visita)
-- Ordenamos pelo created_at decrescente, de modo que a mais recente (rn = 1) seja mantida,
-- e as cópias mais antigas (rn > 1) sejam marcadas para deleção.

DELETE FROM public.visitas
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER(
                PARTITION BY lote_id, data_visita 
                ORDER BY created_at DESC
            ) as rn
        FROM public.visitas
    ) sub
    WHERE rn > 1
);
