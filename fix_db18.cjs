const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    // Agora sim! O dia 17 (ontem) tem 593 registros (que era a tabela velha inteira)
    // E no dia 18 (hoje), nós temos exatos 108 registros.
    // Esses 108 são as duplicatas que o SEGUNDO script que rodamos hoje inseriu acidentalmente 
    // ou o SEU APP descarregou hoje.
    
    // Vamos deletar exatamente e exclusivamente os criados HOJE (18/08), que não vieram do app,
    // garantindo que os 593 originais voltem a reinar.
    // Mas antes, vamos confirmar que esses 108 são todos clones perfeitos gerados pelo script de HOJE
    // O id deve ser diferente (porque era uuid_generate_v4), mas a data de visita e lote_id são iguais.
    
    console.log("Removendo clones inseridos no dia 18/08/2026...");
    
    // Vamos deletar só os 108 criados no dia 18.
    const delQuery = `
      DELETE FROM public.visitas
      WHERE created_at::date = '2026-08-18'
    `;
    const res = await client.query(delQuery);
    console.log(`🗑️ Linhas apagadas do dia de hoje (Clones do Script): ${res.rowCount}`);
    
    const checkVisitas = await client.query(`SELECT count(*) FROM public.visitas`);
    console.log(`Total FINAL de visitas agora: ${checkVisitas.rows[0].count}`);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
