const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const totalVisitas = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`Total Absoluto no Banco: ${totalVisitas.rows[0].count}`);

    const pastreVisitas = await client.query(`SELECT COUNT(*) FROM public.visitas WHERE empresa_id = '00000000-0000-0000-0000-000000000001'`);
    console.log(`Total Rações Pastre: ${pastreVisitas.rows[0].count}`);

    const lotesValidos = await client.query(`
        SELECT count(*) FROM public.visitas v
        JOIN public.lotes l ON v.lote_id = l.id
        WHERE v.empresa_id = '00000000-0000-0000-0000-000000000001'
    `);
    console.log(`Visitas vinculadas a lotes existentes: ${lotesValidos.rows[0].count}`);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
