import { safeStorage } from "./safeStorage";
import { getCachedAuthSession } from "./auth";
import { Integrado, Visit, Tratamento } from '../types';
import { supabase } from './supabase';
import { getActiveCurve, initialIntegrados, initialVisits } from '../data';

const INTEGRADOS_KEY = 'suino_dashpro_integrados';
const VISITS_KEY = 'suino_dashpro_visits';
export const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';
export const OFFLINE_DELETE_VISIT_QUEUE = 'suino_dashpro_offline_delete_visit';
export const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';
export const OFFLINE_EDIT_INTEGRADO_QUEUE = "suino_dashpro_offline_edit_integrado";

const parseQueueSafe = (key: string) => {
  try {
    const data = safeStorage.getItem(key);
    if (!data || data === 'undefined' || data === 'null') return [];
    return JSON.parse(data) || [];
  } catch (e) {
    console.error(`Invalid JSON in queue ${key}, clearing it.`);
    safeStorage.removeItem(key);
    return [];
  }
};

import { defaultMugnolConfig } from '../mugnolConfig';
import { generateUUID } from '../utils/uuid';


export const getSyncLogs = () => {
  try {
    const data = safeStorage.getItem('SYNC_DIAGNOSTIC_LOGS');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
export const addSyncLog = (message: string, error?: any) => {
  try {
    const logs = getSyncLogs();
    
    let errorStr = undefined;
    if (error) {
      if (error instanceof Error) {
        errorStr = `${error.name}: ${error.message}\n${error.stack}`;
      } else if (typeof error === 'object') {
        try {
            errorStr = JSON.stringify(error);
            if (errorStr === '{}') {
                errorStr = error.message || error.toString();
            }
        } catch(e) {
            errorStr = String(error);
        }
      } else {
        errorStr = String(error);
      }
    }
    
    logs.unshift({
      time: new Date().toISOString(),
      message,
      error: errorStr
    });
    safeStorage.setItem('SYNC_DIAGNOSTIC_LOGS', JSON.stringify(logs.slice(0, 50)));
  } catch (e) {}
};
export const clearSyncLogs = () => {
  safeStorage.removeItem('SYNC_DIAGNOSTIC_LOGS');
};

export const CONFIGS_KEY = "suino_dashpro_empresa_configs";
export const getEmpresaConfigsLocal = () => { 
  try { 
    const data = safeStorage.getItem(CONFIGS_KEY); 
    let parsed = data ? JSON.parse(data) : []; 
    
    // Ensure Mugnol config is always present if not explicitly saved
    const mugnolIndex = parsed.findIndex((c: any) => c.empresa_id === defaultMugnolConfig.empresa_id);
    if (mugnolIndex === -1) {
      parsed.push(defaultMugnolConfig);
    } else {
      // Always ensure we have the specific Mugnol curva and programa alimentar if they are empty
      if (!parsed[mugnolIndex].curva_desempenho || parsed[mugnolIndex].curva_desempenho.length === 0) {
        parsed[mugnolIndex].curva_desempenho = defaultMugnolConfig.curva_desempenho;
      } else {
         const hasPadrao = parsed[mugnolIndex].curva_desempenho.find((c: any) => c.id === 'mugnol_padrao_2026');
         if (!hasPadrao) {
            parsed[mugnolIndex].curva_desempenho.push(defaultMugnolConfig.curva_desempenho[0]);
         }
      }
      
      if (!parsed[mugnolIndex].programa_alimentar || parsed[mugnolIndex].programa_alimentar.length === 0) {
        parsed[mugnolIndex].programa_alimentar = defaultMugnolConfig.programa_alimentar;
      }
    }
    
    return parsed; 
  } catch { 
    return [defaultMugnolConfig]; 
  } 
};

const EMPRESA_ID = '00000000-0000-0000-0000-000000000000';

const getIntegradosLocal = (): Integrado[] => {
  try {
    const data = safeStorage.getItem(INTEGRADOS_KEY);
    const parsed: Integrado[] = data ? JSON.parse(data) : []; 
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return initialIntegrados;
  } catch {
    return initialIntegrados;
  }
};

const getVisitsLocal = (): Visit[] => {
  try {
    const data = safeStorage.getItem(VISITS_KEY);
    const parsed = data ? JSON.parse(data) : []; 
    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : initialVisits;
  } catch {
    return initialVisits;
  }
};

function addVisitsToOfflineQueue(toProcess: any[]) {
  try {
    const queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
    for (const v of toProcess) {
      const existingIdx = queue.findIndex((q: any) => q.id === v.id);
      if (existingIdx >= 0) queue[existingIdx] = v;
      else queue.push(v);
    }
    safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to add to offline queue', e);
  }
}

function isNetworkError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : err.message || '';
  // Don't treat Postgres schema errors as network errors
  if (err.code && String(err.code).startsWith('PGRST')) return false;
  if (msg.includes('column') || msg.includes('relation') || msg.includes('constraint')) return false;
  
  return msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('Network') || msg.includes('network') || msg.includes('timeout') || err.code === '0' || String(err).includes('fetch');
}

export const storage = {

  migrateIds: () => {
    try {
        let integrados = getIntegradosLocal();
        let visits = getVisitsLocal();
        let changed = false;

        // Create a mapping of old loteId to new valid UUIDs
        const loteMap: Record<string, string> = {};

        integrados = integrados.map(i => {
            if (i.id && (i.id.startsWith('i_') || i.id.startsWith('dummy_'))) {
                const newId = generateUUID();
                loteMap[i.id] = newId;
                changed = true;
                return { ...i, id: newId };
            }
            return i;
        });

        const visitMap: Record<string, string> = {};
        visits = visits.map(v => {
            let updated = false;
            let newV = { ...v };
            if (v.id && (v.id.startsWith('v_') || v.id.startsWith('dummy_'))) {
                const newId = generateUUID();
                visitMap[v.id] = newId;
                newV.id = newId;
                updated = true;
                changed = true;
            }
            if (v.integradoId && loteMap[v.integradoId]) {
                newV.integradoId = loteMap[v.integradoId];
                updated = true;
                changed = true;
            } else if (v.integradoId && (v.integradoId.startsWith('i_') || v.integradoId.startsWith('dummy_'))) {
                const newId = generateUUID();
                loteMap[v.integradoId] = newId;
                newV.integradoId = newId;
                updated = true;
                changed = true;
            }

            // Reconcile and sanitize animal counts, recommendations and mortality against backup dataset
            const initMatch = initialVisits.find(iv => 
              iv.date === newV.date && 
              iv.idade === newV.idade && 
              (newV.recomendacao && (iv.recomendacao.substring(0, 15) === newV.recomendacao.substring(0, 15) || newV.recomendacao.includes(iv.colaborador)))
            );
            if (initMatch) {
              if (newV.animaisAlojados !== initMatch.animaisAlojados) {
                newV.animaisAlojados = initMatch.animaisAlojados;
                updated = true;
                changed = true;
              }
              if (newV.animaisMortos !== initMatch.animaisMortos) {
                newV.animaisMortos = initMatch.animaisMortos;
                updated = true;
                changed = true;
              }
              if (newV.mortalidade !== initMatch.mortalidade) {
                newV.mortalidade = initMatch.mortalidade;
                updated = true;
                changed = true;
              }
              if (newV.recomendacao !== initMatch.recomendacao) {
                newV.recomendacao = initMatch.recomendacao;
                updated = true;
                changed = true;
              }
              if (newV.pesoAloj !== initMatch.pesoAloj) {
                newV.pesoAloj = initMatch.pesoAloj;
                updated = true;
                changed = true;
              }
              if (newV.consumoAcumuladoReal !== initMatch.consumoAcumuladoReal) {
                newV.consumoAcumuladoReal = initMatch.consumoAcumuladoReal;
                updated = true;
                changed = true;
              }
            } else if (newV.animaisAlojados && newV.animaisMortos !== undefined && newV.animaisMortos !== null) {
              const expectedPct = Number(((newV.animaisMortos / newV.animaisAlojados) * 100).toFixed(2));
              if (newV.mortalidade !== expectedPct && (newV.mortalidade === newV.animaisMortos || newV.mortalidade === 0 || !newV.mortalidade)) {
                newV.mortalidade = expectedPct;
                updated = true;
                changed = true;
              }
            }

            return updated ? newV : v;
        });

        // Also update pending sync queue
        let queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
        if (queue && queue.length > 0) {
            let queueChanged = false;
            queue = queue.map((v: any) => {
                let newV = { ...v };
                let qUpdated = false;
                if (v.id && visitMap[v.id]) {
                    newV.id = visitMap[v.id];
                    qUpdated = true;
                }
                if (v.integradoId && loteMap[v.integradoId]) {
                    newV.integradoId = loteMap[v.integradoId];
                    qUpdated = true;
                }
                if (qUpdated) queueChanged = true;
                return newV;
            });
            if (queueChanged) {
                safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            }
        }

        if (changed) {
            safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
            safeStorage.setItem(VISITS_KEY, JSON.stringify(visits));
            // Since we modified queue too, we are good.
        }
    } catch (e) {
        console.error("Migration failed", e);
    }
  },

  syncFromSupabase: async () => {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
      if (typeof window !== 'undefined' && safeStorage.getItem('EDITING_LOCK') === 'true') return false;
      
      const cachedSession = getCachedAuthSession();
      if (cachedSession?.user?.id?.includes('offline')) {
          return false; // Skip sync silently for offline sessions
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id === 'offline') {
          if (typeof window !== 'undefined') window.dispatchEvent(new Event('session-expired'));
          throw new Error("Sessão expirada ou inválida. Por favor, faça login novamente.");
      }

      
      let editIntQueue = parseQueueSafe(OFFLINE_EDIT_INTEGRADO_QUEUE);
      if (editIntQueue.length > 0) {
        let remainingQueue = [];
        for (const edit of editIntQueue) {
          try {
            const { error: editErr } = await supabase.from('lotes').update({
              data_alojamento: edit.alojamentoDate,
              status: edit.status === 'Em andamento' ? 'Ativo' : 'Encerrado'
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
      }
const delIntQueue = parseQueueSafe(OFFLINE_DELETE_INTEGRADO_QUEUE);
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
          } catch (delErr: any) {
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
      }

      const delVisitQueue = parseQueueSafe(OFFLINE_DELETE_VISIT_QUEUE);
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
          } catch (delErr: any) {
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
      }

      const queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
      if (queue && queue.length > 0) {
          // Process queue WITHOUT removing it first!
          // We clear it only if it succeeds completely, otherwise we leave it.
          // Actually, saveVisits modifies the queue itself if it encounters errors, but wait, 
          // saveVisits appends to it. If we don't clear it, we might duplicate.
          // Better: clear it, then pass it to saveVisits. If saveVisits throws BEFORE finishing, 
          // we must restore the unprocessed items!
          safeStorage.removeItem(OFFLINE_QUEUE_KEY);
          try {
              await storage.saveVisits(getVisitsLocal(), queue);
          } catch (err) {
              // Restore the original queue, BUT merge with any new items added by the UI during the sync
              
              const currentQueue = parseQueueSafe(OFFLINE_QUEUE_KEY);
              
              // Add back items that were in the queue we tried to process
              for (const v of queue) {
                  if (!currentQueue.find((q: any) => q.id === v.id)) {
                      currentQueue.push(v);
                  }
              }
              safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(currentQueue));
              throw err;
          }
      }
      const { data: integradosDB } = await supabase.from('integrados').select('*').range(0, 9999);
      const { data: lotesDB } = await supabase.from('lotes').select('*').range(0, 9999);
      const { data: empresasDB } = await supabase.from("empresas").select("*").range(0, 9999);
      try {
        const { data: configsDB, error: configError } = await supabase.from("empresa_configuracoes").select("*");
        if (configError) {
           console.warn("Table empresa_configuracoes not available yet", configError.message);
        } else if (configsDB) {
           safeStorage.setItem(CONFIGS_KEY, JSON.stringify(configsDB));
        }
      } catch (e) { console.warn("Table empresa_configuracoes error", e); }

      let visitasDB: any[] = [];
      let cargasDB: any[] = [];
      let tratamentosDB: any[] = [];

      try {
        const { data: vData, error: vErr } = await supabase.from('visitas').select('*, cargas_racao(*), tratamentos(*)').range(0, 9999);
        if (vErr || !vData) {
          const { data: fallbackV } = await supabase.from('visitas').select('*').range(0, 9999);
          visitasDB = fallbackV || [];
          const { data: cData } = await supabase.from('cargas_racao').select('*').range(0, 9999);
          cargasDB = cData || [];
          const { data: tData } = await supabase.from('tratamentos').select('*').range(0, 9999);
          tratamentosDB = tData || [];
        } else {
          visitasDB = vData;
        }
      } catch (err) {
        console.warn('Fallback to separate table queries for visitas:', err);
        const { data: fallbackV } = await supabase.from('visitas').select('*').range(0, 9999);
        visitasDB = fallbackV || [];
        const { data: cData } = await supabase.from('cargas_racao').select('*').range(0, 9999);
        cargasDB = cData || [];
        const { data: tData } = await supabase.from('tratamentos').select('*').range(0, 9999);
        tratamentosDB = tData || [];
      }

      const currentLocalIntegrados = getIntegradosLocal();
      const mappedIntegrados: Integrado[] = (lotesDB || []).map(lote => {
        const integrado = integradosDB?.find(i => i.id === lote.integrado_id);
        const localVersion = currentLocalIntegrados.find(i => i.id === lote.id);
        const empresa = empresasDB?.find(e => e.id === lote.empresa_id);
        return {
          id: lote.id, 
          name: integrado?.nome || (lote as any).nome_produtor || 'Desconhecido',
          alojamentoDate: lote.data_alojamento,
          status: lote.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          fechamentoDate: localVersion?.fechamentoDate || undefined,
          empresaId: lote.empresa_id,
          empresaName: empresa?.nome
        };
      });

      // Ensure any lote_id referenced in visitasDB has a corresponding Integrado item
      visitasDB.forEach(v => {
        if (v.lote_id && !mappedIntegrados.some(i => i.id === v.lote_id)) {
          const matchedIntegrado = integradosDB?.find(i => i.id === v.integrado_id);
          mappedIntegrados.push({
            id: v.lote_id,
            name: matchedIntegrado?.nome || v.tecnico_nome || `Lote ${String(v.lote_id).substring(0, 8)}`,
            alojamentoDate: v.data_visita,
            status: 'Em andamento'
          });
        }
      });

      const mappedVisits: Visit[] = (visitasDB || []).map(v => {
        const lote = lotesDB?.find(l => l.id === v.lote_id);
        const integrado = integradosDB?.find(i => i.id === lote?.integrado_id || i.id === v.integrado_id);
        
        let cargaAloj = 0, cargaCresc1 = 0, cargaCresc2 = 0, cargaCresc3 = 0, cargaTerm1 = 0, cargaTerm2 = 0;
        let volumeTotal = 0;

        const vCargas = (v.cargas_racao && v.cargas_racao.length > 0) 
          ? v.cargas_racao 
          : cargasDB.filter((c: any) => c.visita_id === v.id || c.lote_id === v.lote_id);

        const vTratamentos = (v.tratamentos && v.tratamentos.length > 0)
          ? v.tratamentos
          : tratamentosDB.filter((t: any) => t.visita_id === v.id || t.lote_id === v.lote_id);

        vCargas.forEach((c: any) => {
          volumeTotal += Number(c.quantidade_kg) || 0;
          if (c.tipo_racao === 'Alojamento') cargaAloj += Number(c.quantidade_kg);
          if (c.tipo_racao === 'Crescimento 1') cargaCresc1 += Number(c.quantidade_kg);
          if (c.tipo_racao === 'Crescimento 2') cargaCresc2 += Number(c.quantidade_kg);
          if (c.tipo_racao === 'Crescimento 3') cargaCresc3 += Number(c.quantidade_kg);
          if (c.tipo_racao === 'Terminação 1') cargaTerm1 += Number(c.quantidade_kg);
          if (c.tipo_racao === 'Terminação 2') cargaTerm2 += Number(c.quantidade_kg);
        });

        const dataVisita = new Date(v.data_visita + 'T12:00:00');
        const dataAloj = lote ? new Date(lote.data_alojamento + 'T12:00:00') : dataVisita;
        const diffTime = Math.max(0, dataVisita.getTime() - dataAloj.getTime());
        const idadeDias = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const alojados = Number(lote?.animais_alojados) || 0;
        const mortos = Number(v.mortalidade_periodo) || 0;
        const descartes = Number(v.descartes_periodo) || 0;
        const vivos = alojados - mortos - descartes;

        const activeCurveInfo = getActiveCurve(
          lote?.data_alojamento,
          lote?.status === 'Ativo' ? 'Em andamento' : 'Fechado',
          lote?.tipo_lote as any, lote?.data_abate || null, null, v.curva_consumo_id, v.data_visita
        );
        const metas = activeCurveInfo.metas;

        return {
          id: v.id,
          date: v.data_visita,
          integradoId: v.lote_id,
          idade: idadeDias,
          recomendacao: v.recomendacoes || '',
          avaliacao_tecnica: v.avaliacao_tecnica || null,
          mortalidade: (v.mortalidade_periodo && lote?.animais_alojados) ? Number(((v.mortalidade_periodo / lote.animais_alojados) * 100).toFixed(2)) : undefined,
          animaisMortos: v.mortalidade_periodo || 0,
          animaisAlojados: lote?.animais_alojados,
          pesoAloj: lote?.peso_alojamento_kg || 0,
          tipoLote: lote?.tipo_lote as any,
          colaborador: v.tecnico_nome || '',
          comedouro: integrado?.comedouro_tipo as any || 'Automático',
          pontuacaoSanitaria: Number(v.pontuacao_sanitaria) || undefined,
          volumeTotalCargas: volumeTotal,
          consumoAcumuladoReal: (() => {
             return (vivos > 0 && volumeTotal > 0) ? Number((volumeTotal / vivos).toFixed(2)) : 0;
          })(),
          descartesPeriodo: Number(v.descartes_periodo) || 0,
          curva_consumo_id: v.curva_consumo_id || null,
          pesoAmostradoKg: (() => {
            const vPeso = Number(v.peso_amostrado_kg);
            if (!isNaN(vPeso) && vPeso > 0) return vPeso;
            const tPeso = vTratamentos.find((t: any) => t.peso_estimado_kg != null && Number(t.peso_estimado_kg) > 0)?.peso_estimado_kg;
            if (tPeso != null && Number(tPeso) > 0) return Number(tPeso);
            return undefined;
          })(),
          cargaAlojamento: cargaAloj > 0 ? cargaAloj : undefined,
          consumoAlojamento: (cargaAloj > 0 && vivos > 0) ? Number((cargaAloj / vivos).toFixed(2)) : undefined,
          metaAlojamento: metas.metaAlojamento,
          cargaCrescimento1: cargaCresc1 > 0 ? cargaCresc1 : undefined,
          consumoCrescimento1: (cargaCresc1 > 0 && vivos > 0) ? Number((cargaCresc1 / vivos).toFixed(2)) : undefined,
          metaCrescimento1: metas.metaCrescimento1,
          cargaCrescimento2: cargaCresc2 > 0 ? cargaCresc2 : undefined,
          consumoCrescimento2: (cargaCresc2 > 0 && vivos > 0) ? Number((cargaCresc2 / vivos).toFixed(2)) : undefined,
          metaCrescimento2: metas.metaCrescimento2,
          cargaCrescimento3: cargaCresc3 > 0 ? cargaCresc3 : undefined,
          consumoCrescimento3: (cargaCresc3 > 0 && vivos > 0) ? Number((cargaCresc3 / vivos).toFixed(2)) : undefined,
          metaCrescimento3: metas.metaCrescimento3,
          cargaTerminacao1: cargaTerm1 > 0 ? cargaTerm1 : undefined,
          consumoTerminacao1: (cargaTerm1 > 0 && vivos > 0) ? Number((cargaTerm1 / vivos).toFixed(2)) : undefined,
          metaTerminacao1: metas.metaTerminacao1,
          cargaTerminacao2: cargaTerm2 > 0 ? cargaTerm2 : undefined,
          consumoTerminacao2: (cargaTerm2 > 0 && vivos > 0) ? Number((cargaTerm2 / vivos).toFixed(2)) : undefined,
          metaTerminacao2: metas.metaTerminacao2,
          metaAcumulada: metas.metaAcumulada,
          tratamentos: vTratamentos.map((t: any) => {
            const tPeso = (t.peso_estimado_kg != null && Number(t.peso_estimado_kg) > 0)
              ? Number(t.peso_estimado_kg)
              : (v.peso_amostrado_kg && Number(v.peso_amostrado_kg) > 0 ? Number(v.peso_amostrado_kg) : undefined);
            return {
              id: t.id,
              produto: t.medicamento,
              doseMgKg: t.dosagem_quantidade,
              duracaoDias: t.dias_duracao,
              carenciaDias: t.carencia_dias,
              motivo: t.motivo,
              concentracao: t.concentracao,
              pesoEstimadoKg: tPeso
            };
          })
        };
      });

      // Combine remote results with local storage intelligently
      const currentLocalVisits = getVisitsLocal();
      const visitMap = new Map<string, Visit>();
      mappedVisits.forEach(v => visitMap.set(v.id, v));
      
      // ONLY resurrect local visits if they are actively pending in the offline queue
      const vQueueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      let pendingVIds = new Set<string>();
      if (vQueueStr) {
        try {
          const queue = JSON.parse(vQueueStr);
          queue.forEach((v: any) => pendingVIds.add(v.id));
        } catch (e) {}
      }

      currentLocalVisits.forEach(lv => {
        if (!visitMap.has(lv.id) && pendingVIds.has(lv.id)) {
          visitMap.set(lv.id, lv);
        }
      });
      const finalVisits = Array.from(visitMap.values());

      const integradoMap = new Map<string, Integrado>();
      mappedIntegrados.forEach(i => integradoMap.set(i.id, i));
      
      // ONLY resurrect local integrados if they are pending upload
      // For now, we don't have an explicit 'pending create integrado' queue, but any local
      // integrado that starts with 'local-' or is not in DB can be kept if we assume offline creation.
      // However, to fix ghosting, we should only keep them if they don't look like UUIDs, or if they have visits pending.
      currentLocalIntegrados.forEach(li => {
        if (!integradoMap.has(li.id)) {
          // If it has a local-only format or is referenced by a pending visit, keep it.
          if (li.id.length < 36 || Array.from(pendingVIds).some(vid => {
            const v = currentLocalVisits.find(cv => cv.id === vid);
            return v && v.integradoId === li.id;
          })) {
             integradoMap.set(li.id, li);
          }
        }
      });
      const finalIntegrados = Array.from(integradoMap.values());

      if (finalIntegrados.length > 0) {
        safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(finalIntegrados));
      }
      if (finalVisits.length > 0) {
        safeStorage.setItem(VISITS_KEY, JSON.stringify(finalVisits));
      }
      safeStorage.setItem('LAST_SYNC_TIME', new Date().toISOString());
      
      const remainingQueueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      if (parseQueueSafe(OFFLINE_QUEUE_KEY).length > 0) {
          console.warn("Alguns lançamentos pendentes falharam ao sincronizar. Eles continuarão salvos offline para tentativa futura.");
      }
      
      window.dispatchEvent(new Event('sync-completed'));
      return true;
    } catch (e) {
      console.error("Error syncing:", e); addSyncLog("Error syncing", e);
      throw e;
    }
  },

  getIntegrados: async (): Promise<Integrado[]> => {
    return getIntegradosLocal();
  },

  getPendingSyncIds: (): string[] => {
    try {
        const queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
        return queue.map((v: any) => v.id);
    } catch {
        return [];
    }
  },
  getVisits: async (): Promise<Visit[]> => {
    return getVisitsLocal();
  },

  saveIntegrados: async (integrados: Integrado[]): Promise<Integrado[]> => {
    safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(integrados));
    return integrados;
  },

  saveVisits: async (visits: Visit[], visitsToSyncToSupabase?: Visit[]): Promise<Visit[]> => {
    // ALWAYS save locally first to guarantee offline persistence before any network call
    safeStorage.setItem(VISITS_KEY, JSON.stringify(visits));

    let session = null;
    try {
      const res = await supabase.auth.getSession();
      session = res.data.session;
    } catch (e) {}
    
    const userId = session?.user?.id;
    
    if (userId) {
       // A empresa padrão (Rações Pastre) já é criada no setup do banco.
       // User resolution happens per-visita to ensure robust fallback
    }

    const toProcess = visitsToSyncToSupabase || visits;
    
    for (const v of toProcess) {
      try {
       let loteId = v.integradoId;
       
       // Auto-heal legacy non-UUID lotes (e.g. from i_ Date.now())
       const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
       if (loteId && !isUUID(loteId)) {
           const newLoteId = generateUUID();
           const localIntegrados = getIntegradosLocal();
           const localLoteIndex = localIntegrados.findIndex(i => i.id === loteId);
           if (localLoteIndex !== -1) {
               localIntegrados[localLoteIndex].id = newLoteId;
               safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(localIntegrados));
           }
           const allLocalVisits = getVisitsLocal();
           let visitsChanged = false;
           allLocalVisits.forEach(lv => {
               if (lv.integradoId === loteId) {
                   lv.integradoId = newLoteId;
                   visitsChanged = true;
               }
           });
           if (visitsChanged) {
               safeStorage.setItem(VISITS_KEY, JSON.stringify(allLocalVisits));
           }
           
           const oldLoteId = loteId;
           v.integradoId = newLoteId;
           loteId = newLoteId;
           
           const queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
           if (queueStr) {
               try {
                   const queue = JSON.parse(queueStr);
                   let qChanged = false;
                   queue.forEach((qv: any) => {
                       if (qv.integradoId === oldLoteId) {
                           qv.integradoId = newLoteId;
                           qChanged = true;
                       }
                   });
                   if (qChanged) safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
               } catch (e) {}
           }
       }
       
       // Ensure Integrado and Lote exist in Supabase before upserting Visita
       // (because the old UI allowed creating Integrados offline which just stayed in localStorage)
       const localIntegrados = getIntegradosLocal();
       const localLote = localIntegrados.find(i => i.id === loteId);
        if (localLote) {
           let targetEmpresaId = localLote.empresaId || EMPRESA_ID;

           // We try to upsert the Integrado and Lote to prevent Foreign Key errors
           const { data: existingIntegrados } = await supabase.from('integrados').select('id, empresa_id').eq('nome', localLote.name);
           let dbIntegradoId = existingIntegrados && existingIntegrados.length > 0 ? existingIntegrados[0].id : generateUUID();
           if (existingIntegrados && existingIntegrados.length > 0 && existingIntegrados[0].empresa_id) {
               targetEmpresaId = existingIntegrados[0].empresa_id;
           }
           
           if (!existingIntegrados || existingIntegrados.length === 0) {
               const { error: errInt } = await supabase.from('integrados').upsert({
                   id: dbIntegradoId,
                   empresa_id: targetEmpresaId,
                   nome: localLote.name,
                   ativo: true
               });
               if (errInt) console.error("Error upserting integrado:", errInt);
           }

           const dbLote = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
            let finalAloj = Math.round(v.animaisAlojados || 0);
           if (dbLote.data?.animais_alojados && dbLote.data.animais_alojados > 0) {
               const isVisitaAlojamento = (localLote.alojamentoDate === v.date || v.idade === 0);
               if (!(isVisitaAlojamento && finalAloj > 0 && finalAloj !== 100 && finalAloj !== 500 && finalAloj !== 550)) {
                   finalAloj = dbLote.data.animais_alojados;
               }
            }
            if (finalAloj <= 0) finalAloj = 1;

            const { error: errLote } = await supabase.from('lotes').upsert({
                id: loteId,
                empresa_id: targetEmpresaId,
                integrado_id: dbIntegradoId,
                data_alojamento: localLote.alojamentoDate || v.date,
                animais_alojados: finalAloj,
               peso_alojamento_kg: v.pesoAloj || 0,
               tipo_lote: v.tipoLote || 'Misto',
               status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado'
           });
           if (errLote) console.error("Error upserting lote:", errLote);
       }
       
       let finalUserId = '910e47b0-22c9-497e-9eaa-0816d7fce6d4'; // Fallback admin
       let finalEmpresaId = localLote?.empresaId || EMPRESA_ID;
       
       // Ensure we use the exact same DB empresa ID as the Integrado, just like we did for Lote
       if (localLote) {
           const { data: dbInts } = await supabase.from('integrados').select('empresa_id').eq('nome', localLote.name);
           if (dbInts && dbInts.length > 0 && dbInts[0].empresa_id) {
               finalEmpresaId = dbInts[0].empresa_id;
           }
       }
       
       if (userId) {
           // 1. Try to find user by auth_uid
           let { data: userProfile } = await supabase.from('usuarios').select('id, empresa_id').eq('auth_uid', userId).maybeSingle();
           
           // 2. Try to find user by email
           if (!userProfile && session?.user?.email) {
               const { data: userByEmail } = await supabase.from('usuarios').select('id, empresa_id').eq('email', session.user.email).maybeSingle();
               userProfile = userByEmail;
               
               // Update auth_uid if found by email
               if (userProfile) {
                   await supabase.from('usuarios').update({ auth_uid: userId }).eq('id', userProfile.id);
               }
           }
           
           if (userProfile) {
               finalUserId = userProfile.id;
               // DO NOT OVERWRITE finalEmpresaId with userProfile.empresa_id
               // because finalEmpresaId must match the Lote's empresa_id for the FK!
           } else {
               console.warn("User not found in usuarios table. Falling back to known admin.");
               // Try to insert the user gracefully if missing
               try {
                   const { data: newUser } = await supabase.from('usuarios').insert({
                       auth_uid: userId,
                       email: session?.user?.email || '',
                       nome: session?.user?.email?.split('@')[0] || 'Usuário',
                       papel: 'TECNICO_CLIENTE',
                       empresa_id: EMPRESA_ID,
                       ativo: true
                   }).select('id').single();
                   if (newUser) {
                       finalUserId = newUser.id;
                       // DO NOT overwrite finalEmpresaId
                   }
               } catch(e) {
                   console.error("Fallback insert failed:", e);
               }
           }
       }
       
       const visitaRow = {
          id: v.id,
          empresa_id: finalEmpresaId,
          lote_id: loteId,
          usuario_id: finalUserId,
          data_visita: v.date,
          mortalidade_periodo: Math.round(v.animaisMortos || 0),
          descartes_periodo: Math.round(v.descartesPeriodo || 0),
          pontuacao_sanitaria: v.pontuacaoSanitaria?.toString() || null,
          recomendacoes: v.recomendacao || null,
          avaliacao_tecnica: v.avaliacao_tecnica || null,
          tecnico_nome: v.colaborador || null,
          curva_consumo_id: v.curva_consumo_id || null,
          peso_amostrado_kg: v.pesoAmostradoKg || null
       };

       const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          console.error("Erro upsert visita:", errVisita); addSyncLog("Erro upsert visita: " + v.id, errVisita);
          addVisitsToOfflineQueue([v]);
          continue;
       }

       // Also update the Lote since VisitForm can change lote-level fields
       const dbLote2 = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
       
       let finalAloj2 = Math.round(v.animaisAlojados || 0);
       
       if (dbLote2.data?.animais_alojados && dbLote2.data.animais_alojados > 0) {
           const isVisitaAlojamento2 = (localLote?.alojamentoDate === v.date || v.idade === 0);
           if (!(isVisitaAlojamento2 && finalAloj2 > 0 && finalAloj2 !== 100 && finalAloj2 !== 500 && finalAloj2 !== 550)) {
               finalAloj2 = dbLote2.data.animais_alojados;
           }
       }

       if (finalAloj2 <= 0) finalAloj2 = 1;
       const { error: errLote } = await supabase.from('lotes').update({
         animais_alojados: finalAloj2,
         peso_alojamento_kg: v.pesoAloj || 0,
         tipo_lote: v.tipoLote || 'Misto'
       }).eq('id', loteId);
       if (errLote) {
           console.error("Erro update lote:", errLote); addSyncLog("Erro update lote from visita: " + loteId, errLote);
           addVisitsToOfflineQueue([v]);
           continue;
       }

       await supabase.from('cargas_racao').delete().eq('visita_id', v.id);
       
       let cargas = [
         { tipo: 'Alojamento', val: v.cargaAlojamento },
         { tipo: 'Crescimento 1', val: v.cargaCrescimento1 },
         { tipo: 'Crescimento 2', val: v.cargaCrescimento2 },
         { tipo: 'Crescimento 3', val: v.cargaCrescimento3 },
         { tipo: 'Terminação 1', val: v.cargaTerminacao1 },
         { tipo: 'Terminação 2', val: v.cargaTerminacao2 }
       ].filter(c => c.val && c.val > 0);

       if (cargas.length === 0 && v.volumeTotalCargas && v.volumeTotalCargas > 0) {
         cargas = [{ tipo: 'Total', val: v.volumeTotalCargas }];
       }

       if (cargas.length > 0) {
         const cargasToInsert = cargas.map(c => ({
            id: generateUUID(),
            empresa_id: finalEmpresaId,
            visita_id: v.id,
            lote_id: loteId,
            tipo_racao: c.tipo,
            quantidade_kg: c.val
         }));
         const { error: errCargas } = await supabase.from('cargas_racao').insert(cargasToInsert);
         if (errCargas) {
             console.error("Erro insert cargas:", errCargas); addSyncLog("Erro insert cargas para visita: " + v.id, errCargas);
             addVisitsToOfflineQueue([v]);
             continue;
         }
       }

       await supabase.from('tratamentos').delete().eq('visita_id', v.id);
       
       if (v.tratamentos && v.tratamentos.length > 0) {
         const tratamentosToInsert = v.tratamentos.map(t => ({
            id: (t.id && t.id.length === 36 && t.id.includes("-")) ? t.id : generateUUID(),
            empresa_id: finalEmpresaId,
            visita_id: v.id,
            lote_id: loteId,
            medicamento: t.produto,
            via_administracao: 'Água',
            dosagem_quantidade: t.doseMgKg || 0,
            unidade_medida: 'kg',
            dias_duracao: t.duracaoDias || 0,
            carencia_dias: t.carenciaDias || null,
            motivo: t.motivo || null,
            concentracao: t.concentracao || null,
            peso_estimado_kg: (t.pesoEstimadoKg && Number(t.pesoEstimadoKg) > 0)
              ? Number(t.pesoEstimadoKg)
              : (v.pesoAmostradoKg && Number(v.pesoAmostradoKg) > 0)
                ? Number(v.pesoAmostradoKg)
                : null
         }));
         const { error: errTratamentos } = await supabase.from('tratamentos').insert(tratamentosToInsert);
         if (errTratamentos) {
             console.error("Erro insert tratamentos:", errTratamentos); addSyncLog("Erro insert tratamentos para visita: " + v.id, errTratamentos);
             addVisitsToOfflineQueue([v]);
             continue;
         }
       }
      } catch (loopErr) {
         console.error("Exception processing visit in saveVisits:", loopErr); addSyncLog("Exception processing visit: " + v.id, loopErr);
         addVisitsToOfflineQueue([v]);
      }
    }
    return visits;
  },

  deleteIntegrado: async (id: string): Promise<boolean> => {
    // 1. Immediately update Local Storage to prevent resurrection on refresh or offline
    const currentIntegrados = getIntegradosLocal();
    const updatedIntegrados = currentIntegrados.filter(i => i.id !== id);
    safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(updatedIntegrados));

    const currentVisits = getVisitsLocal();
    const updatedVisits = currentVisits.filter(v => v.integradoId !== id);
    safeStorage.setItem(VISITS_KEY, JSON.stringify(updatedVisits));

    // Also clean any pending items from the offline queue
    const queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
    if (queue && queue.length > 0) {
      const filteredQueue = queue.filter((v: any) => v.integradoId !== id);
      safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
    }

    // 2. Cascade delete on Supabase
    try {
      // Find all visits for this lote
      const { data: vList, error: errVList } = await supabase
        .from('visitas')
        .select('id')
        .eq('lote_id', id);

      if (errVList && isNetworkError(errVList)) {
        const queue = parseQueueSafe(OFFLINE_DELETE_INTEGRADO_QUEUE);
        if (!queue.includes(id)) queue.push(id);
        safeStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(queue));
        return true;
      }

      if (vList && vList.length > 0) {
        const vIds = vList.map(v => v.id);
        // Delete child relations first (foreign key integrity)
        await supabase.from('cargas_racao').delete().in('visita_id', vIds);
        await supabase.from('tratamentos').delete().in('visita_id', vIds);
        await supabase.from('visitas').delete().eq('lote_id', id);
      }

      // Also delete any orphan cargas_racao or tratamentos linked directly by lote_id
      await supabase.from('cargas_racao').delete().eq('lote_id', id);
      await supabase.from('tratamentos').delete().eq('lote_id', id);

      // Finally delete the lote itself
      const { error } = await supabase.from('lotes').delete().eq('id', id);
      if (error) {
        if (isNetworkError(error)) {
          const queue = parseQueueSafe(OFFLINE_DELETE_INTEGRADO_QUEUE);
          if (!queue.includes(id)) queue.push(id);
          safeStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(queue));
        } else {
          console.error('Erro ao excluir lote no Supabase:', error);
        }
      }
      return true;
    } catch (e) {
      if (isNetworkError(e)) {
        const queue = parseQueueSafe(OFFLINE_DELETE_INTEGRADO_QUEUE);
        if (!queue.includes(id)) queue.push(id);
        safeStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(queue));
      }
      return true;
    }
  },

  deleteVisit: async (id: string): Promise<boolean> => {
    // 1. Immediately update Local Storage
    const currentVisits = getVisitsLocal();
    const updatedVisits = currentVisits.filter(v => v.id !== id);
    safeStorage.setItem(VISITS_KEY, JSON.stringify(updatedVisits));

    const queue = parseQueueSafe(OFFLINE_QUEUE_KEY);
    if (queue && queue.length > 0) {
      const filteredQueue = queue.filter((v: any) => v.id !== id);
      safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
    }

    // 2. Cascade delete on Supabase
    try {
      await supabase.from('cargas_racao').delete().eq('visita_id', id);
      await supabase.from('tratamentos').delete().eq('visita_id', id);
      const { error } = await supabase.from('visitas').delete().eq('id', id);
      if (error) {
        if (isNetworkError(error)) {
          const queue = parseQueueSafe(OFFLINE_DELETE_VISIT_QUEUE);
          if (!queue.includes(id)) queue.push(id);
          safeStorage.setItem(OFFLINE_DELETE_VISIT_QUEUE, JSON.stringify(queue));
        } else {
          console.error('Erro ao excluir visita no Supabase:', error);
        }
      }
      return true;
    } catch (e) {
      if (isNetworkError(e)) {
        const queue = parseQueueSafe(OFFLINE_DELETE_VISIT_QUEUE);
        if (!queue.includes(id)) queue.push(id);
        safeStorage.setItem(OFFLINE_DELETE_VISIT_QUEUE, JSON.stringify(queue));
      }
      return true;
    }
  },

  clearAll: async () => {
    safeStorage.removeItem(INTEGRADOS_KEY);
    safeStorage.removeItem(VISITS_KEY);
    safeStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  verifyDataConsistency: () => {}
};
