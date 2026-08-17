const fs = require('fs');

let storageCode = fs.readFileSync('src/lib/storage.ts', 'utf8');

// I will add a method migrateIds
const migrationCode = `
  migrateIds: () => {
    try {
        let integrados = getIntegradosLocal();
        let visits = getVisitsLocal();
        let changed = false;

        // Create a mapping of old loteId to new valid UUIDs
        const loteMap: Record<string, string> = {};

        integrados = integrados.map(i => {
            if (i.id && (i.id.startsWith('i_') || i.id.startsWith('dummy_'))) {
                const newId = crypto.randomUUID();
                loteMap[i.id] = newId;
                changed = true;
                return { ...i, id: newId };
            }
            return i;
        });

        visits = visits.map(v => {
            let updated = false;
            let newV = { ...v };
            if (v.id && (v.id.startsWith('v_') || v.id.startsWith('dummy_'))) {
                newV.id = crypto.randomUUID();
                updated = true;
                changed = true;
            }
            if (v.integradoId && loteMap[v.integradoId]) {
                newV.integradoId = loteMap[v.integradoId];
                updated = true;
                changed = true;
            } else if (v.integradoId && (v.integradoId.startsWith('i_') || v.integradoId.startsWith('dummy_'))) {
                // Visit has an invalid loteId but it's not in the integrados list!
                const newId = crypto.randomUUID();
                loteMap[v.integradoId] = newId;
                newV.integradoId = newId;
                updated = true;
                changed = true;
            }
            return updated ? newV : v;
        });

        // Also update pending sync queue
        let queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
        if (queueStr) {
            let queue = JSON.parse(queueStr);
            let queueChanged = false;
            queue = queue.map((v: any) => {
                let newV = { ...v };
                // Wait, the queue items are exactly the visits! So we can just map over the updated visits
                const updatedVisit = visits.find(uv => uv.date === v.date && uv.colaborador === v.colaborador); // Hacky find
                if (updatedVisit) {
                    queueChanged = true;
                    return updatedVisit;
                }
                return v;
            });
            if (queueChanged) {
                safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            }
        }

        if (changed) {
            safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
            safeStorage.setItem(VISITS_KEY, JSON.stringify(visits));
            // Since we modified queue too, we are good.
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
  },
`;

if (!storageCode.includes("migrateIds:")) {
    storageCode = storageCode.replace("export const storage = {", "export const storage = {\n" + migrationCode);
    fs.writeFileSync('src/lib/storage.ts', storageCode);
    console.log("Added migration");
}
