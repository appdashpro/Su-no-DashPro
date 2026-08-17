import fs from 'fs';
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');
code = code.replace(
  "const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';",
  "const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';"
);
code = code.replace(
  "const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';",
  "const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';"
);
fs.writeFileSync('src/lib/supabase.ts', code);
