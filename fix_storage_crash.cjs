const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
  'const { data: configsDB } = await supabase.from("empresa_configuracoes").select("*");\n      if (configsDB) { safeStorage.setItem(CONFIGS_KEY, JSON.stringify(configsDB)); }',
  'try {\n        const { data: configsDB } = await supabase.from("empresa_configuracoes").select("*");\n        if (configsDB) { safeStorage.setItem(CONFIGS_KEY, JSON.stringify(configsDB)); }\n      } catch (e) { console.warn("Table empresa_configuracoes not available yet", e); }'
);

fs.writeFileSync('src/lib/storage.ts', code);
