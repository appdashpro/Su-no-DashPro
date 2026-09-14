const fs = require('fs');
let code = fs.readFileSync('/tmp/backup.tsx', 'utf8');

const regex = /<\/div>\s*<select\s*value=\{tipoCalculo\}/;

const deletedCode = `          <select
            value={selectedEmpresaId}
            onChange={(e) => setSelectedEmpresaId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
          >
            {empresasList.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.nome}</option>
            ))}
          </select>
        </div>
        {config ? (
          <div className="space-y-6">
            {/* Ajustes e Metas */}
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Lógica e Metas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Cálculo da Curva
                  </label>
                  <select
                      value={tipoCalculo}`;

code = code.replace(regex, "</div>\n" + deletedCode);

fs.writeFileSync('src/components/EmpresaConfigGestao.tsx', code);
