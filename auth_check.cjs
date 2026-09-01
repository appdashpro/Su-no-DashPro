const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const sb = createClient(url, key);

async function run() {
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'password'
  });
  if (authErr) {
    console.log("Login failed:", authErr.message);
  } else {
    console.log("Logged in!");
    const { data: lotes } = await sb.from('lotes').select('id, data_alojamento, status, integrados(nome), empresas(nome)');
    if (lotes) {
      lotes.forEach(l => {
         const age = Math.floor((new Date() - new Date(l.data_alojamento)) / (1000 * 60 * 60 * 24));
         if (l.status === 'Encerrado') {
             console.log(`Lote ${l.id} - ${l.integrados?.nome} (Emp: ${l.empresas?.nome}) - Idade: ${age} - Status: ${l.status}`);
         }
      });
    }
  }
}
run();
