const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const sb = createClient(url, key);

async function run() {
  // Try to login to get a token, or just select and see what happens.
  // We don't have a user context here unless we auth.
  console.log("URL", url ? "OK" : "NOK", "KEY", key ? "OK" : "NOK");
}
run();
