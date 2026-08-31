const v = {    id: '357d9cbf-367c-4e9c-92f9-75ebed5836fd',    empresa_id: '00000000-0000-0000-0000-000000000002',    lote_id: 'ff74a672-cad5-4a12-8218-3bdd9e41b929',    usuario_id: '3a2bd791-821c-49aa-ad63-193837432ce5',    data_visita: '2026-08-28',    mortalidade_periodo: 2,    descartes_periodo: 0,    pontuacao_sanitaria: null,    recomendacoes: 'Lote não apresentando problemas sanitários...',    created_at: '2026-08-28T15:42:37.994812+00:00',    updated_at: '2026-08-28T15:47:09.303618+00:00',    tecnico_nome: 'Wagner',    peso_amostrado_kg: null,    curva_consumo_id: null,    avaliacao_tecnica: {}  };
const lote = {    id: 'ff74a672-cad5-4a12-8218-3bdd9e41b929',    empresa_id: '00000000-0000-0000-0000-000000000002',    integrado_id: '88ab42a5-a275-40fd-bc9b-2cce510818f1',    data_alojamento: '2026-07-08',    animais_alojados: 800,    peso_alojamento_kg: 30.7,    tipo_lote: 'Macho',    status: 'Ativo' };

const dataVisita = new Date(v.data_visita + 'T12:00:00');
const dataAloj = lote ? new Date(lote.data_alojamento + 'T12:00:00') : dataVisita;
const diffTime = Math.max(0, dataVisita.getTime() - dataAloj.getTime());
const idadeDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));
console.log('idadeDias:', idadeDias);
