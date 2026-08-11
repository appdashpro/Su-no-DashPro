const fs = require('fs');
let code = fs.readFileSync('src/components/Visits.tsx', 'utf-8');

code = code.replace(
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Pontuação Sanitária</th>',
  '<th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Pontuação Sanitária</th>\n                <th className="px-2 py-2 border-b border-slate-200 whitespace-nowrap">Tratamentos</th>'
);

code = code.replace(
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.pontuacaoSanitaria ?? \'-\'}</td>',
  '<td className="px-2 py-2 whitespace-nowrap text-xs">{v.pontuacaoSanitaria ?? \'-\'}</td>\n                    <td className="px-2 py-2 whitespace-nowrap text-xs">{v.tratamentos && v.tratamentos.length > 0 ? v.tratamentos.map(t => t.produto).join(\', \') : \'-\'}</td>'
);

code = code.replace(
  'colSpan={27}',
  'colSpan={36}'
);

fs.writeFileSync('src/components/Visits.tsx', code);
console.log('patched Visits.tsx 2');
