const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
`          safeStorage.removeItem(OFFLINE_QUEUE_KEY);
          try {
              await storage.saveVisits(getVisitsLocal(), queue);
          } catch (err) {
              // Restore the entire original queue if it failed completely to avoid losing unprocessed items
              // (The items already processed might be added again, but upserts handle duplicates fine)
              safeStorage.setItem(OFFLINE_QUEUE_KEY, queueStr);
              throw err;
          }`,
`          safeStorage.removeItem(OFFLINE_QUEUE_KEY);
          try {
              await storage.saveVisits(getVisitsLocal(), queue);
          } catch (err) {
              // Restore the original queue, BUT merge with any new items added by the UI during the sync
              const currentQueueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
              const currentQueue = currentQueueStr ? JSON.parse(currentQueueStr) : [];
              
              // Add back items that were in the queue we tried to process
              for (const v of queue) {
                  if (!currentQueue.find((q) => q.id === v.id)) {
                      currentQueue.push(v);
                  }
              }
              safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
              throw err;
          }`
);

fs.writeFileSync('src/lib/storage.ts', code);
