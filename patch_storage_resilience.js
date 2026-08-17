import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const oldLogic = `      const editIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_EDIT_INTEGRADO_QUEUE) || '[]');
      if (editIntQueue.length > 0) {
        for (const edit of editIntQueue) {
          try {
            await supabase.from('lotes').update({
              data_alojamento: edit.alojamentoDate,
              status: edit.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
              data_abate: edit.fechamentoDate || null
            }).eq('id', edit.id);
          } catch (editErr) {
            console.error('Erro ao sincronizar edicao de lote:', editErr);
          }
        }
        safeStorage.removeItem(OFFLINE_EDIT_INTEGRADO_QUEUE);
      }`;

const newLogic = `      let editIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_EDIT_INTEGRADO_QUEUE) || '[]');
      if (editIntQueue.length > 0) {
        let remainingQueue = [];
        for (const edit of editIntQueue) {
          try {
            const { error: editErr } = await supabase.from('lotes').update({
              data_alojamento: edit.alojamentoDate,
              status: edit.status === 'Em andamento' ? 'Ativo' : 'Encerrado',
              data_abate: edit.fechamentoDate || null
            }).eq('id', edit.id);
            if (editErr) {
              console.error('Erro ao sincronizar edicao de lote:', editErr);
              // Only keep in queue if it's likely a network error
              if (editErr.message && (editErr.message.includes('fetch') || editErr.message.includes('network') || editErr.message.includes('timeout'))) {
                remainingQueue.push(edit);
              }
            }
          } catch (editErr: any) {
            console.error('Exception ao sincronizar edicao de lote:', editErr);
            if (editErr.message && (editErr.message.includes('fetch') || editErr.message.includes('network') || editErr.message.includes('timeout'))) {
                remainingQueue.push(edit);
            }
          }
        }
        if (remainingQueue.length > 0) {
          safeStorage.setItem(OFFLINE_EDIT_INTEGRADO_QUEUE, JSON.stringify(remainingQueue));
        } else {
          safeStorage.removeItem(OFFLINE_EDIT_INTEGRADO_QUEUE);
        }
      }`;

if (code.includes('for (const edit of editIntQueue) {')) {
  code = code.replace(oldLogic, newLogic);
  fs.writeFileSync(filePath, code, 'utf-8');
  console.log("Patch applied successfully to storage.ts resilience");
} else {
  console.log("Logic not found");
}
