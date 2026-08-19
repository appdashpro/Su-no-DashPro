const { Client } = require('pg');

// Tentando conexão direta primeiro (pode precisar de IPv6)
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';
// Tentando pooler (IPv4)
const connPooler = 'postgresql://postgres.cnemtndccfppibecjuep:Cargill%401503991@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function run() {
  let client;
  try {
    console.log("Tentando Pooler (IPv4)...");
    client = new Client({ connectionString: connPooler });
    await client.connect();
    console.log("✅ Conectado via Pooler!");
  } catch (e1) {
    console.log("Falha no Pooler:", e1.message);
    try {
      console.log("Tentando Conexão Direta...");
      client = new Client({ connectionString: connDirect });
      await client.connect();
      console.log("✅ Conectado via Direto!");
    } catch (e2) {
      console.error("Falha na conexão direta também:", e2.message);
      return;
    }
  }

  try {
    // 1. Checar os totais atuais
    const totalReg = await client.query('SELECT COUNT(*) FROM public.registros');
    const totalVisitas = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Antes da limpeza - Registros: ${totalReg.rows[0].count} | Visitas: ${totalVisitas.rows[0].count}`);

    // 2. Verificar por que a deleção falhou (quais são os duplicados de verdade)
    // Às vezes o integrado e data_visita batem, mas o lote_id é diferente porque o lote duplicou!
    console.log("\n🔍 Procurando o padrão da duplicidade...");
    
    // Visitas com a mesma data e mesmo produtor, independente do lote
    const dupCheck = await client.query(`
      SELECT 
          i.nome AS produtor,
          v.data_visita, 
          COUNT(*) as rep,
          array_agg(v.id) as ids,
          array_agg(v.lote_id) as lotes
      FROM public.visitas v
      JOIN public.integrados i ON v.integrado_id = i.id
      GROUP BY i.nome, v.data_visita
      HAVING COUNT(*) > 1
      ORDER BY rep DESC
    `);
    
    console.log(`Encontrados ${dupCheck.rows.length} grupos de visitas duplicadas.`);

    if (dupCheck.rows.length > 0) {
        console.log("Exemplo de duplicidade:", dupCheck.rows[0]);
        
        // 3. Executando a limpeza de forma abrangente
        // Agrupamos por integrado_id e data_visita. Mantemos apenas a 1ª visita (mais recente).
        const deleteQuery = `
          DELETE FROM public.visitas
          WHERE id IN (
              SELECT id
              FROM (
                  SELECT 
                      v.id,
                      ROW_NUMBER() OVER(
                          PARTITION BY v.integrado_id, v.data_visita 
                          ORDER BY v.created_at DESC
                      ) as rn
                  FROM public.visitas v
              ) sub
              WHERE rn > 1
          );
        `;
        
        console.log("Limpando duplicidades...");
        const delRes = await client.query(deleteQuery);
        console.log(`🗑️ Linhas apagadas: ${delRes.rowCount}`);
    }

    // 4. Checar totais pós limpeza
    const totalVisitasPos = await client.query('SELECT COUNT(*) FROM public.visitas');
    console.log(`\n📊 Depois da limpeza - Visitas: ${totalVisitasPos.rows[0].count}`);

  } catch (err) {
    console.error("Erro durante as queries:", err);
  } finally {
    await client.end();
  }
}

run();
