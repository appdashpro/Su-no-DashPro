import fs from 'fs';

let filePath = 'src/components/TratamentosFormSection.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const oldLogic = `        if (existingIdx >= 0) {
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
    }`;

const newLogic = `        if (existingIdx >= 0) {
          if (JSON.stringify(newMemory[existingIdx]) !== JSON.stringify(newEntry) || existingIdx !== 0) {
             newMemory.splice(existingIdx, 1);
             newMemory.unshift(newEntry);
             changed = true;
          }
        } else {
          newMemory.unshift(newEntry);
          changed = true;
        }
      }
    });
    if (changed) {
      newMemory = newMemory.slice(0, 5); // Limitar aos últimos 5
      setMemory(newMemory);
      localStorage.setItem('medicationMemory', JSON.stringify(newMemory));
    }`;

if (code.includes(oldLogic)) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(filePath, code);
  console.log("Patched successfully");
} else {
  console.log("Could not find the old logic string");
}
