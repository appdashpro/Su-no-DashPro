const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    console.log("As duplicidades não são no mesmo lote e mesma data.");
    console.log("Vamos checar se o lote_id é nulo, ou se há outra coisa...\n");
    
    // Verificando 5 duplicidades
    const dupDetails = await client.query(`
      SELECT 
          i.nome, v.data_visita, l.data_alojamento, v.created_at, v.id, v.lote_id
      FROM public.visitas v
      JOIN public.lotes l ON v.lote_id = l.id
      JOIN public.integrados i ON l.integrado_id = i.id
      WHERE (i.id, v.data_visita) IN (
          SELECT i2.id, v2.data_visita
          FROM public.visitas v2
          JOIN public.integrados i2 ON v2.integrado_id = i2.id
          GROUP BY i2.id, v2.data_visita
          HAVING COUNT(*) > 1
      )
      ORDER BY i.nome, v.data_visita
      LIMIT 10;
    `);
    
    console.table(dupDetails.rows);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
