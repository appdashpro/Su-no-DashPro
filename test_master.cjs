const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await sb.rpc('is_master');
  console.log('as admin', data, error);
}
run();
