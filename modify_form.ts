import fs from 'fs';

let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const mortosField = ` <label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
 <span>Animais Mortos</span>`;

// Replace this to add descartes next to it
// Actually I'll just find the block ending with `</div>` and insert after it.

const addDescartes = `
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1 flex justify-between items-center">
 <span>Descartes / Refugos</span>
 </label>
 <input
  type="number"
  name="descartesPeriodo"
  value={formData.descartesPeriodo ?? ''}
  onChange={handleChange}
  placeholder="Ex: 2"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`;

content = content.replace(`name="animaisMortos"
 value={formData.animaisMortos ?? ''}
 onChange={handleChange}
 placeholder="Ex: 5"
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`, `name="animaisMortos"
 value={formData.animaisMortos ?? ''}
 onChange={handleChange}
 placeholder="Ex: 5"
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Descartes / Refugos</label>
 <input
  type="number"
  name="descartesPeriodo"
  value={formData.descartesPeriodo ?? ''}
  onChange={handleChange}
  placeholder="Ex: 2"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`);

content = content.replace(`name="pontuacaoSanitaria"
 value={formData.pontuacaoSanitaria || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 >
 <option value="">Selecione...</option>
 <option value="1">1</option>
 <option value="2">2</option>
 <option value="3">3</option>
 <option value="4">4</option>
 <option value="5">5</option>
 </select>
 </div>`, `name="pontuacaoSanitaria"
 value={formData.pontuacaoSanitaria || ''}
 onChange={handleChange}
 className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 >
 <option value="">Selecione...</option>
 <option value="1">1</option>
 <option value="2">2</option>
 <option value="3">3</option>
 <option value="4">4</option>
 <option value="5">5</option>
 </select>
 </div>
 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-500 mb-1">Peso Amostrado (kg)</label>
 <input
  type="number"
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
  placeholder="Ao encerrar o lote"
  className="w-full border border-slate-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
 />
 </div>`);

fs.writeFileSync('src/components/VisitForm.tsx', content);
