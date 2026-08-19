const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    console.log("Investigando por que as linhas não foram apagadas...");
    
    // As visitas podem estar caindo em lotes duplicados diferentes.
    // Vamos checar os lotes do mesmo integrado e mesma data
    const lotesDup = await client.query(`
      SELECT 
          integrado_id, data_alojamento, count(*) 
      FROM public.lotes
      GROUP BY integrado_id, data_alojamento
      HAVING count(*) > 1
    `);
    
    console.log(`Lotes duplicados encontrados: ${lotesDup.rows.length}`);

    // Se a query que cruza não funcionou, vamos apenas limpar as duplicidades diretas na tabela visitas (mesmo lote e mesma data_visita)
    const deleteDirectQuery = `
      DELETE FROM public.visitas
      WHERE id IN (
          SELECT sub.id
          FROM (
              SELECT 
                  id,
                  ROW_NUMBER() OVER(
                      PARTITION BY lote_id, data_visita 
                      ORDER BY created_at DESC
                  ) as rn
              FROM public.visitas
          ) sub
          WHERE sub.rn > 1
      );
    `;
    
    console.log("Tentando limpar por mesmo lote e data...");
    const delDirectRes = await client.query(deleteDirectQuery);
    console.log(`🗑️ Linhas apagadas (via lote e data): ${delDirectRes.rowCount}`);

    const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Total de Visitas Atual: ${totalVisitasPos.rows[0].count}`);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
