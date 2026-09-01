const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const newTypes = `
export interface CatalogoProduto {
  id: string;
  empresa_id: string;
  nome: string;
  categoria: 'Injetável' | 'Vacina' | 'Insumo' | 'Equipamento' | string;
  unidade_medida: string;
  preco_base: number;
  ativo: boolean;
}

export interface VisitaEntregaDB {
  id: string;
  empresa_id: string;
  visita_id: string;
  produto_id: string;
  quantidade: number;
  valor_unitario_aplicado: number;
  status_faturamento: 'Pendente' | 'Faturado';
  created_at?: string;
  // Join fields
  produto_nome?: string;
}

export interface VisitaEntrega {
  id: string;
  produto_id: string;
  produto_nome?: string;
  quantidade: number;
  valor_unitario_aplicado: number;
  status_faturamento?: 'Pendente' | 'Faturado';
}
`;

// Insert newTypes before Visit
code = code.replace('export interface Visit {', newTypes + '\nexport interface Visit {');
code = code.replace('tratamentos?: Tratamento[];', 'tratamentos?: Tratamento[];\n  entregas?: VisitaEntrega[];');
code = code.replace('tratamentos?: TratamentoDB[];', 'tratamentos?: TratamentoDB[];\n  entregas?: VisitaEntregaDB[];');

fs.writeFileSync('src/types.ts', code);
