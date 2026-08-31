const { createClient } = require('@supabase/supabase-js');
const url = 'https://cnemtndccfppibecjuep.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) { console.error('No service key'); process.exit(1); }
const sb = createClient(url, key);

async function run() {
  const { data, error } = await sb.from('usuarios').select('id, email, auth_uid, nome, papel');
  console.log(data);
}
run();
