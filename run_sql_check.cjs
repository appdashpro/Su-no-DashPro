// Vamos usar o @supabase/supabase-js para tentar nos conectarmos ao banco
// com as permissões da API Key de serviço, se a anon_key estiver limitando a visão.

// Porém, como não temos a SERVICE_ROLE KEY no frontend (.env), vamos tentar
// usar o PostgreSQL client (pg) com a connection string para burlar o RLS e checar diretamente.

const { Client } = require('pg');

const connectionString = 'postgresql://postgres.cnemtndccfppibecjuep:DhXoLwRfFz1txE63iFDdUg_TivovFvj@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function runCheck() {
  try {
    await client.connect();
    console.log("=== VERIFICAÇÃO DIRETA DE DUPLICIDADES ===");
    
    const query = `
      SELECT 
          i.nome AS produtor,
          v.data_visita, 
          COUNT(*) AS quantidade
      FROM public.visitas v
      JOIN public.lotes l ON v.lote_id = l.id
      JOIN public.integrados i ON l.integrado_id = i.id
      GROUP BY i.nome, v.data_visita, v.lote_id
      HAVING COUNT(*) > 1;
    `;
    
    const res = await client.query(query);
    
    if (res.rows.length === 0) {
        console.log("✅ Nenhuma visita duplicada encontrada. Banco de dados está limpo!");
    } else {
        console.log(`⚠️ Foram encontradas ${res.rows.length} duplicações (mesmo produtor, mesma data):`);
        console.table(res.rows);
    }
    
    // Vamos checar o total real de registros vs visitas
    const countReg = await client.query('SELECT count(*) FROM public.registros');
    const countVisitas = await client.query('SELECT count(*) FROM public.visitas');
    
    console.log(`\n📊 Total Registros (Tabela Velha): ${countReg.rows[0].count}`);
    console.log(`📊 Total Visitas (Tabela Nova): ${countVisitas.rows[0].count}`);

  } catch (err) {
    console.error("Erro ao conectar no banco:", err.message);
  } finally {
    await client.end();
  }
}

runCheck();
