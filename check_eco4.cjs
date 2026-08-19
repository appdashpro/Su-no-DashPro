const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const ints = await client.query(`SELECT nome FROM public.integrados WHERE nome ILIKE '%eco%' OR nome ILIKE '%trajan%' OR nome ILIKE '%cotra%'`);
    console.table(ints.rows);
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
