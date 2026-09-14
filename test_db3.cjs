require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url) { console.log("No url found"); process.exit(1); }
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function test() {
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`);
  const openapi = await res.json();
  console.log(Object.keys(openapi.definitions?.empresa_configuracoes?.properties || {}));
}
test();
