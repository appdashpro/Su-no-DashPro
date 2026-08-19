const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const orig = await client.query(`SELECT count(*) FROM public.registros`);
    console.log("Registros na tabela antiga:", orig.rows[0].count);

    // O que eu acabei de descobrir:
    // A tabela "registros" velha tem 594 linhas.
    // Mas se um MESMO integrado tem duas visitas no MESMO DIA, a query de lotes e visitas fez algo?
    // Não, as visitas NÃO são EXATAMENTE idênticas na tabela Visitas.
    // E os produtores também não.
    
    // De onde vieram as visitas que não são exatas?
    const select1 = await client.query(`
        SELECT count(id) FROM public.visitas WHERE mortalidade_periodo > 0
    `);
    console.log("Visitas com mortes: ", select1.rows[0].count);

    // Vamos ver as visitas que criamos pra suprir o Lote que vc inseriu? Não.
    // Veja: na tabela original tínhamos registros de ALOJAMENTO, FECHAMENTO e TRATAMENTO.
    // O seu script pode ter lido a tabela *duas* vezes, ou os dados originais na tabela `registros` tem 594 linhas
    // de VISITA, mas tem mais X linhas de FECHAMENTO?
    
    const countTodas = await client.query(`SELECT "Alojamento", "Integrado", count(*) FROM public.registros GROUP BY 1, 2 HAVING count(*) > 1 LIMIT 5`);
    console.log("Produtores com >1 registro no mesmo alojamento:");
    console.table(countTodas.rows);

    // Será que o seu app, na hora de rodar as sincronizações, enviou do seu LocalStorage essas 107 visitas a mais?
    const localCheck = await client.query(`
        SELECT created_at::date, count(*) FROM public.visitas GROUP BY 1 ORDER BY 1 DESC
    `);
    console.log("Dias de criação das visitas:");
    console.table(localCheck.rows);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
