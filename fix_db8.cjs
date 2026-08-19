const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const multCheck = await client.query(`
        SELECT r."Data"::date, TRIM(LOWER(r."Integrado")), count(*) as c1
        FROM public.registros r
        GROUP BY 1, 2
        HAVING count(*) > 1
    `);
    
    console.log("Registros duplicados na origem com cast de data:");
    console.table(multCheck.rows);

    const checkTotais = await client.query(`
        SELECT COUNT(DISTINCT ("Data"::date, TRIM(LOWER("Integrado")))) as dist_reg FROM public.registros;
    `);
    console.log("Qtd única de (Data, Integrado) em registros:", checkTotais.rows[0].dist_reg);

    const checkTotaisVis = await client.query(`
        SELECT COUNT(DISTINCT (v.data_visita, TRIM(LOWER(i.nome)))) as dist_vis 
        FROM public.visitas v 
        JOIN public.lotes l ON v.lote_id = l.id 
        JOIN public.integrados i ON l.integrado_id = i.id;
    `);
    console.log("Qtd única de (Data, Integrado) em visitas:", checkTotaisVis.rows[0].dist_vis);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
