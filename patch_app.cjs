const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
`   // Update in-memory state with freshly synchronized local store
   const dataIntegrados = await storage.getIntegrados();
   const dataVisits = await storage.getVisits();
   setIntegrados(Array.isArray(dataIntegrados) ? dataIntegrados : []);
   setVisits(Array.isArray(dataVisits) ? dataVisits : []);
   setPendingSyncIds(storage.getPendingSyncIds());
   setSyncRetryStatus(null);
 } catch (err: any) {`,
`   setSyncRetryStatus(null);
 } catch (err: any) {
   // Even if it throws (e.g., offline queue partially failed), we might have downloaded new data.
   // So we still want to update the in-memory state!
`);

code = code.replace(
`} finally {
   isSyncInProgressRef.current = false;`,
`} finally {
   const dataIntegrados = await storage.getIntegrados();
   const dataVisits = await storage.getVisits();
   setIntegrados(Array.isArray(dataIntegrados) ? dataIntegrados : []);
   setVisits(Array.isArray(dataVisits) ? dataVisits : []);
   setPendingSyncIds(storage.getPendingSyncIds());
   isSyncInProgressRef.current = false;`
);

fs.writeFileSync('src/App.tsx', code);
