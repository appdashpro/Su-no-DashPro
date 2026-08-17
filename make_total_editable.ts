import fs from 'fs';

let content = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

const toReplace = `<tfoot className="border-t-2 border-slate-200 font-semibold bg-slate-50">
 <tr>
 <td className="py-3 pr-2 md:pr-4 pl-2 text-slate-700 text-xs md:text-sm">TOTAL ACUMULADO</td>
 <td className="py-3 pr-2 md:pr-4">
 <input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas || ''} onChange={handleChange} className="w-full border border-slate-200 rounded p-1.5 text-xs md:text-sm font-bold bg-slate-100 focus:ring-2 focus:ring-blue-500 outline-none" readOnly placeholder="0.00" />
 </td>`;

const replaceWith = `<tfoot className="border-t-2 border-slate-200 font-semibold bg-slate-50">
 <tr>
 <td className="py-3 pr-2 md:pr-4 pl-2 text-slate-700 text-xs md:text-sm">TOTAL ACUMULADO<br/><span className="text-[10px] font-normal text-slate-500">(Editável se faltar fase)</span></td>
 <td className="py-3 pr-2 md:pr-4">
 <input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas || ''} onChange={handleChange} className="w-full border border-slate-300 rounded p-1.5 text-xs md:text-sm font-bold bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
 </td>`;

content = content.replace(toReplace, replaceWith);

fs.writeFileSync('src/components/VisitForm.tsx', content);
