import fs from 'fs';

let filePath = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

// We need to add useState and useEffect from react
if (!code.includes('useState')) {
  code = code.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';");
} else if (!code.includes('useEffect')) {
  code = code.replace("useState } from 'react'", "useState, useEffect } from 'react'");
}

// Add the memory interface
const interfaceString = `
interface MedicationMemory {
  produto: string;
  doseMgKg: number;
  concentracao?: number;
  duracaoDias: number;
  carenciaDias?: number;
}
`;

if (!code.includes('MedicationMemory')) {
  code = code.replace('interface TratamentosFormSectionProps {', interfaceString + '\ninterface TratamentosFormSectionProps {');
}

// Inside the component, add memory state and effect
const stateHookStr = `
  const [memory, setMemory] = useState<MedicationMemory[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('medicationMemory');
      if (stored) setMemory(JSON.parse(stored));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!tratamentos || tratamentos.length === 0) return;
    const newMemory = [...memory];
    let changed = false;
    tratamentos.forEach(t => {
      if (t.produto && t.produto.trim().length > 2 && t.doseMgKg && t.duracaoDias) {
        const existingIdx = newMemory.findIndex(m => m.produto.toLowerCase() === t.produto.trim().toLowerCase());
        const newEntry = {
          produto: t.produto.trim(),
          doseMgKg: t.doseMgKg,
          concentracao: t.concentracao,
          duracaoDias: t.duracaoDias,
          carenciaDias: t.carenciaDias
        };
        if (existingIdx >= 0) {
          if (JSON.stringify(newMemory[existingIdx]) !== JSON.stringify(newEntry)) {
             newMemory[existingIdx] = newEntry;
             changed = true;
          }
        } else {
          newMemory.push(newEntry);
          changed = true;
        }
      }
    });
    if (changed) {
      setMemory(newMemory);
      localStorage.setItem('medicationMemory', JSON.stringify(newMemory));
    }
  }, [tratamentos, memory]);
`;

code = code.replace('  const [isExpanded, setIsExpanded] = useState(false);', '  const [isExpanded, setIsExpanded] = useState(false);\n' + stateHookStr);

// Modify handleUpdate
const originalHandleUpdate = `const handleUpdate = (index: number, field: keyof Tratamento, value: any) => {
    const newTratamentos = [...tratamentos];
    newTratamentos[index] = { ...newTratamentos[index], [field]: value };
    
    // Recalculate quantities`;

const newHandleUpdate = `const handleUpdate = (index: number, field: keyof Tratamento, value: any) => {
    const newTratamentos = [...tratamentos];
    let updatedItem = { ...newTratamentos[index], [field]: value };
    
    if (field === 'produto' && value) {
      const mem = memory.find(m => m.produto.toLowerCase() === String(value).trim().toLowerCase());
      if (mem) {
        if (!updatedItem.doseMgKg) updatedItem.doseMgKg = mem.doseMgKg;
        if (!updatedItem.concentracao && mem.concentracao) updatedItem.concentracao = mem.concentracao;
        if (!updatedItem.duracaoDias) updatedItem.duracaoDias = mem.duracaoDias;
        if (!updatedItem.carenciaDias && mem.carenciaDias) updatedItem.carenciaDias = mem.carenciaDias;
      }
    }
    
    newTratamentos[index] = updatedItem;
    
    // Recalculate quantities`;

code = code.replace(originalHandleUpdate, newHandleUpdate);

// Add datalist to the render
if (!code.includes('<datalist id="medication-suggestions">')) {
  code = code.replace('</button>\n        </div>\n      )}\n    </div>', 
    `</button>\n        </div>\n      )}\n      <datalist id="medication-suggestions">\n        {memory.map(m => (\n          <option key={m.produto} value={m.produto} />\n        ))}\n      </datalist>\n    </div>`);
}

// Add list="medication-suggestions" to the input
code = code.replace(/<input\s+type="text"\s+value=\{tratamento.produto\}/, '<input\n                    list="medication-suggestions"\n                    type="text"\n                    value={tratamento.produto}');


fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patched TratamentosFormSection.tsx");
