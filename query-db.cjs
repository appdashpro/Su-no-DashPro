const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[2]);
  supabase.from('empresa_configuracoes').select('*').then(({ data }) => {
    const pastre = data.find(d => JSON.stringify(d).includes('pastre'));
    if (pastre) {
        console.log(pastre.curva_desempenho.map(c => ({ id: c.id, dataVigencia: c.dataVigencia, tipoLote: c.tipoLote })));
    }
  });
}
