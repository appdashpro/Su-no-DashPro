const { Client } = require('pg');
const connDirect = 'postgresql://postgres:Cargill%401503991@db.cnemtndccfppibecjuep.supabase.co:5432/postgres';

async function run() {
  const client = new Client({ connectionString: connDirect });
  await client.connect();
  try {
    console.log("--- 2. MAPEAMENTO DE EMPRESAS E USUÁRIOS ---");
    const usuarios = await client.query(`
      SELECT u.id, u.email, u.nome, u.ativo, e.nome as empresa, u.empresa_id
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
    
    const totalV = await client.query(`SELECT count(*) FROM public.visitas`);
    console.log(`Total geral na tabela visitas (banco de dados real): ${totalV.rows[0].count}`);

    // Vamos aproveitar e inserir a visita que ficou de fora (18/08)
    // O que apagamos agorinha foi TUDO que foi criado dia 18/08. Como ela foi inserida no app HOJE (18/08), nós apagamos ela sem querer!
    // Porque a query de limpeza deletou WHERE created_at::date = '2026-08-18' (isso apagou os clones do script, mas também apagou a visita real que vc fez hoje no celular).
    
    console.log("\n--- RESTAURANDO O REGISTRO DO DIA 18/08 ---");
    // Vamos pegar os dados do registro
    const reg = await client.query(`SELECT * FROM public.registros WHERE "Data"::date = '2026-08-18'`);
    if (reg.rows.length > 0) {
        const r = reg.rows[0];
        // Encontrar ou criar integrado e lote
        const integrado = await client.query(`SELECT id FROM public.integrados WHERE TRIM(LOWER(nome)) = $1`, [r.Integrado.toLowerCase().trim()]);
        let intId;
        if (integrado.rows.length > 0) intId = integrado.rows[0].id;
        else {
            const intRes = await client.query(`INSERT INTO public.integrados (empresa_id, nome, ativo) VALUES ($1, $2, true) RETURNING id`, ['00000000-0000-0000-0000-000000000001', r.Integrado]);
            intId = intRes.rows[0].id;
        }

        const lote = await client.query(`SELECT id FROM public.lotes WHERE integrado_id = $1 AND data_alojamento::date = $2`, [intId, r.Alojamento]);
        let loteId;
        if (lote.rows.length > 0) loteId = lote.rows[0].id;
        else {
            const lRes = await client.query(`INSERT INTO public.lotes (empresa_id, integrado_id, data_alojamento, animais_alojados, status) VALUES ($1, $2, $3, $4, 'Ativo') RETURNING id`, ['00000000-0000-0000-0000-000000000001', intId, r.Alojamento, r['Animais Alojados']]);
            loteId = lRes.rows[0].id;
        }

        const vRes = await client.query(`
            INSERT INTO public.visitas (empresa_id, lote_id, usuario_id, data_visita, mortalidade_periodo, descartes_periodo, sobra_silo_kg, tecnico_nome, recomendacoes, pontuacao_sanitaria, peso_amostrado_kg)
            VALUES ($1, $2, (SELECT id FROM public.usuarios WHERE ativo = true LIMIT 1), $3, $4, 0, 0, $5, $6, $7, $8)
            RETURNING id
        `, ['00000000-0000-0000-0000-000000000001', loteId, r.Data, r['Animais Mortos'] || 0, r.Colaborador, r['Recomendação'], r['Pontuação Sanitária'], r['Peso aloj']]);
        console.log(`✅ Visita do dia 18/08 restaurada com sucesso! ID: ${vRes.rows[0].id}`);
    }

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}
run();
