const fs = require('fs');
let content = fs.readFileSync('src/lib/storage.ts', 'utf8');

// We want to replace the blind merge with a smart merge.
const target = `      // Combine remote results with local storage so no local record is ever lost
      const currentLocalVisits = getVisitsLocal();
      const visitMap = new Map<string, Visit>();
      mappedVisits.forEach(v => visitMap.set(v.id, v));
      currentLocalVisits.forEach(lv => {
        if (!visitMap.has(lv.id)) {
          visitMap.set(lv.id, lv);
        }
      });
      const finalVisits = Array.from(visitMap.values());

      const integradoMap = new Map<string, Integrado>();
      mappedIntegrados.forEach(i => integradoMap.set(i.id, i));
      currentLocalIntegrados.forEach(li => {
        if (!integradoMap.has(li.id)) {
          integradoMap.set(li.id, li);
        }
      });
      const finalIntegrados = Array.from(integradoMap.values());`;

const replacement = `      // Combine remote results with local storage intelligently
      const currentLocalVisits = getVisitsLocal();
      const visitMap = new Map<string, Visit>();
      mappedVisits.forEach(v => visitMap.set(v.id, v));
      
      // ONLY resurrect local visits if they are actively pending in the offline queue
      const vQueueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      let pendingVIds = new Set<string>();
      if (vQueueStr) {
        try {
          const queue = JSON.parse(vQueueStr);
          queue.forEach((v: any) => pendingVIds.add(v.id));
        } catch (e) {}
      }

      currentLocalVisits.forEach(lv => {
        if (!visitMap.has(lv.id) && pendingVIds.has(lv.id)) {
          visitMap.set(lv.id, lv);
        }
      });
      const finalVisits = Array.from(visitMap.values());

      const integradoMap = new Map<string, Integrado>();
      mappedIntegrados.forEach(i => integradoMap.set(i.id, i));
      
      // ONLY resurrect local integrados if they are pending upload
      // For now, we don't have an explicit 'pending create integrado' queue, but any local
      // integrado that starts with 'local-' or is not in DB can be kept if we assume offline creation.
      // However, to fix ghosting, we should only keep them if they don't look like UUIDs, or if they have visits pending.
      currentLocalIntegrados.forEach(li => {
        if (!integradoMap.has(li.id)) {
          // If it has a local-only format or is referenced by a pending visit, keep it.
          if (li.id.length < 36 || Array.from(pendingVIds).some(vid => {
            const v = currentLocalVisits.find(cv => cv.id === vid);
            return v && v.integradoId === li.id;
          })) {
             integradoMap.set(li.id, li);
          }
        }
      });
      const finalIntegrados = Array.from(integradoMap.values());`;

if (content.includes('const currentLocalVisits = getVisitsLocal();')) {
    // Basic string replace
    const index = content.indexOf('      // Combine remote results with local storage so no local record is ever lost');
    const endIndex = content.indexOf('      const finalIntegrados = Array.from(integradoMap.values());') + '      const finalIntegrados = Array.from(integradoMap.values());'.length;
    if (index > -1 && endIndex > index) {
        content = content.substring(0, index) + replacement + content.substring(endIndex);
        fs.writeFileSync('src/lib/storage.ts', content, 'utf8');
        console.log("Sync logic patched successfully.");
    } else {
        console.log("Could not find exact block");
    }
} else {
    console.log("Could not find target string.");
}
