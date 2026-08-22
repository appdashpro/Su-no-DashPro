const fs = require('fs');
let content = fs.readFileSync('./src/components/ReferenceCurve.tsx', 'utf8');

const regex = /<div className="w-full sm:w-1\/3">[\s\S]*?<\/select>\s*<\/div>/;
const replacement = `<div className="w-full sm:w-1/3">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Versão da Curva</label>
          <div className="flex flex-col gap-2">
            <select
              value={selectedCurvaId}
              onChange={(e) => setSelectedCurvaId(e.target.value)}
              disabled={curvas.length === 0}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D452B] outline-none disabled:opacity-50 transition-colors"
            >
              {curvas.length === 0 ? <option value="">Nenhuma curva encontrada</option> : null}
              {curvas.map(cv => (
                <option key={cv.id} value={cv.id}>{cv.nome}</option>
              ))}
            </select>
            {selectedCurvaId && curvas.find(c => c.id === selectedCurvaId) && (
              <div className="flex items-center gap-2 text-[11px]">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-medium tracking-wide">
                  VIGÊNCIA: {new Date(curvas.find(c => c.id === selectedCurvaId)!.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-medium tracking-wide">
                  LOTE: {curvas.find(c => c.id === selectedCurvaId)!.tipoLote || 'Misto'}
                </span>
              </div>
            )}
          </div>
        </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('./src/components/ReferenceCurve.tsx', content);
