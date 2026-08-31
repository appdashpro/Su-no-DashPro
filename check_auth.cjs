const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users, error } = await sb.auth.admin.listUsers();
  users.users.forEach(u => console.log(u.email, u.id));
}
run();
