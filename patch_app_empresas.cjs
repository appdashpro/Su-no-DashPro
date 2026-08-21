const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const baseEmpresas = (empresas && empresas.length > 0) 
    ? empresas 
    : Array.from(new Map(integrados.filter(i => i.empresaId && i.empresaName).map(i => [i.empresaId, { id: i.empresaId, nome: i.empresaName, ativo: true }])).values());`;

const replacement = `  const defaultEmpresas = [
    { id: '00000000-0000-0000-0000-000000000001', nome: 'Rações Pastre', tipo: 'CLIENTE', ativo: true },
    { id: '00000000-0000-0000-0000-000000000002', nome: 'Grupo Bugio', tipo: 'CLIENTE', ativo: true },
    { id: '00000000-0000-0000-0000-000000000003', nome: 'Agropecuaria Mugnol', tipo: 'CLIENTE', ativo: true }
  ];

  const baseEmpresas = (empresas && empresas.length > 0) 
    ? empresas 
    : (() => {
        // Fallback para quando o RLS da tabela empresas no Supabase bloqueia a leitura (retornando array vazio)
        const map = new Map();
        defaultEmpresas.forEach(e => map.set(e.id, e));
        integrados.filter(i => i.empresaId && i.empresaName).forEach(i => {
          if (!map.has(i.empresaId)) {
             map.set(i.empresaId, { id: i.empresaId, nome: i.empresaName, ativo: true });
          }
        });
        return Array.from(map.values());
      })();`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code, 'utf8');
