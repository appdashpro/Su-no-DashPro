const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const deleteQuery = `
      DELETE FROM public.visitas
      WHERE id IN (
          SELECT id FROM (
              SELECT 
                  id,
                  ROW_NUMBER() OVER(
                      PARTITION BY v.lote_id, v.data_visita 
                      ORDER BY v.created_at DESC, v.id DESC
                  ) as rn
              FROM public.visitas v
          ) sub WHERE rn > 1
      );
    `;
    const delRes = await client.query(deleteQuery);
    console.log(`🗑️ Apagando visitas duplicadas (lote+data): ${delRes.rowCount}`);

    const q2 = `
      SELECT id, integrado_id, data_alojamento FROM public.lotes
    `;
    // Vamos entender a estrutura dos lotes, pode haver lotes duplicados na mesma data pro mesmo produtor.
    const lotes = await client.query(`SELECT integrado_id, data_alojamento, count(*) FROM public.lotes GROUP BY 1, 2 HAVING count(*) > 1`);
    console.log(`Lotes repetidos: ${lotes.rowCount}`);

    const v2 = await client.query(`SELECT count(*) as c FROM public.visitas`);
    console.log(`Visitas agora: ${v2.rows[0].c}`);
    
    // Deletar as que vieram daquele script de migracao q duplicou se vc rodou duas vezes
    console.log("Removendo todas as visitas repetidas para o mesmo LOTE e DATA:");
    const sql = `
       DELETE FROM public.visitas WHERE id IN (
         SELECT v1.id
         FROM public.visitas v1
         JOIN public.visitas v2 ON v1.lote_id = v2.lote_id AND v1.data_visita = v2.data_visita AND v1.id > v2.id
       )
    `;
    const delRes2 = await client.query(sql);
    console.log(`🗑️ Linhas apagadas pelo Delete JOIN: ${delRes2.rowCount}`);

    // Limpeza forçada pela FK lote + integrados (se um integrado tem dois lotes com datas iguais e as visitas foram pro lote A e lote B separadamente)
    const delRes3 = await client.query(`
      DELETE FROM public.visitas WHERE id IN (
          SELECT v.id FROM public.visitas v
          JOIN public.lotes l ON v.lote_id = l.id
          WHERE (l.integrado_id, v.data_visita) IN (
              SELECT l2.integrado_id, v2.data_visita
              FROM public.visitas v2
              JOIN public.lotes l2 ON v2.lote_id = l2.id
              GROUP BY l2.integrado_id, v2.data_visita
              HAVING count(*) > 1
          )
          AND v.id NOT IN (
              SELECT min(v3.id)
              FROM public.visitas v3
              JOIN public.lotes l3 ON v3.lote_id = l3.id
              GROUP BY l3.integrado_id, v3.data_visita
          )
      )
    `);
    console.log(`🗑️ Linhas apagadas (Força bruta cruzando Integrado+Data): ${delRes3.rowCount}`);

    const vFinal = await client.query(`SELECT count(*) as c FROM public.visitas`);
    console.log(`Visitas FINAIS: ${vFinal.rows[0].c}`);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
