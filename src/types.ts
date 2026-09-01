// ==============================================================================
// 1. MODELOS RELACIONAIS DO BANCO DE DADOS (SUPABASE V3)
// ==============================================================================

export interface MetasCurva {
  metaAlojamento: number;
  metaCrescimento1: number;
  metaCrescimento2: number;
  metaCrescimento3: number;
  metaTerminacao1: number;
  metaTerminacao2: number;
  metaAcumulada: number;
}

export interface CurveConfig {
  id: string;
  nome: string;
  dataVigencia: string;
  tipoLote: 'Misto' | 'Macho' | 'Fêmea';
  fase?: string;
  tipoCalculo: 'DIA_UM' | 'PESO_ALOJAMENTO';
  metaMortalidade: number;
  last_modified_by?: string;
  last_modified_at?: string;
  curve: any[]; // GrowthCurvePoint[]
  metas: MetasCurva;
  programa_alimentar?: any[];
}

export interface EmpresaConfig {
  empresa_id: string;
  tipo_calculo_curva: 'DIA_UM' | 'PESO_ALOJAMENTO';
  meta_mortalidade: number;
  curva_desempenho?: any[]; // Now can hold CurveConfig[] or legacy flat array
  programa_alimentar: any[];
  medicamentos_permitidos: string[];
  causas_mortalidade: string[];
  tecnicos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type PapelUsuario = 
  | 'MASTER' 
  | 'TECNICO_NUTRON' 
  | 'TECNICO_CLIENTE' 
  | 'SUPER_ADMIN' 
  | 'ADMIN_EMPRESA' 
  | 'COORDENADOR' 
  | 'TECNICO' 
  | 'CLIENTE_VISUALIZADOR';

export interface UserProfile {
  id: string;
  auth_uid?: string;
  email: string;
  nome: string;
  papel: PapelUsuario;
  empresa_id?: string;
  empresa_nome?: string;
  integrado_padrao_id?: string;
  clientes_permitidos?: string[]; // IDs ou nomes de integrados/clientes que pode acessar
}

export interface TecnicoIntegrado {
  id?: string;
  usuario_id: string;
  integrado_id: string;
  created_at?: string;
}

export function getRoleLabel(papel?: PapelUsuario | string): string {
  switch (papel) {
    case 'MASTER':
    case 'SUPER_ADMIN':
      return 'Acesso Master';
    case 'TECNICO_NUTRON':
      return 'Técnico Nutron';
    case 'TECNICO_CLIENTE':
      return 'Técnico Cliente';
    case 'ADMIN_EMPRESA':
      return 'Administrador Cliente';
    case 'COORDENADOR':
      return 'Coordenador Técnico';
    case 'TECNICO':
      return 'Técnico de Campo';
    case 'CLIENTE_VISUALIZADOR':
      return 'Visualizador';
    default:
      return 'Técnico';
  }
}

export function isMasterRole(papel?: PapelUsuario | string): boolean {
  return papel === 'MASTER' || papel === 'SUPER_ADMIN';
}

export function isNutronTech(papel?: PapelUsuario | string): boolean {
  return papel === 'TECNICO_NUTRON' || papel === 'COORDENADOR';
}

export function isClientTech(papel?: PapelUsuario | string): boolean {
  return papel === 'TECNICO_CLIENTE' || papel === 'TECNICO' || papel === 'ADMIN_EMPRESA';
}

export interface Usuario {
  id: string;
  auth_uid: string;
  empresa_id: string;
  nome: string;
  email: string;
  papel: PapelUsuario;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface IntegradoDB {
  id: string;
  empresa_id: string;
  nome: string;
  comedouro_tipo?: 'Linear' | 'Automático' | 'Linear com água' | 'Automático com água' | 'Misto' | string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
}

export interface PontoMetaJSON {
  dia: number;
  consumoEsperadoKg: number;
  pesoEsperadoKg?: number;
  gpdEsperadoG?: number;
}

export interface BudgetFaseJSON {
  fase: string; // 'Alojamento', 'Crescimento 1', 'Crescimento 2', 'Crescimento 3', 'Terminação 1', 'Terminação 2'
  kgPorAnimal: number;
}

export interface CurvaDB {
  id: string;
  empresa_id: string;
  nome: string;
  versao: number;
  sexo_lote: 'Macho' | 'Fêmea' | 'Misto' | string;
  metas_json: {
    pontos?: PontoMetaJSON[];
    budgets?: BudgetFaseJSON[];
  } | any;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  deleted_at?: string | null;
}

export interface LoteDB {
  id: string;
  empresa_id: string;
  integrado_id: string;
  data_alojamento: string; // YYYY-MM-DD
  animais_alojados: number;
  peso_alojamento_kg?: number | null;
  tipo_lote?: 'Misto' | 'Fêmea' | 'Macho' | string | null;
  status: 'Ativo' | 'Encerrado';
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;

