const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.cnemtndccfppibecjuep:DhXoLwRfFz1txE63iFDdUg_TivovFvj@aws-0-us-west-1.pooler.supabase.com:6543/postgres'
});

async function audit() {
  try {
    await client.connect();
    console.log("=== AUDITORIA DE MIGRAÇÃO ===");

    const resRegistros = await client.query('SELECT count(*) FROM public.registros');
    console.log(`📌 Registros Legados (originais): ${resRegistros.rows[0].count}`);

    const resIntegrados = await client.query('SELECT count(*) FROM public.integrados');
    console.log(`📌 Integrados Atuais: ${resIntegrados.rows[0].count}`);

    const resLotes = await client.query('SELECT count(*) FROM public.lotes');
    console.log(`📌 Lotes Atuais: ${resLotes.rows[0].count}`);

    const resVisitas = await client.query('SELECT count(*) FROM public.visitas');
    console.log(`📌 Visitas Atuais: ${resVisitas.rows[0].count}`);

    const resEmpresas = await client.query('SELECT count(*) FROM public.empresas');
    console.log(`📌 Empresas Atuais: ${resEmpresas.rows[0].count}`);

    console.log("\n--- Checagem de Qualidade de Dados ---");
    const resLotesZero = await client.query('SELECT count(*) FROM public.lotes WHERE animais_alojados <= 0');
    console.log(`⚠️ Lotes com animais_alojados zerados/negativos (deve ser 0): ${resLotesZero.rows[0].count}`);
    
    const resLotesEmpty = await client.query('SELECT count(*) FROM public.lotes WHERE animais_alojados = 1');
    console.log(`⚠️ Lotes migrados com fallback de segurança (animais_alojados = 1): ${resLotesEmpty.rows[0].count}`);

    const resVisitasSemLote = await client.query('SELECT count(*) FROM public.visitas WHERE lote_id IS NULL');
    console.log(`⚠️ Visitas órfãs (sem lote_id - deve ser 0): ${resVisitasSemLote.rows[0].count}`);
    
    // Mostrando uma amostra de lotes migrados
    const amostraLotes = await client.query('SELECT l.data_alojamento, l.animais_alojados, i.nome FROM public.lotes l JOIN public.integrados i ON l.integrado_id = i.id LIMIT 3');
    console.log("\n--- Amostra de Lotes Migrados ---");
    console.table(amostraLotes.rows);

  } catch (err) {
    console.error('Erro de conexão ou consulta:', err);
  } finally {
    await client.end();
  }
}
audit();
