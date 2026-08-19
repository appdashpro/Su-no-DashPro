const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const checkDupVis = await client.query(`
        SELECT v.data_visita, TRIM(LOWER(i.nome)), count(*) as rep
        FROM public.visitas v 
        JOIN public.lotes l ON v.lote_id = l.id 
        JOIN public.integrados i ON l.integrado_id = i.id
        GROUP BY 1, 2
        HAVING count(*) > 1
        ORDER BY rep DESC
        LIMIT 10;
    `);
    console.log("Visitas duplicadas (mesma Data e mesmo Integrado):");
    console.table(checkDupVis.rows);

    if (checkDupVis.rows.length > 0) {
        console.log("Deletando as cópias de Visitas (Mantendo apenas 1 por Data/Integrado)...");
        const deleteQuery = `
          DELETE FROM public.visitas
          WHERE id IN (
              SELECT sub.id
              FROM (
                  SELECT 
                      v.id,
                      ROW_NUMBER() OVER(
                          PARTITION BY l.integrado_id, v.data_visita 
                          ORDER BY v.created_at DESC
                      ) as rn
                  FROM public.visitas v
                  JOIN public.lotes l ON v.lote_id = l.id
              ) sub
              WHERE sub.rn > 1
          );
        `;
        const delRes = await client.query(deleteQuery);
        console.log(`🗑️ Linhas apagadas: ${delRes.rowCount}`);

        const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
        console.log(`\n📊 Depois da limpeza - Visitas: ${totalVisitasPos.rows[0].count}`);
    }

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
