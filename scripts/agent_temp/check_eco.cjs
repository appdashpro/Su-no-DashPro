const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const ints = await client.query(`SELECT id, nome, ativo FROM public.integrados WHERE nome ILIKE '%eco%'`);
    console.log("Integrados ECO:");
    console.table(ints.rows);
    if(ints.rows.length === 0) { console.log("Nenhum integrado encontrado"); return; }
    
    const intId = ints.rows[0].id;
    const lotes = await client.query(`SELECT id, data_alojamento, status FROM public.lotes WHERE integrado_id = $1`, [intId]);
    console.log("Lotes:");
    console.table(lotes.rows);
    
    for(let l of lotes.rows) {
        const v = await client.query(`SELECT id, data_visita FROM public.visitas WHERE lote_id = $1`, [l.id]);
        console.log(`Visitas pro lote ${l.data_alojamento} (ID: ${l.id}):`, v.rows.length);
    }
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
