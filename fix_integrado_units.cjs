const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

code = code.replace(
  "qtTotal = Number((produtoConsumidoKg * 1000).toFixed(2));",
  "qtTotal = Number((produtoConsumidoKg).toFixed(4));"
);

code = code.replace(
  /<span className="font-semibold text-blue-700 text-sm">\{qtTotal\} g<\/span>/g,
  '<span className="font-semibold text-blue-700 text-sm">{qtTotal} kg</span>'
);

code = code.replace(
  /<div className="text-xs text-blue-600 mt-1 font-medium">Custo Total: R\$ \{t\.custoTotal\}<\/div>/g,
  '{t.custoTotal > 0 && <div className="text-xs text-blue-600 mt-1 font-medium">Custo Total: R$ {t.custoTotal.toFixed(2)}</div>}'
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
console.log('Fixed units in IntegradoDetailsModal');
