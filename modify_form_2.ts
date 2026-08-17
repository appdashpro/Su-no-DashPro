import fs from 'fs';
let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

content = content.replace(`name="pontuacaoSanitaria"
 value={formData.pontuacaoSanitaria || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`, `name="pontuacaoSanitaria"
 value={formData.pontuacaoSanitaria || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Amostrado (kg)</label>
 <input
  type="number"
  step="0.01"
  name="pesoAmostradoKg"
  value={formData.pesoAmostradoKg ?? ''}
  onChange={handleChange}
  placeholder="Ex: 85.5"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Sobra no Silo (kg)</label>
 <input
  type="number"
  name="sobraSiloKg"
  value={formData.sobraSiloKg ?? ''}
  onChange={handleChange}
  placeholder="Ao encerrar"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`);

fs.writeFileSync('src/components/VisitForm.tsx', content);
