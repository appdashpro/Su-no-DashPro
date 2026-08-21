const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');
code = code.replace(
  'try {\n        const { data: configsDB } = await supabase.from("empresa_configuracoes").select("*");\n        if (configsDB) { safeStorage.setItem(CONFIGS_KEY, JSON.stringify(configsDB)); }\n      } catch (e) { console.warn("Table empresa_configuracoes not available yet", e); }',
  'try {\n        const { data: configsDB, error: configError } = await supabase.from("empresa_configuracoes").select("*");\n        if (configError) {\n           console.warn("Table empresa_configuracoes not available yet", configError.message);\n        } else if (configsDB) {\n           safeStorage.setItem(CONFIGS_KEY, JSON.stringify(configsDB));\n        }\n      } catch (e) { console.warn("Table empresa_configuracoes error", e); }'
);
fs.writeFileSync('src/lib/storage.ts', code);
