import fs from 'fs';

let filePath = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('interface MedicationMemory')) {
  code = code.replace(
    'interface Props {',
    `interface MedicationMemory {
  produto: string;
  motivo?: string;
  doseMgKg: number;
  concentracao?: number;
  duracaoDias: number;
  carenciaDias?: number;
}

interface Props {`
  );
}

// Add motivo to memory state logic
code = code.replace(
  'carenciaDias: t.carenciaDias',
  'carenciaDias: t.carenciaDias,\n          motivo: t.motivo'
);

// Add motivo to handleUpdate autocomplete logic
code = code.replace(
  'if (!updatedItem.duracaoDias) updatedItem.duracaoDias = mem.duracaoDias;',
  'if (!updatedItem.duracaoDias) updatedItem.duracaoDias = mem.duracaoDias;\n        if (!updatedItem.motivo && mem.motivo) updatedItem.motivo = mem.motivo;'
);

// Add Motivo field to the UI
const uiSearch = `<div>
                  <label className="block text-xs text-slate-500 mb-1">Dose (mg/kg peso vivo)</label>`;
const uiReplace = `<div>
                  <label className="block text-xs text-slate-500 mb-1">Motivo do Tratamento</label>
                  <input
                    type="text"
                    value={tratamento.motivo || ''}
                    onChange={(e) => handleUpdate(index, 'motivo', e.target.value)}
                    className="w-full border border-slate-200 rounded p-1.5 text-sm"
                    placeholder="Ex: Doença Respiratória"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Dose (mg/kg peso vivo)</label>`;

code = code.replace(uiSearch, uiReplace);

fs.writeFileSync(filePath, code);
