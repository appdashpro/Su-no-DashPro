const fs = require('fs');
let env = '';
if (fs.existsSync('.env')) env = fs.readFileSync('.env', 'utf8');
if (fs.existsSync('.env.local')) env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('visitas_tecnicas').select('idade').limit(1);
  if (error) console.error(error);
  else console.log("Fetched", data);
}
test();