  // Joins opcionais
  integrado?: IntegradoDB;
}

export interface CargaRacaoDB {
  id: string;
  empresa_id: string;
  visita_id: string;
  lote_id: string;
  tipo_racao: string;
  quantidade_kg: number;
  created_at: string;
  created_by?: string | null;
}

export interface TratamentoDB {
  id: string;
  empresa_id: string;
  visita_id: string;
  lote_id: string;
  medicamento: string;
  motivo?: string | null;
  concentracao?: number | null;
  via_administracao: 'Ração' | 'Água' | 'Injetável' | string;
  dosagem_quantidade: number;
  unidade_medida: 'kg' | 'L' | 'frasco' | 'g' | string;
  dias_duracao?: number;
  carencia_dias?: number;
  created_at: string;
  created_by?: string | null;
  deleted_at?: string | null;
}

export interface VisitaDB {
  id: string;
  empresa_id: string;
  lote_id: string;
  usuario_id: string;
  data_visita: string; // YYYY-MM-DD
  mortalidade_periodo: number;
  descartes_periodo: number;
  pontuacao_sanitaria?: string | null;
  recomendacoes?: string | null;
  avaliacao_tecnica?: AvaliacaoTecnica | null;
  curva_consumo_id?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;

  // Relacionamentos aninhados opcionais
  cargas?: CargaRacaoDB[];
  tratamentos?: TratamentoDB[];
  entregas?: VisitaEntregaDB[];
  lote?: LoteDB;
}

export interface RelatorioUnificadoRow {
  Empresa: string;
  Integrado: string;
  Comedouro?: string;
  Lote_ID: string;
  Alojamento: string;
  "Animais Alojados": number;
  "Peso Aloj"?: number;
  "Tipo Lote"?: string;
  "Data Visita": string;
  "Idade Dias": number;
  "Mortalidade Visita": number;
  "Descartes Visita": number;
  "Pontuação Sanitária"?: string;
  Recomendações?: string;
  "Cargas na Visita (kg)": number;
  "Detalhe Cargas": string;
  "Tratamentos Realizados": string;
  Técnico?: string;
}

// ==============================================================================
// 2. MODELOS LEGADOS (MANTIDOS PARA COMPATIBILIDADE DURANTE TRANSIÇÃO)
// ==============================================================================

export interface Integrado {
  id: string;
  name: string;
  loteNumber?: string;
  alojamentoDate: string;
  status: 'Em andamento' | 'Fechado';
  fechamentoDate?: string;
  empresaId?: string;
  empresaName?: string;
}

export interface Tratamento {
  id: string;
  produto: string;
  motivo?: string;
  doseMgKg: number;
  duracaoDias: number;
  concentracao?: number;
  quantidadePorDia?: number;
  quantidadeTotal?: number;
  carenciaDias?: number;
  pesoEstimadoKg?: number;
}


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

export interface Visit {
  id: string;
  date: string;
  integradoId: string;
  idade: number; // in days
  recomendacao: string;
  avaliacao_tecnica?: AvaliacaoTecnica | null;
  tratamentos?: Tratamento[];
  entregas?: VisitaEntrega[];
  consumoAcumuladoReal?: number;
  mortalidade?: number; // Historically used as percentage or absolute
  animaisAlojados?: number;
  animaisMortos?: number;
  volumeTotalCargas?: number;
  comedouro: 'Linear' | 'Automático' | 'Linear com água' | 'Automático com água' | 'Misto' | string;
  tipoLote?: 'Misto' | 'Fêmea' | 'Macho';
  colaborador: string;
  consumoRacaoMeta?: string | Record<string, any>;
  pesoAloj?: number;
  pontuacaoSanitaria?: number;
  cargaAlojamento?: number;
  metaAlojamento?: number;
  consumoAlojamento?: number;
  curva_consumo_id?: string;
  cargaCrescimento1?: number;
  metaCrescimento1?: number;
  consumoCrescimento1?: number;
  cargaCrescimento2?: number;
  metaCrescimento2?: number;
  consumoCrescimento2?: number;
  cargaCrescimento3?: number;
  metaCrescimento3?: number;
  consumoCrescimento3?: number;
  cargaTerminacao1?: number;
  metaTerminacao1?: number;
  consumoTerminacao1?: number;
  cargaTerminacao2?: number;
  metaTerminacao2?: number;
  consumoTerminacao2?: number;
  metaAcumulada?: number;
  descartesPeriodo?: number;
  pesoAmostradoKg?: number;
}

export interface GrowthCurvePoint {
  dia: number;
  pesoInicial: number;
  pesoFinal: number;
  cmd: number;
  consumoAcumulado: number;
  gpd: number;
}

export function isVisitForIntegrado(visit: Visit, integrado: Integrado): boolean {
  if (!visit || !integrado) return false;
  if (visit.integradoId === integrado.id) return true;
  
  const norm = (s?: string) => (s || '').trim().toLowerCase().replace(/\s+/g, '');
  const normDate = (d?: string) => (d || '').replace(/[-/]/g, '');

  if (visit.integradoId && visit.integradoId.startsWith('i_')) {
    const expectedLegacyId = `i_${norm(integrado.name)}_${normDate(integrado.alojamentoDate)}`;
    if (norm(visit.integradoId) === norm(expectedLegacyId)) return true;
  }

  return false;
}


export interface AvaliacaoTecnica {
  granja: {
    limpeza_baias: number;
    desperdicio_racao: number;
    ventilacao_cortinas: number;
    ficha_lote: number;
  };
  suinos: {
    tosse: number;
    diarreia: number;
    uniformidade: number;
    canibalismo: number;
    prolapso: number;
    parecer_medicacao: number;
  };
}
