const { Client } = require('pg');

const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();

  try {
    const totalVisitas = await client.query('SELECT COUNT(*) FROM public.visitas');
    const totalRegistros = await client.query('SELECT COUNT(*) FROM public.registros');
    console.log(`\n📊 Registros: ${totalRegistros.rows[0].count} | Visitas: ${totalVisitas.rows[0].count}`);

    // Vamos ver o que NÃO tem correspondente em Registros
    const visitasNovas = await client.query(`
        SELECT v.id, v.data_visita, v.created_at, l.data_alojamento, i.nome
        FROM public.visitas v
        JOIN public.lotes l ON v.lote_id = l.id
        JOIN public.integrados i ON l.integrado_id = i.id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.registros r
            WHERE r."Data"::date = v.data_visita 
            AND TRIM(LOWER(r."Integrado")) = TRIM(LOWER(i.nome))
        )
        LIMIT 10;
    `);
    
    console.log("Visitas sem correspondência direta em registros:");
    console.table(visitasNovas.rows);
    console.log("Qtd sem correspondência: ", (await client.query(`SELECT COUNT(*) FROM public.visitas v JOIN public.lotes l ON v.lote_id = l.id JOIN public.integrados i ON l.integrado_id = i.id WHERE NOT EXISTS (SELECT 1 FROM public.registros r WHERE r."Data"::date = v.data_visita AND TRIM(LOWER(r."Integrado")) = TRIM(LOWER(i.nome)))`)).rows[0].count);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
