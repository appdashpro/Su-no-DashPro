const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const ints = await client.query(`
        SELECT nome, count(*) 
        FROM public.integrados 
        GROUP BY nome 
        HAVING count(*) > 1
    `);
    console.log(`Encontrados ${ints.rows.length} produtores duplicados!`);
    console.table(ints.rows);
    
    // Como resolver?
    // 1. Apagar Lotes que não tem nenhuma visita.
    // 2. Apagar Integrados que não tem lotes.
    
    // Mostrar Lotes Ativos sem visitas:
    const emptyLotes = await client.query(`
        SELECT l.id, i.nome, l.data_alojamento, l.status
        FROM public.lotes l
        JOIN public.integrados i ON l.integrado_id = i.id
        WHERE NOT EXISTS (SELECT 1 FROM public.visitas v WHERE v.lote_id = l.id)
    `);
    console.log(`Encontrados ${emptyLotes.rows.length} lotes sem nenhuma visita registrada!`);
    if (emptyLotes.rows.length > 0) {
        console.table(emptyLotes.rows.slice(0, 5));
    }
    
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
