const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const ints = await client.query(`SELECT id, nome FROM public.integrados WHERE nome ILIKE '%Trojan%'`);
    
    for (let i of ints.rows) {
        console.log(`\n--- INTEGRADO ID: ${i.id} ---`);
        const lotes = await client.query(`SELECT id, data_alojamento, status FROM public.lotes WHERE integrado_id = $1`, [i.id]);
        console.table(lotes.rows);
        
        for (let l of lotes.rows) {
          const v = await client.query(`SELECT id, data_visita FROM public.visitas WHERE lote_id = $1`, [l.id]);
          console.log(`Visitas no Lote ${l.id} (${l.data_alojamento}): ${v.rows.length}`);
          if(v.rows.length > 0) console.table(v.rows);
        }
    }

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
