const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const q1 = await client.query(`
        SELECT count(*) 
        FROM public.visitas 
        WHERE id::text NOT IN (SELECT id::text FROM public.registros)
    `);
    console.log("Visitas que NAO compartilham o mesmo ID da tabela registros:", q1.rows[0].count);
    
    // Mostre 5 visitas misteriosas
    const q2 = await client.query(`
        SELECT v.data_visita, v.tecnico_nome, l.data_alojamento, i.nome
        FROM public.visitas v
        JOIN public.lotes l ON v.lote_id = l.id
        JOIN public.integrados i ON l.integrado_id = i.id
        WHERE v.id::text NOT IN (SELECT id::text FROM public.registros)
        LIMIT 5;
    `);
    console.table(q2.rows);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
