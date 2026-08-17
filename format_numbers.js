import fs from 'fs';

function formatFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf-8');

  // Replace {v.meta... ?? metas.meta... ?? '-'}
  code = code.replace(/\{(v\.meta[a-zA-Z0-9]+)\s*\?\?\s*(metas\.meta[a-zA-Z0-9]+)\s*\?\?\s*'-'\}/g, 
    "{($1 || $2) ? Number($1 || $2).toFixed(2) : '-'}");
  
  // Replace {v.carga... ?? '-'}
  code = code.replace(/\{(v\.carga[a-zA-Z0-9]+)\s*\?\?\s*'-'\}/g, 
    "{$1 ? Number($1).toFixed(2) : '-'}");
  
  // Replace {v.peso... ?? '-'}
  code = code.replace(/\{(v\.peso[a-zA-Z0-9]+)\s*\?\?\s*'-'\}/g, 
    "{$1 ? Number($1).toFixed(2) : '-'}");
  
  fs.writeFileSync(filePath, code, 'utf-8');
}

formatFile('src/components/Visits.tsx');
