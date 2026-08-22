const fs = require('fs');
let content = fs.readFileSync('./src/components/ReferenceCurve.tsx', 'utf8');

const regex = /<div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-end">[\s\S]*?<\/div>\s*<\/div>/;
const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Cliente (Empresa)</label>
          <select
            value={selectedEmpresaId}
            onChange={(e) => setSelectedEmpresaId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#2D452B] outline-none transition-colors"
          >
            <option value="">Selecione...</option>
            {empresas.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Versão da Curva (Visualização)</label>
          <div className="flex flex-col gap-3">
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
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-md font-medium tracking-wide">
                  <span className="opacity-75">VIGÊNCIA:</span> {new Date(curvas.find(c => c.id === selectedCurvaId)!.dataVigencia + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-medium tracking-wide">
                  <span className="opacity-75">LOTE:</span> {curvas.find(c => c.id === selectedCurvaId)!.tipoLote || 'Misto'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>`;

content = content.replace(regex, replacement);
fs.writeFileSync('./src/components/ReferenceCurve.tsx', content);
