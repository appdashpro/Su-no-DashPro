const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const dupDetails = await client.query(`
      SELECT 
          i.nome, v.data_visita, l.data_alojamento, v.created_at, v.id, v.lote_id
      FROM public.visitas v
      JOIN public.lotes l ON v.lote_id = l.id
      JOIN public.integrados i ON l.integrado_id = i.id
      WHERE (i.id, v.data_visita) IN (
          SELECT l2.integrado_id, v2.data_visita
          FROM public.visitas v2
          JOIN public.lotes l2 ON v2.lote_id = l2.id
          GROUP BY l2.integrado_id, v2.data_visita
          HAVING COUNT(*) > 1
      )
      ORDER BY i.nome, v.data_visita
      LIMIT 10;
    `);
    
    console.table(dupDetails.rows);

    const checkRegistrosDuplicados = await client.query(`
        SELECT "Integrado", "Data", count(*) 
        FROM public.registros 
        GROUP BY "Integrado", "Data" 
        HAVING count(*) > 1 
        LIMIT 5;
    `);
    console.log("Existem registros duplicados na tabela legada?");
    console.table(checkRegistrosDuplicados.rows);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
