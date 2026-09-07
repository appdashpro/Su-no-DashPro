const fs = require('fs');

// 1. Patch Visits.tsx
let visitsCode = fs.readFileSync('src/components/Visits.tsx', 'utf8');
const targetVisits = `<td className="px-2 py-2 whitespace-nowrap">{v.volumeTotalCargas ?? '-'}</td>`;
const replaceVisits = `<td className="px-2 py-2 whitespace-nowrap">{v.volumeTotalCargas !== undefined && v.volumeTotalCargas !== null && String(v.volumeTotalCargas).trim() !== '' ? Number(v.volumeTotalCargas).toFixed(2) : '-'}</td>`;
visitsCode = visitsCode.replace(targetVisits, replaceVisits);
fs.writeFileSync('src/components/Visits.tsx', visitsCode);

// 2. Patch VisitForm.tsx
let formCode = fs.readFileSync('src/components/VisitForm.tsx', 'utf8');

// Ensure that volumeTotalCargas is rounded to 2 decimals when auto-calculated
const targetAutoCalc = `newData.volumeTotalCargas = sumCargas > 0 ? sumCargas : undefined;`;
const replaceAutoCalc = `newData.volumeTotalCargas = sumCargas > 0 ? Number(sumCargas.toFixed(2)) : undefined;`;
formCode = formCode.replace(targetAutoCalc, replaceAutoCalc);

// Format the input value inside VisitForm.tsx to 2 decimal places if it exists
const targetFormRender = `<input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas ?? ''} onChange={handleChange}`;
const replaceFormRender = `<input type="number" step="0.01" name="volumeTotalCargas" value={formData.volumeTotalCargas !== undefined && formData.volumeTotalCargas !== null && formData.volumeTotalCargas !== '' ? Number(formData.volumeTotalCargas).toFixed(2) : ''} onChange={handleChange}`;
// Oh wait, putting toFixed(2) on the input value directly might make it hard to type a decimal point.
// Actually, it's a number input. If we strictly format it, the user might not be able to type "2." because it becomes "2.00" and the cursor jumps.
// A better place is when preparing the data for save (onSave).

const targetOnSave = `volumeTotalCargas: visitData.volumeTotalCargas !== undefined && visitData.volumeTotalCargas !== null && String(visitData.volumeTotalCargas).trim() !== '' ? Number(visitData.volumeTotalCargas) : undefined,`;
const replaceOnSave = `volumeTotalCargas: visitData.volumeTotalCargas !== undefined && visitData.volumeTotalCargas !== null && String(visitData.volumeTotalCargas).trim() !== '' ? Number(Number(visitData.volumeTotalCargas).toFixed(2)) : undefined,`;
formCode = formCode.replace(targetOnSave, replaceOnSave);

fs.writeFileSync('src/components/VisitForm.tsx', formCode);

// 3. Patch Supabase backup to also ensure 2 decimals when storing (if any sync logic does it separately)
let storageBackup = fs.readFileSync('src/lib/storage.backup.ts', 'utf8');
const targetBackup = `'Vol. Cargas (kg)': toNum(v.volumeTotalCargas),`;
const replaceBackup = `'Vol. Cargas (kg)': v.volumeTotalCargas !== undefined && v.volumeTotalCargas !== null ? Number(v.volumeTotalCargas).toFixed(2) : '',`;
storageBackup = storageBackup.replace(targetBackup, replaceBackup);
fs.writeFileSync('src/lib/storage.backup.ts', storageBackup);
