const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await sb.rpc('exec_sql', { sql_query: "SELECT tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename IN ('cargas_racao', 'curvas_consumo', 'curvas_consumo_versoes', 'curvas_consumo_valores');" });
  console.log(data || error);
}
run();
