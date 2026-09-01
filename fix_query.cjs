const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  "const { data: vData, error: vErr } = await supabase.from('visitas').select('*, cargas_racao(*), tratamentos(*), visita_entregas(*)').range(0, 9999);",
  "const { data: vData, error: vErr } = await supabase.from('visitas').select('*, cargas_racao!fk_carg_visita(*), tratamentos!fk_trat_visita(*)').range(0, 9999);"
);

code = code.replace(
  /const { data: entData3 } = await supabase.from\('visita_entregas'\)[\s\S]*?entregasDB = entData2 \|\| \[\];/g,
  ""
);

fs.writeFileSync('src/lib/storage.ts', code);
