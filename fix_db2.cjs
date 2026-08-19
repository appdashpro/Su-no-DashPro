const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const totalReg = await client.query('SELECT COUNT(*) FROM public.registros');
    const totalVisitas = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Antes da limpeza - Registros: ${totalReg.rows[0].count} | Visitas: ${totalVisitas.rows[0].count}`);

    console.log("\n🔍 Procurando o padrão da duplicidade...");
    
    // Visitas com a mesma data e mesmo produtor (via lote)
    const dupCheck = await client.query(`
      SELECT 
          i.nome AS produtor,
          v.data_visita, 
          COUNT(*) as rep
      FROM public.visitas v
      JOIN public.lotes l ON v.lote_id = l.id
      JOIN public.integrados i ON l.integrado_id = i.id
      GROUP BY i.nome, v.data_visita
      HAVING COUNT(*) > 1
      ORDER BY rep DESC
    `);
    
    console.log(`Encontrados ${dupCheck.rows.length} grupos de visitas duplicadas.`);

    if (dupCheck.rows.length > 0) {
        // Excluindo as duplicidades mantendo a mais recente
        const deleteQuery = `
          DELETE FROM public.visitas
          WHERE id IN (
              SELECT v.id
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
              WHERE rn > 1
          );
        `;
        
        console.log("Limpando duplicidades...");
        const delRes = await client.query(deleteQuery);
        console.log(`🗑️ Linhas apagadas: ${delRes.rowCount}`);
    }

    const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Depois da limpeza - Visitas: ${totalVisitasPos.rows[0].count}`);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
