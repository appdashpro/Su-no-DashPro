const fs = require('fs');
let env = '';
if (fs.existsSync('.env')) env = fs.readFileSync('.env', 'utf8');
if (fs.existsSync('.env.local')) env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function test() {
  const { data: fetch_data, error: fetch_error } = await supabase.from('empresa_configuracoes').select('*').limit(1);
  if (fetch_error) console.error('fetch error:', fetch_error);
  else {
    const row = fetch_data[0];
    if (row) {
      console.log('Existing columns:', Object.keys(row));
    } else {
      console.log('No rows returned.');
    }
  }
}
test();
