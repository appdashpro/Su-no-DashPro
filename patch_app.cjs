const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const fullAlterScript = `ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Tipo Lote" text DEFAULT 'Misto';
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Peso aloj" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Pontuação Sanitária" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Mortalidade" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Aloj" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 3" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Term 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Term 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Aloj" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Aloj" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Cresc 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Cresc 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Cresc 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Cresc 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Cresc 3" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Cresc 3" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Term 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Term 1" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Term 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Cons. Term 2" numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Meta Acum." numeric;
ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Tratamentos" jsonb;
NOTIFY pgrst, 'reload schema';`;

const escapedScript = fullAlterScript.replace(/\n/g, '\\n');

const oldAlerts = [
    `ALTER TABLE registros ADD COLUMN IF NOT EXISTS "Tipo Lote" text DEFAULT 'Misto';\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Peso aloj" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Pontuação Sanitária" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Aloj" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 1" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 2" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Cresc 3" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Term 1" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Carga Term 2" numeric;\\nALTER TABLE registros ADD COLUMN IF NOT EXISTS "Tratamentos" jsonb;\\nNOTIFY pgrst, 'reload schema';`
];

for (const oldAlert of oldAlerts) {
    code = code.split(oldAlert).join(escapedScript);
}

fs.writeFileSync('src/App.tsx', code);
console.log('patched App.tsx');
