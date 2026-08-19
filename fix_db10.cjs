const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const deleteQuery = `
      DELETE FROM public.visitas
      WHERE id IN (
          SELECT sub.id
          FROM (
              SELECT 
                  v.id,
                  ROW_NUMBER() OVER(
                      PARTITION BY i.id, v.data_visita 
                      ORDER BY v.created_at DESC, v.id DESC
                  ) as rn
              FROM public.visitas v
              JOIN public.lotes l ON v.lote_id = l.id
              JOIN public.integrados i ON l.integrado_id = i.id
          ) sub
          WHERE sub.rn > 1
      );
    `;
    const delRes = await client.query(deleteQuery);
    console.log(`🗑️ Linhas apagadas: ${delRes.rowCount}`);
    const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Depois da limpeza - Visitas: ${totalVisitasPos.rows[0].count}`);
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
