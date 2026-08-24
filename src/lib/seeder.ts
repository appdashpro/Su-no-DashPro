import { Integrado, Visit, Tratamento } from '../types';
import { safeStorage } from './safeStorage';

const INTEGRADOS_KEY = 'suino_dashpro_integrados';
const VISITS_KEY = 'suino_dashpro_visits';
const OFFLINE_QUEUE_KEY = 'suino_dashpro_offline_queue';

export const seedTestLots = () => {
    try {
        let existingIntegrados: Integrado[] = JSON.parse(safeStorage.getItem(INTEGRADOS_KEY) || '[]');
        let existingVisits: Visit[] = JSON.parse(safeStorage.getItem(VISITS_KEY) || '[]');
        
        // CLEANUP: Remove any previously seeded data that had invalid UUIDs or Empresa IDs
        const hasBadData = existingIntegrados.some(i => i.id.includes('nutron-teste'));
        if (hasBadData) {
            existingIntegrados = existingIntegrados.filter(i => !i.id.includes('nutron-teste'));
            existingVisits = existingVisits.filter(v => !v.id.includes('nutron-teste') && !v.integradoId.includes('nutron-teste'));
            safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(existingIntegrados));
            safeStorage.setItem(VISITS_KEY, JSON.stringify(existingVisits));
            
            let queue: any[] = JSON.parse(safeStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
            if (queue.some((v: any) => v.id?.includes('nutron-teste') || v.integradoId?.includes('nutron-teste'))) {
                queue = queue.filter((v: any) => !v.id?.includes('nutron-teste') && !v.integradoId?.includes('nutron-teste'));
                safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            }
        }

        // CLEANUP 2: Remove old test lots that don't have a valid empresaId or have bad mortality
        const hasMissingEmpresaId = existingIntegrados.some(i => i.name.includes('Nutron - Lote Teste'));
        if (hasMissingEmpresaId) {
            const badIds = existingIntegrados.filter(i => i.name.includes('Nutron - Lote Teste')).map(i => i.id);
            existingIntegrados = existingIntegrados.filter(i => !badIds.includes(i.id));
            existingVisits = existingVisits.filter(v => !badIds.includes(v.integradoId));
            
            safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(existingIntegrados));
            safeStorage.setItem(VISITS_KEY, JSON.stringify(existingVisits));
            
            let queue: any[] = JSON.parse(safeStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
            if (queue.some((v: any) => badIds.includes(v.id) || badIds.includes(v.integradoId))) {
                queue = queue.filter((v: any) => !badIds.includes(v.id) && !badIds.includes(v.integradoId));
                safeStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            }
        }

        // Check if we already have a valid seeded lot with empresaId
        if (existingIntegrados.some(i => i.name.includes("Nutron - Lote Demo") && i.empresaId)) {
            return true;
        }

        const cachedEmpresas = JSON.parse(safeStorage.getItem('CACHED_EMPRESAS') || '[]');
        let targetEmpresaId = undefined;
        let targetEmpresaName = 'Nutron';
        
        const nutronEmp = cachedEmpresas.find((e: any) => e.nome.toLowerCase().includes('nutron'));
        if (nutronEmp) {
            targetEmpresaId = nutronEmp.id;
            targetEmpresaName = nutronEmp.nome;
        } else if (cachedEmpresas.length > 0) {
            targetEmpresaId = cachedEmpresas[0].id;
            targetEmpresaName = cachedEmpresas[0].nome;
        }

        const now = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        // Lot 1: 30 days old
        const date1 = new Date(now);
        date1.setDate(date1.getDate() - 30);
        
        // Lot 2: 60 days old
        const date2 = new Date(now);
        date2.setDate(date2.getDate() - 60);

        // Lot 3: 90 days old (Almost closed)
        const date3 = new Date(now);
        date3.setDate(date3.getDate() - 90);

        const lote1Id = crypto.randomUUID();
        const lote2Id = crypto.randomUUID();
        const lote3Id = crypto.randomUUID();

        const newIntegrados: Integrado[] = [
            {
                id: lote1Id,
                name: 'Nutron - Lote Demo 01',
                alojamentoDate: formatDate(date1),
                status: 'Em andamento',
                empresaName: targetEmpresaName,
                empresaId: targetEmpresaId
            },
            {
                id: lote2Id,
                name: 'Nutron - Lote Demo 02',
                alojamentoDate: formatDate(date2),
                status: 'Em andamento',
                empresaName: targetEmpresaName,
                empresaId: targetEmpresaId
            },
            {
                id: lote3Id,
                name: 'Nutron - Lote Demo 03',
                alojamentoDate: formatDate(date3),
                status: 'Em andamento',
                empresaName: targetEmpresaName,
                empresaId: targetEmpresaId
            }
        ];

        const newVisits: Visit[] = [];
        
        // Helper to generate visits
        const generateVisits = (integradoId: string, alojDateStr: string, currentAge: number) => {
            const alojDate = new Date(alojDateStr);
            const alojados = 1000;
            let currentWeight = 1.0;
            let cumulativeFeed = 0.5;
            
            let cumulativeMortos = 2;
            let cumulativeDescartes = 1;

            // Day 1 visit
            newVisits.push({
                id: crypto.randomUUID(),
                integradoId,
                date: alojDateStr,
                idade: 1,
                recomendacao: 'Alojamento realizado com sucesso.',
                colaborador: 'Técnico Nutron',
                comedouro: 'Automático',
                tipoLote: 'Misto',
                pesoAloj: 1.0,
                animaisAlojados: alojados,
                animaisMortos: cumulativeMortos,
                descartesPeriodo: cumulativeDescartes,
                consumoAcumuladoReal: 0.5,
                volumeTotalCargas: 2000,
                pontuacaoSanitaria: 5,
                mortalidade: Number(((cumulativeMortos + cumulativeDescartes) / alojados * 100).toFixed(2))
            });

            // Every 15 days
            for (let i = 15; i <= currentAge; i += 15) {
                const visitDate = new Date(alojDate);
                visitDate.setDate(visitDate.getDate() + i);
                
                // Realistic curve approximation
                cumulativeFeed += (i * 0.2); 
                currentWeight += (i * 0.05);

                const tratamentos: Tratamento[] | undefined = (i === 30) ? [
                    { id: crypto.randomUUID(), produto: 'Amoxicilina', doseMgKg: 20, duracaoDias: 5, motivo: 'Prevenção' }
                ] : undefined;

                cumulativeMortos += Math.floor(Math.random() * 5) + 1;
                cumulativeDescartes += Math.floor(Math.random() * 3);
                
                newVisits.push({
                    id: crypto.randomUUID(),
                    integradoId,
                    date: formatDate(visitDate),
                    idade: i,
                    recomendacao: 'Visita de rotina, lote apresentando bom desenvolvimento.',
                    colaborador: 'Técnico Nutron',
                    comedouro: 'Automático',
                    tipoLote: 'Misto',
                    animaisAlojados: alojados,
                    animaisMortos: cumulativeMortos,
                    descartesPeriodo: cumulativeDescartes,
                    mortalidade: Number(((cumulativeMortos + cumulativeDescartes) / alojados * 100).toFixed(2)),
                    consumoAcumuladoReal: Number(cumulativeFeed.toFixed(2)),
                    volumeTotalCargas: cumulativeFeed * alojados * 1.2,
                    pontuacaoSanitaria: Math.floor(Math.random() * 3) + 3,
                    tratamentos,
                    avaliacao_tecnica: {
                        granja: {
                            limpeza_baias: 5,
                            desperdicio_racao: 5,
                            ventilacao_cortinas: 5,
                            ficha_lote: 5
                        },
                        suinos: {
                            tosse: 5,
                            diarreia: 5,
                            uniformidade: 5,
                            canibalismo: 5,
                            prolapso: 5,
                            parecer_medicacao: 5
                        }
                    }
                });
            }
        };

        generateVisits(lote1Id, formatDate(date1), 30);
        generateVisits(lote2Id, formatDate(date2), 60);
        generateVisits(lote3Id, formatDate(date3), 90);

        const finalIntegrados = [...existingIntegrados, ...newIntegrados];
        const finalVisits = [...existingVisits, ...newVisits];

        safeStorage.setItem(INTEGRADOS_KEY, JSON.stringify(finalIntegrados));
        safeStorage.setItem(VISITS_KEY, JSON.stringify(finalVisits));

        console.log("TEST LOTS SEEDED SUCCESSFULLY (WITH UUIDS)");
        return true;
    } catch (e) {
        console.error("Error seeding test lots:", e);
        return false;
    }
};
