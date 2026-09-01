const fs = require('fs');
let code = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

code = code.replace(
  '<input type="number" step="0.01" name="consumoAcumuladoReal" value={formData.consumoAcumuladoReal ?? \'\'} onChange={handleChange} className={`w-full border border-slate-300 rounded p-1.5 text-xs md:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none',
  '<input type="number" step="0.01" name="consumoAcumuladoReal" value={formData.consumoAcumuladoReal ?? \'\'} readOnly className={`w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm font-bold bg-slate-50 focus:outline-none cursor-not-allowed'
);

fs.writeFileSync('src/components/VisitForm.tsx', code);
