const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const totalVisitas = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Antes da limpeza - Visitas: ${totalVisitas.rows[0].count}`);
    
    // A query de delete tem um escopo de variáveis restrito no PostgreSQL 
    // com subconsultas e JOINs. Vamos reescrever usando a sintaxe clássica do PG.
    const deleteQuery = `
      DELETE FROM public.visitas
      WHERE id IN (
          SELECT sub.id
          FROM (
              SELECT 
                  v_inner.id,
                  ROW_NUMBER() OVER(
                      PARTITION BY l.integrado_id, v_inner.data_visita 
                      ORDER BY v_inner.created_at DESC
                  ) as rn
              FROM public.visitas v_inner
              JOIN public.lotes l ON v_inner.lote_id = l.id
          ) sub
          WHERE sub.rn > 1
      );
    `;
    
    console.log("Limpando duplicidades...");
    const delRes = await client.query(deleteQuery);
    console.log(`🗑️ Linhas apagadas: ${delRes.rowCount}`);

    const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Depois da limpeza - Visitas: ${totalVisitasPos.rows[0].count}`);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
