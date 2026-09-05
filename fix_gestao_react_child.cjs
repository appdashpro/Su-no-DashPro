const fs = require('fs');
let code = fs.readFileSync('src/components/EmpresaConfigGestao.tsx', 'utf8');

const regex = /\{medicamentos\.map\(med => \(\s*<span key=\{med\} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">\s*\{med\}\s*\{isMaster && \(<button onClick=\{.*?\} className=".*?">\s*<X className="w-3 h-3" \/>\s*<\/button>\)\}\s*<\/span>\s*\)\)\}/s;

const replacement = `{medicamentos.map((med, idx) => {
                      const nome = typeof med === 'string' ? med : med.nome;
                      const custo = typeof med === 'string' ? undefined : med.custoPorKg;
                      return (
                      <span key={nome + idx} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-medium border border-emerald-200 shadow-sm">
                        {nome} {custo ? \` (R$ \${custo.toFixed(2)})\` : ''}
                        {isMaster && (
                          <button onClick={() => removeMedicamento(nome)} className="hover:text-red-500 ml-1 text-slate-400 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                      );
                    })}`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
console.log('Fixed React child object error');
