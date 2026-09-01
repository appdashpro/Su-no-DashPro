const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key);

async function run() {
  const { data, error } = await sb.from('usuario_empresas_permitidas').select('*');
  console.log(data);
}
run();
