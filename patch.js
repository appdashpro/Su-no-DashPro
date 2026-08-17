import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

// First replacement (around line 440, inside saveVisits)
const pattern1 = /await supabase\.from\('lotes'\)\.upsert\(\{\s+id: loteId,\s+empresa_id: EMPRESA_ID,\s+integrado_id: dbIntegradoId,\s+data_alojamento: localLote\.alojamentoDate \|\| v\.date,\s+animais_alojados: Math\.round\(v\.animaisAlojados \|\| 0\),/;

const replacement1 = `const dbLote = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
            let finalAloj = Math.round(v.animaisAlojados || 0);
            if ((finalAloj === 100 || finalAloj === 500 || finalAloj === 550 || finalAloj === 0) && dbLote.data?.animais_alojados) {
               finalAloj = dbLote.data.animais_alojados;
            }

            await supabase.from('lotes').upsert({
                id: loteId,
                empresa_id: EMPRESA_ID,
                integrado_id: dbIntegradoId,
                data_alojamento: localLote.alojamentoDate || v.date,
                animais_alojados: finalAloj,`;

code = code.replace(pattern1, replacement1);

// Second replacement (around line 481)
const pattern2 = /const { error: errLote } = await supabase\.from\('lotes'\)\.update\({\s+animais_alojados: Math\.round\(v\.animaisAlojados \|\| 0\),/;

const replacement2 = `const dbLote2 = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
       let finalAloj2 = Math.round(v.animaisAlojados || 0);
       if ((finalAloj2 === 100 || finalAloj2 === 500 || finalAloj2 === 550 || finalAloj2 === 0) && dbLote2.data?.animais_alojados) {
          finalAloj2 = dbLote2.data.animais_alojados;
       }

       const { error: errLote } = await supabase.from('lotes').update({
         animais_alojados: finalAloj2,`;

code = code.replace(pattern2, replacement2);

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patch applied");
