const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const q1 = await client.query(`SELECT count(*) FROM public.visitas`);
    console.log("Total de Visitas Real:", q1.rows[0].count);
    
    const countDuploScript = await client.query(`
      SELECT r."Data", r."Integrado", count(*)
      FROM public.registros r
      JOIN public.visitas v ON v.data_visita = r."Data"::date
      JOIN public.lotes l ON l.id = v.lote_id
      JOIN public.integrados i ON i.id = l.integrado_id
      WHERE TRIM(LOWER(r."Integrado")) = TRIM(LOWER(i.nome))
      GROUP BY r."Data", r."Integrado"
      HAVING count(*) > 1
      LIMIT 5
    `);
    console.log("Mesmos produtores recebendo mais de uma visita pelas datas:");
    console.table(countDuploScript.rows);
    
    // Ah, o script de hoje mais cedo tentou rodar as EXCEPTION usando o uuid_generate_v4().
    // E no painel vc rodou o mesmo script que tinha a Exception, 
    // ele pode ter "duplicado" inserções se foi rodado 2x? 
    // Vamos checar visitas com as MESMAS informacoes exceto ID:
    const duplicateDataCheck = await client.query(`
      SELECT 
          lote_id, data_visita, mortalidade_periodo, tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg, count(*) as qty
      FROM public.visitas
      GROUP BY lote_id, data_visita, mortalidade_periodo, tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg
      HAVING count(*) > 1
      LIMIT 5;
    `);
    console.log("Linhas EXATAMENTE IGUAIS na tabela Visitas:");
    console.table(duplicateDataCheck.rows);

    if (duplicateDataCheck.rows.length > 0) {
      console.log("Apagando linhas exatas duplicadas...");
      const delQuery = `
          DELETE FROM public.visitas
          WHERE id IN (
              SELECT sub.id
              FROM (
                  SELECT 
                      id,
                      ROW_NUMBER() OVER(
                          PARTITION BY lote_id, data_visita, mortalidade_periodo, tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg
                          ORDER BY created_at DESC, id DESC
                      ) as rn
                  FROM public.visitas
              ) sub
              WHERE sub.rn > 1
          )
      `;
      const result = await client.query(delQuery);
      console.log("Linhas apagadas:", result.rowCount);
      const qtVisitasFinal = await client.query(`SELECT count(*) FROM public.visitas`);
      console.log("Total FINAL VISITAS:", qtVisitasFinal.rows[0].count);
    }
    
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
