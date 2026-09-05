const fs = require('fs');
let code = fs.readFileSync('src/components/TratamentosFormSection.tsx', 'utf8');

code = code.replace(
  "                  {tratamento.custoTotal > 0 && (\n                  <div>\n                    <span className=\"block text-blue-600/70\">Custo Total:</span>\n                    <span className=\"font-semibold text-sm\">R$ {tratamento.custoTotal}</span>\n                  </div>\n                  )}\n                  </div>\n                </div>\n              )}",
  "                  {tratamento.custoTotal > 0 && (\n                  <div>\n                    <span className=\"block text-blue-600/70\">Custo Total:</span>\n                    <span className=\"font-semibold text-sm\">R$ {tratamento.custoTotal}</span>\n                  </div>\n                  )}\n                </div>\n              )}"
);

fs.writeFileSync('src/components/TratamentosFormSection.tsx', code);
