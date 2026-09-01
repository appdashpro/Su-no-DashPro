const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const sql = fs.readFileSync('01_produtos_entregas.sql', 'utf8');
  const { data, error } = await sb.rpc('exec_sql', { sql_query: sql });
  console.log('Result:', data, 'Error:', error);
}
run();
