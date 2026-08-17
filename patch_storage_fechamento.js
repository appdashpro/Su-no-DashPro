import fs from 'fs';

const filePath = 'src/lib/storage.ts';
let code = fs.readFileSync(filePath, 'utf-8');

const target = `      const mappedIntegrados: Integrado[] = (lotesDB || []).map(lote => {
        const integrado = integradosDB?.find(i => i.id === lote.integrado_id);
        return {
          id: lote.id, 
          name: integrado?.nome || 'Desconhecido',
          alojamentoDate: lote.data_alojamento,
          status: lote.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          fechamentoDate: undefined
        };
      });`;

const replacement = `      const currentLocalIntegrados = getIntegradosLocal();
      const mappedIntegrados: Integrado[] = (lotesDB || []).map(lote => {
        const integrado = integradosDB?.find(i => i.id === lote.integrado_id);
        const localVersion = currentLocalIntegrados.find(i => i.id === lote.id);
        return {
          id: lote.id, 
          name: integrado?.nome || 'Desconhecido',
          alojamentoDate: lote.data_alojamento,
          status: lote.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          fechamentoDate: localVersion?.fechamentoDate || undefined
        };
      });`;

if (code.includes('fechamentoDate: undefined')) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code, 'utf-8');
  console.log("Successfully patched fechamentoDate persistence");
} else {
  console.log("Could not find target to replace.");
}
