const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    const originais = await client.query(`SELECT COUNT(*) FROM public.registros`);
    console.log("Total na tabela velha:", originais.rows[0].count);

    const visitasTotal = await client.query(`SELECT COUNT(*) FROM public.visitas`);
    console.log("Total de visitas atual:", visitasTotal.rows[0].count);

    // O que tem na tabela registros que poderia gerar mais visitas?
    // Tem algum campo extra? 
    // Tem mais de 594 na tabela de registros se não contar a data?
    const select1 = await client.query(`SELECT COUNT(id) FROM public.registros`);
    console.log("Total count(id) em registros:", select1.rows[0].count);
    
    // Ah, espere... no script de resgate de dados, nós inserimos:
    // "mortalidade_periodo, descartes_periodo, sobra_silo_kg, tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg"
    // Talvez o script de resgate tenha pego visitas de outros usuários, ou gerado a mais porque a tabela tem exatamente 701 visitas originais e a query limitava...
    
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
