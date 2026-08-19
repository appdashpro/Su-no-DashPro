const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const delRes3 = await client.query(`
      DELETE FROM public.visitas WHERE id IN (
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
      )
    `);
    console.log(`🗑️ Linhas apagadas (limpeza absoluta): ${delRes3.rowCount}`);

    const vFinal = await client.query(`SELECT count(*) as c FROM public.visitas`);
    console.log(`Visitas FINAIS: ${vFinal.rows[0].c}`);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
