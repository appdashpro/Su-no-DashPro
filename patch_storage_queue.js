import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Add export const OFFLINE_EDIT_INTEGRADO_QUEUE
if (!code.includes('OFFLINE_EDIT_INTEGRADO_QUEUE')) {
  code = code.replace(
    /export const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';/,
    `export const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';\nexport const OFFLINE_EDIT_INTEGRADO_QUEUE = 'suino_dashpro_offline_edit_integrado';`
  );
}

// 2. Add the sync logic in syncFromSupabase
const syncLogic = `
      const editIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_EDIT_INTEGRADO_QUEUE) || '[]');
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
      }
`;

if (!code.includes('editIntQueue')) {
  const insertPoint = code.indexOf(`const delIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');`);
  if (insertPoint !== -1) {
    code = code.slice(0, insertPoint) + syncLogic + code.slice(insertPoint);
  }
}

fs.writeFileSync(filePath, code, 'utf-8');
console.log("Patch applied successfully to storage.ts");
