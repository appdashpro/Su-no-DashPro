const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

code = code.replace(
  /<span className="bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded font-bold shadow-sm">\s*Total: \{qtTotal\} g\s*<\/span>/,
  '<span className="bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded font-bold shadow-sm">\n                                        Total: {qtTotal} kg\n                                      </span>'
);

code = code.replace(
  /\{t.custoTotal > 0 && <div className="text-xs text-blue-600 mt-1 font-medium">Custo Total: R\$ \{t\.custoTotal\.toFixed\(2\)\}<\/div>\}/,
  '{t.custoTotal && t.custoTotal > 0 ? <div className="text-xs text-blue-600 mt-1 font-medium">Custo Total: R$ {t.custoTotal.toFixed(2)}</div> : null}'
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
