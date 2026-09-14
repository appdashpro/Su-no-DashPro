const fs = require('fs');
let env = '';
if (fs.existsSync('.env')) env = fs.readFileSync('.env', 'utf8');
if (fs.existsSync('.env.local')) env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);
async function test() {
  const { data, error } = await supabase.rpc('get_schema'); // This probably doesn't exist
  // Instead, let's query a known row or just insert a fake one and rollback
  // Or fetch using PostgREST to get the columns from the OpenAPI spec
  const res = await fetch(`${url}/rest/v1/empresa_configuracoes?limit=1`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const json = await res.json();
  console.log(json);
  
  // Actually, we can get columns from the OpenAPI spec
  const res2 = await fetch(`${url}/rest/v1/`, {
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`
    }
  });
  const openapi = await res2.json();
  console.log(Object.keys(openapi.definitions?.empresa_configuracoes?.properties || {}));
}
test();
