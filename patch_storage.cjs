const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

code = code.replace(
`const delIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
      if (delIntQueue.length > 0) {
        for (const id of delIntQueue) {
          try {
            const { data: vList } = await supabase.from('visitas').select('id').eq('lote_id', id);
            if (vList && vList.length > 0) {
              const vIds = vList.map(v => v.id);
              await supabase.from('cargas_racao').delete().in('visita_id', vIds);
              await supabase.from('tratamentos').delete().in('visita_id', vIds);
              await supabase.from('visitas').delete().eq('lote_id', id);
            }
            await supabase.from('cargas_racao').delete().eq('lote_id', id);
            await supabase.from('tratamentos').delete().eq('lote_id', id);
            await supabase.from('lotes').delete().eq('id', id);
          } catch (delErr) {
            console.error('Erro ao sincronizar exclusão de lote:', delErr);
          }
        }
        safeStorage.removeItem(OFFLINE_DELETE_INTEGRADO_QUEUE);
      }`,
`const delIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
      if (delIntQueue.length > 0) {
        let remainingDelIntQueue = [];
        for (const id of delIntQueue) {
          try {
            const { data: vList, error: selErr } = await supabase.from('visitas').select('id').eq('lote_id', id);
            if (selErr) throw selErr;
            if (vList && vList.length > 0) {
              const vIds = vList.map(v => v.id);
              await supabase.from('cargas_racao').delete().in('visita_id', vIds);
              await supabase.from('tratamentos').delete().in('visita_id', vIds);
              await supabase.from('visitas').delete().eq('lote_id', id);
            }
            await supabase.from('cargas_racao').delete().eq('lote_id', id);
            await supabase.from('tratamentos').delete().eq('lote_id', id);
            const { error: delErr } = await supabase.from('lotes').delete().eq('id', id);
            if (delErr) throw delErr;
          } catch (delErr) {
            console.error('Erro ao sincronizar exclusão de lote:', delErr);
            if (delErr && (delErr.message && (delErr.message.includes('fetch') || delErr.message.includes('network') || delErr.message.includes('timeout')) || delErr.code === '0')) {
                remainingDelIntQueue.push(id);
            }
          }
        }
        if (remainingDelIntQueue.length > 0) {
          safeStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(remainingDelIntQueue));
        } else {
          safeStorage.removeItem(OFFLINE_DELETE_INTEGRADO_QUEUE);
        }
      }`
);

code = code.replace(
`      const delVisitQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
      if (delVisitQueue.length > 0) {
        for (const id of delVisitQueue) {
          try {
            await supabase.from('cargas_racao').delete().eq('visita_id', id);
            await supabase.from('tratamentos').delete().eq('visita_id', id);
            await supabase.from('visitas').delete().eq('id', id);
          } catch (delErr) {
            console.error('Erro ao sincronizar exclusão de visita:', delErr);
          }
        }
        safeStorage.removeItem(OFFLINE_DELETE_VISIT_QUEUE);
      }`,
`      const delVisitQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
      if (delVisitQueue.length > 0) {
        let remainingDelVisitQueue = [];
        for (const id of delVisitQueue) {
          try {
            const { error: err1 } = await supabase.from('cargas_racao').delete().eq('visita_id', id);
            if (err1) throw err1;
            const { error: err2 } = await supabase.from('tratamentos').delete().eq('visita_id', id);
            if (err2) throw err2;
            const { error: err3 } = await supabase.from('visitas').delete().eq('id', id);
            if (err3) throw err3;
          } catch (delErr) {
            console.error('Erro ao sincronizar exclusão de visita:', delErr);
            if (delErr && (delErr.message && (delErr.message.includes('fetch') || delErr.message.includes('network') || delErr.message.includes('timeout')) || delErr.code === '0')) {
                remainingDelVisitQueue.push(id);
            }
          }
        }
        if (remainingDelVisitQueue.length > 0) {
          safeStorage.setItem(OFFLINE_DELETE_VISIT_QUEUE, JSON.stringify(remainingDelVisitQueue));
        } else {
          safeStorage.removeItem(OFFLINE_DELETE_VISIT_QUEUE);
        }
      }`
);

fs.writeFileSync('src/lib/storage.ts', code);
