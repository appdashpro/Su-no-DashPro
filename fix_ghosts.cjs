const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    // 1. Deletar lotes que NÃO POSSUEM nenhuma visita.
    console.log("Deletando Lotes Fantasmas (Lotes criados pelo erro de script que não receberam visitas)...");
    const deleteLotes = await client.query(`
        DELETE FROM public.lotes
        WHERE NOT EXISTS (SELECT 1 FROM public.visitas v WHERE v.lote_id = public.lotes.id)
    `);
    console.log(`🗑️ Lotes apagados: ${deleteLotes.rowCount}`);

    // 2. Deletar integrados que ficaram orfãos (não tem mais nenhum lote)
    console.log("Deletando Produtores Fantasmas (Produtores duplicados sem lotes)...");
    const deleteIntegrados = await client.query(`
        DELETE FROM public.integrados
        WHERE NOT EXISTS (SELECT 1 FROM public.lotes l WHERE l.integrado_id = public.integrados.id)
    `);
    console.log(`🗑️ Produtores apagados: ${deleteIntegrados.rowCount}`);
    
  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
