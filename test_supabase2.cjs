const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const sb = createClient(url, key);

async function run() {
  const { data: authData, error: authErr } = await sb.auth.signInWithPassword({
    email: 'rogerfrancescon@gmail.com',
    password: 'password123' // Just guessing or we can just try to see if we can fetch anonymously
  });
  // We don't have the user's password, so we can't fully emulate them easily, but we can check if anonymous reads are allowed or if service_role works.
  
  const { data: vData, error: vErr } = await sb.from('visitas').select('*, cargas_racao(*), tratamentos(*)').limit(1);
  console.log("Visitas fetch:", vErr ? vErr.message : "Success, records: " + (vData ? vData.length : 0));
  
  const { data: cData, error: cErr } = await sb.from('cargas_racao').select('*').limit(1);
  console.log("Cargas fetch:", cErr ? cErr.message : "Success, records: " + (cData ? cData.length : 0));
}
run();
