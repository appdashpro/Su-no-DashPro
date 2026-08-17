import { safeStorage } from "./safeStorage";
import { Integrado, Visit, Tratamento } from '../types';
import { supabase } from './supabase';
import { getActiveCurve, initialIntegrados, initialVisits } from '../data';

const INTEGRADOS_KEY = 'suino_dashpro_integrados';
const VISITS_KEY = 'suino_dashpro_visits';
export const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';
export const OFFLINE_DELETE_VISIT_QUEUE = 'suino_dashpro_offline_delete_visit';
export const OFFLINE_DELETE_INTEGRADO_QUEUE = 'suino_dashpro_offline_delete_integrado';
export const OFFLINE_EDIT_INTEGRADO_QUEUE = 'suino_dashpro_offline_edit_integrado';
const EMPRESA_ID = '00000000-0000-0000-0000-000000000001';

const getIntegradosLocal = (): Integrado[] => {
  try {
    const data = safeStorage.getItem(INTEGRADOS_KEY);
    const parsed = data ? JSON.parse(data) : []; 
    return (Array.isArray(parsed) && parsed.length > 0) ? parsed : initialIntegrados;
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
    const queue = JSON.parse(safeStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
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
                const newId = crypto.randomUUID();
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
                const newId = crypto.randomUUID();
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
                const newId = crypto.randomUUID();
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
        let queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
        if (queueStr) {
            let queue = JSON.parse(queueStr);
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
      if (typeof localStorage !== 'undefined' && safeStorage.getItem('EDITING_LOCK') === 'true') return false;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id === 'offline') return false;

      
      let editIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_EDIT_INTEGRADO_QUEUE) || '[]');
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
const delIntQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
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
      }

      const delVisitQueue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
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
      }

      const queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueStr) {
        const queue = JSON.parse(queueStr);
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
              // Restore the entire original queue if it failed completely to avoid losing unprocessed items
              // (The items already processed might be added again, but upserts handle duplicates fine)
              safeStorage.setItem(OFFLINE_QUEUE_KEY, queueStr);
              throw err;
          }
          
          const newQueueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
          if (!newQueueStr || JSON.parse(newQueueStr).length === 0) {
             window.dispatchEvent(new Event('sync-completed'));
             return true;
          }
        }
      }

      const { data: integradosDB, error: e1 } = await supabase.from('integrados').select('*');
      if (e1) throw e1;
      const { data: lotesDB, error: e2 } = await supabase.from('lotes').select('*');
      if (e2) throw e2;
      const { data: visitasDB, error: e3 } = await supabase.from('visitas').select('*, cargas_racao(*), tratamentos(*)');
      if (e3) throw e3;

      const currentLocalIntegrados = getIntegradosLocal();
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
      });

      const mappedVisits: Visit[] = (visitasDB || []).map(v => {
        const lote = lotesDB?.find(l => l.id === v.lote_id);
        const integrado = integradosDB?.find(i => i.id === lote?.integrado_id);
        
        let cargaAloj = 0, cargaCresc1 = 0, cargaCresc2 = 0, cargaCresc3 = 0, cargaTerm1 = 0, cargaTerm2 = 0;
        let volumeTotal = 0;
        v.cargas_racao?.forEach((c: any) => {
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
          lote?.tipo_lote as any
        );
        const metas = activeCurveInfo.metas;

        return {
          id: v.id,
          date: v.data_visita,
          integradoId: v.lote_id,
          idade: idadeDias,
          recomendacao: v.recomendacoes || '',
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
             const kgConsumidos = volumeTotal - (Number(v.sobra_silo_kg) || 0);
             return (vivos > 0 && kgConsumidos > 0) ? Number((kgConsumidos / vivos).toFixed(2)) : 0;
          })(),
          sobraSiloKg: Number(v.sobra_silo_kg) || 0,
          descartesPeriodo: Number(v.descartes_periodo) || 0,
          pesoAmostradoKg: Number(v.peso_amostrado_kg) || 0,
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
          tratamentos: v.tratamentos?.map((t: any) => ({
             id: t.id,
             produto: t.medicamento,
             doseMgKg: t.dosagem_quantidade,
             duracaoDias: t.dias_duracao,
             carenciaDias: t.carencia_dias,
             motivo: t.motivo,
             concentracao: t.concentracao
          }))
        };
      });

      safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(mappedIntegrados));
      safeStorage.setItem(VISITS_KEY, JSON.stringify(mappedVisits));
      safeStorage.setItem('lastSync', new Date().toISOString());
      
      window.dispatchEvent(new Event('sync-completed'));
      return true;
    } catch (e) {
      console.error('Error syncing:', e);
      throw e;
    }
  },

  getIntegrados: async (): Promise<Integrado[]> => {
    return getIntegradosLocal();
  },

  getPendingSyncIds: (): string[] => {
    try {
        const queue = JSON.parse(safeStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
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
       // Upsert user to avoid FK constraint violation
       try {
           await supabase.from('usuarios').upsert({
               id: userId,
               auth_uid: userId,
               empresa_id: EMPRESA_ID,
               nome: session?.user?.email?.split('@')[0] || 'Usuário',
               email: session?.user?.email || '',
               ativo: true
           });
       } catch (err) {} // ignore errors, let it fail at visita insert if it didn't work
    }

    const toProcess = visitsToSyncToSupabase || visits;
    
    for (const v of toProcess) {
       const loteId = v.integradoId;
       
       // Ensure Integrado and Lote exist in Supabase before upserting Visita
       // (because the old UI allowed creating Integrados offline which just stayed in localStorage)
       const localIntegrados = getIntegradosLocal();
       const localLote = localIntegrados.find(i => i.id === loteId);
       
       if (localLote) {
           // We try to upsert the Integrado and Lote to prevent Foreign Key errors
           const { data: existingIntegrados } = await supabase.from('integrados').select('id').eq('nome', localLote.name);
           let dbIntegradoId = existingIntegrados && existingIntegrados.length > 0 ? existingIntegrados[0].id : crypto.randomUUID();
           
           if (!existingIntegrados || existingIntegrados.length === 0) {
               await supabase.from('integrados').upsert({
                   id: dbIntegradoId,
                   empresa_id: EMPRESA_ID,
                   nome: localLote.name,
                   ativo: true
               });
           }

           const dbLote = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
            let finalAloj = Math.round(v.animaisAlojados || 0);
            if ((finalAloj === 100 || finalAloj === 500 || finalAloj === 550 || finalAloj === 0) && dbLote.data?.animais_alojados) {
               finalAloj = dbLote.data.animais_alojados;
            }

            await supabase.from('lotes').upsert({
                id: loteId,
                empresa_id: EMPRESA_ID,
                integrado_id: dbIntegradoId,
                data_alojamento: localLote.alojamentoDate || v.date,
                animais_alojados: finalAloj,
               peso_alojamento_kg: v.pesoAloj || 0,
               tipo_lote: v.tipoLote || 'Misto',
               status: localLote.status === 'Em andamento' ? 'Ativo' : 'Encerrado'
           });
       }
       
       const visitaRow = {
          id: v.id,
          empresa_id: EMPRESA_ID,
          lote_id: loteId,
          usuario_id: userId,
          data_visita: v.date,
          mortalidade_periodo: Math.round(v.animaisMortos || 0),
          descartes_periodo: Math.round(v.descartesPeriodo || 0),
          sobra_silo_kg: v.sobraSiloKg || 0,
          pontuacao_sanitaria: v.pontuacaoSanitaria?.toString() || null,
          recomendacoes: v.recomendacao || null,
          tecnico_nome: v.colaborador || null,
          peso_amostrado_kg: v.pesoAmostradoKg || null
       };

       const { error: errVisita } = await supabase.from('visitas').upsert(visitaRow);
       if (errVisita) {
          if (isNetworkError(errVisita)) {
             addVisitsToOfflineQueue([v]);
             continue;
          } else {
             // Save to queue anyway so it's not lost on reload during schema mismatch
             addVisitsToOfflineQueue([v]);
             throw errVisita;
          }
       }

       // Also update the Lote since VisitForm can change lote-level fields
       const dbLote2 = await supabase.from('lotes').select('animais_alojados').eq('id', loteId).maybeSingle();
       let finalAloj2 = Math.round(v.animaisAlojados || 0);
       if ((finalAloj2 === 100 || finalAloj2 === 500 || finalAloj2 === 550 || finalAloj2 === 0) && dbLote2.data?.animais_alojados) {
          finalAloj2 = dbLote2.data.animais_alojados;
       }

       const { error: errLote } = await supabase.from('lotes').update({
         animais_alojados: finalAloj2,
         peso_alojamento_kg: v.pesoAloj || 0,
         tipo_lote: v.tipoLote || 'Misto'
       }).eq('id', loteId);
       if (errLote && !isNetworkError(errLote)) throw errLote;

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
            id: crypto.randomUUID(),
            empresa_id: EMPRESA_ID,
            visita_id: v.id,
            lote_id: loteId,
            tipo_racao: c.tipo,
            quantidade_kg: c.val
         }));
         const { error: errCargas } = await supabase.from('cargas_racao').insert(cargasToInsert);
         if (errCargas) {
             addVisitsToOfflineQueue([v]);
             if (!isNetworkError(errCargas)) throw errCargas;
         }
       }

       await supabase.from('tratamentos').delete().eq('visita_id', v.id);
       
       if (v.tratamentos && v.tratamentos.length > 0) {
         const tratamentosToInsert = v.tratamentos.map(t => ({
            id: (t.id && t.id.length === 36 && t.id.includes("-")) ? t.id : crypto.randomUUID(),
            empresa_id: EMPRESA_ID,
            visita_id: v.id,
            lote_id: loteId,
            medicamento: t.produto,
            via_administracao: 'Água',
            dosagem_quantidade: t.doseMgKg || 0,
            unidade_medida: 'kg',
            dias_duracao: t.duracaoDias || 0,
            carencia_dias: t.carenciaDias || null,
            motivo: t.motivo || null,
            concentracao: t.concentracao || null
         }));
         const { error: errTratamentos } = await supabase.from('tratamentos').insert(tratamentosToInsert);
         if (errTratamentos) {
             addVisitsToOfflineQueue([v]);
             if (!isNetworkError(errTratamentos)) throw errTratamentos;
         }
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
    const queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
    if (queueStr) {
      try {
        const queue: Visit[] = JSON.parse(queueStr);
        const filteredQueue = queue.filter(v => v.integradoId !== id);
        safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
      } catch (e) {
        console.error('Error cleaning offline queue for deleted lote', e);
      }
    }

    // 2. Cascade delete on Supabase
    try {
      // Find all visits for this lote
      const { data: vList, error: errVList } = await supabase
        .from('visitas')
        .select('id')
        .eq('lote_id', id);

      if (errVList && isNetworkError(errVList)) {
        const queue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
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
          const queue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
          if (!queue.includes(id)) queue.push(id);
          safeStorage.setItem(OFFLINE_DELETE_INTEGRADO_QUEUE, JSON.stringify(queue));
        } else {
          console.error('Erro ao excluir lote no Supabase:', error);
        }
      }
      return true;
    } catch (e) {
      if (isNetworkError(e)) {
        const queue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_INTEGRADO_QUEUE) || '[]');
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

    const queueStr = safeStorage.getItem(OFFLINE_QUEUE_KEY);
    if (queueStr) {
      try {
        const queue: Visit[] = JSON.parse(queueStr);
        const filteredQueue = queue.filter(v => v.id !== id);
        safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQueue));
      } catch (e) {
        console.error('Error cleaning offline queue for deleted visit', e);
      }
    }

    // 2. Cascade delete on Supabase
    try {
      await supabase.from('cargas_racao').delete().eq('visita_id', id);
      await supabase.from('tratamentos').delete().eq('visita_id', id);
      const { error } = await supabase.from('visitas').delete().eq('id', id);
      if (error) {
        if (isNetworkError(error)) {
          const queue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
          if (!queue.includes(id)) queue.push(id);
          safeStorage.setItem(OFFLINE_DELETE_VISIT_QUEUE, JSON.stringify(queue));
        } else {
          console.error('Erro ao excluir visita no Supabase:', error);
        }
      }
      return true;
    } catch (e) {
      if (isNetworkError(e)) {
        const queue = JSON.parse(safeStorage.getItem(OFFLINE_DELETE_VISIT_QUEUE) || '[]');
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
