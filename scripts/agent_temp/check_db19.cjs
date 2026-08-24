const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    console.log("--- 1. BUSCA PELO REGISTRO FALTANTE (18/08/2026) ---");
    const regFaltante = await client.query(`
      SELECT id, "Data", "Integrado", "Alojamento", "Animais Alojados" 
      FROM public.registros 
      WHERE "Data"::date = '2026-08-18'
    `);
    console.table(regFaltante.rows);

    console.log("\n--- 2. MAPEAMENTO DE EMPRESAS E USUÁRIOS ---");
    const empresas = await client.query(`SELECT id, nome FROM public.empresas`);
    console.table(empresas.rows);

    const usuarios = await client.query(`
      SELECT u.email, u.role, e.nome as empresa
      FROM public.usuarios u
      LEFT JOIN public.empresas e ON u.empresa_id = e.id
    `);
    console.table(usuarios.rows);

    console.log("\n--- 3. CONTAGEM DE VISITAS POR EMPRESA ---");
    const contagemVisitas = await client.query(`
      SELECT e.nome as empresa, v.empresa_id, count(*) as total_visitas
      FROM public.visitas v
      LEFT JOIN public.empresas e ON v.empresa_id = e.id
      GROUP BY 1, 2
    `);
    console.table(contagemVisitas.rows);
    
    // Verificando se tem alguma visita avulsa ou em outra empresa
    const totalV = await client.query(`SELECT count(*) FROM public.visitas`);
    console.log(`Total geral na tabela visitas (banco de dados real): ${totalV.rows[0].count}`);

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
