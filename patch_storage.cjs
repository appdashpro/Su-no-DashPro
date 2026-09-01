const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

// 1. In fetch queries
code = code.replace(
  "cargas_racao(*), tratamentos(*)'",
  "cargas_racao(*), tratamentos(*), visita_entregas(*)'"
);

// We need to fetch visita_entregasDB if fallback
code = code.replace(
  "let tratamentosDB: any[] = [];",
  "let tratamentosDB: any[] = [];\n      let entregasDB: any[] = [];"
);
code = code.replace(
  "tratamentosDB = tData || [];",
  "tratamentosDB = tData || [];\n          const { data: entData } = await supabase.from('visita_entregas').select('*, catalogo_produtos(nome)').range(0, 9999);\n          entregasDB = entData || [];"
);
// replace again because it appears twice
code = code.replace(
  "tratamentosDB = tData || [];",
  "tratamentosDB = tData || [];\n        const { data: entData } = await supabase.from('visita_entregas').select('*, catalogo_produtos(nome)').range(0, 9999);\n        entregasDB = entData || [];"
);

// 2. In mapping db to local
code = code.replace(
  "const vTratamentos =",
  "const vEntregas = (v.visita_entregas && v.visita_entregas.length > 0) ? v.visita_entregas : entregasDB.filter((e: any) => e.visita_id === v.id);\n\n        const vTratamentos ="
);

code = code.replace(
  "tratamentos: vTratamentos.map((t: any) => {",
  "entregas: vEntregas.map((e: any) => ({\n            id: e.id,\n            produto_id: e.produto_id,\n            produto_nome: e.produto_nome || e.catalogo_produtos?.nome || '',\n            quantidade: e.quantidade,\n            valor_unitario_aplicado: e.valor_unitario_aplicado,\n            status_faturamento: e.status_faturamento\n          })),\n          tratamentos: vTratamentos.map((t: any) => {"
);

// 3. In syncupsert
code = code.replace(
  "await supabase.from('tratamentos').delete().eq('visita_id', v.id);",
  "await supabase.from('tratamentos').delete().eq('visita_id', v.id);\n       await supabase.from('visita_entregas').delete().eq('visita_id', v.id);"
);

code = code.replace(
  "if (v.tratamentos && v.tratamentos.length > 0) {",
  "if (v.entregas && v.entregas.length > 0) {\n         const entregasToInsert = v.entregas.map(e => ({\n            id: (e.id && e.id.length === 36 && e.id.includes(\"-\")) ? e.id : generateUUID(),\n            empresa_id: finalEmpresaId,\n            visita_id: v.id,\n            produto_id: e.produto_id,\n            quantidade: e.quantidade,\n            valor_unitario_aplicado: e.valor_unitario_aplicado,\n            status_faturamento: e.status_faturamento || 'Pendente'\n         }));\n         const { error: errEntregas } = await supabase.from('visita_entregas').insert(entregasToInsert);\n         if (errEntregas) {\n             console.error(\"Erro insert entregas:\", errEntregas); addSyncLog(\"Erro insert entregas: \" + v.id, errEntregas);\n             addVisitsToOfflineQueue([v]);\n             continue;\n         }\n       }\n\n       if (v.tratamentos && v.tratamentos.length > 0) {"
);

// 4. In delete cascading
code = code.replace(
  "await supabase.from('tratamentos').delete().in('visita_id', vIds);",
  "await supabase.from('tratamentos').delete().in('visita_id', vIds);\n        await supabase.from('visita_entregas').delete().in('visita_id', vIds);"
);

code = code.replace(
  "await supabase.from('tratamentos').delete().eq('visita_id', id);",
  "await supabase.from('tratamentos').delete().eq('visita_id', id);\n      await supabase.from('visita_entregas').delete().eq('visita_id', id);"
);

// 5. In delete lote cascading
code = code.replace(
  "await supabase.from('tratamentos').delete().in('visita_id', vIds);",
  "await supabase.from('tratamentos').delete().in('visita_id', vIds);\n              await supabase.from('visita_entregas').delete().in('visita_id', vIds);"
);
code = code.replace(
  "await supabase.from('tratamentos').delete().eq('visita_id', id);",
  "await supabase.from('tratamentos').delete().eq('visita_id', id);\n            await supabase.from('visita_entregas').delete().eq('visita_id', id);"
);

fs.writeFileSync('src/lib/storage.ts', code);
