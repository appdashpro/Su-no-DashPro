const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const originais = await client.query(`SELECT COUNT(*) FROM public.visitas WHERE mortalidade_periodo = 0 AND tecnico_nome IS NULL`);
    console.log("Visitas estranhas vazias:", originais.rows[0].count);
    
    const countDias = await client.query(`
      SELECT DATE_TRUNC('month', created_at) as mes, count(*) 
      FROM public.visitas 
      GROUP BY 1 ORDER BY 1 DESC
    `);
    console.log("Visitas por mes de criação:", countDias.rows);
    
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
