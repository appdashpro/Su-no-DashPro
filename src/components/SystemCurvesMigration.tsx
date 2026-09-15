import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { growthCurvesMisto } from '../data';

export const SystemCurvesMigration = () => {
  useEffect(() => {
    const run = async () => {
      console.log('Running SystemCurvesMigration...');
      const { data: empresas } = await supabase.from('empresas').select('*');
      
      if (!empresas || empresas.length === 0) return;
      
      for (const empresa of empresas) {
        const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', empresa.id).single();
        
        let currentCurvas = [];
        if (config && config.curva_desempenho && Array.isArray(config.curva_desempenho)) {
          currentCurvas = config.curva_desempenho;
        }

        let updated = false;

        // 1. Remove curves that do not belong to this company (if they were accidentally saved)
        // AND remove legacy 'v1'/'v2' from everyone
        const sysVersions = growthCurvesMisto.map(c => c.version);
        const filteredCurvas = currentCurvas.filter(c => {
           // Remove old generic ones entirely from all companies to force a clean slate
           if (c.id === 'v1' || c.id === 'v2' || c.id === 'copagri_2026' || c.id === 'pastre_v1' || c.id === 'pastre_v2') {
               updated = true;
               return false;
           }

           // if it's not a system curve, keep it
           if (!sysVersions.includes(c.id)) return true;
           
           const v = c.id.toLowerCase();
           const empName = empresa.nome.toLowerCase();
           
           // Extract the core company name from the version (e.g. 'pastre' from 'pastre_v1')
           const vCore = v.split('_')[0]; 

           const matchesCompany = empName.includes(vCore);
           
           if (matchesCompany) {
               return true; // Keep it
           }
           
           // It's a system curve that DOES NOT belong here
           updated = true;
           return false; // Remove it
        });
        
        currentCurvas = filteredCurvas;

        // 2. Add curves that DO belong here but are missing
        growthCurvesMisto.forEach(sysCurve => {
           const v = sysCurve.version.toLowerCase();
           const empName = empresa.nome.toLowerCase();
           const vCore = v.split('_')[0]; // handles 'pastre_v1' -> 'pastre', 'copagri' -> 'copagri'
           
           const matchesCompany = empName.includes(vCore);
           
           if (matchesCompany) {
              const existingIndex = currentCurvas.findIndex(c => c.id === sysCurve.version);
              if (existingIndex === -1) {
                 // Format a nice name
                 let displayName = `Curva ${vCore.toUpperCase()}`;
                 if (v.includes('_v1')) displayName += ' V1';
                 if (v.includes('_v2')) displayName += ' V2';
                 
                 let tipoLote = 'Misto';
                 if (v.includes('_macho')) tipoLote = 'Macho';
                 if (v.includes('_femea')) tipoLote = 'Fêmea';

                 currentCurvas.push({
                    id: sysCurve.version,
                    nome: displayName,
                    dataVigencia: sysCurve.effectiveDate || '2026-01-01',
                    tipoLote: tipoLote,
                    curve: sysCurve.curve,
                    metas: sysCurve.metas,
                    programa_alimentar: sysCurve.programa_alimentar
                 });
                 updated = true;
              } else {
                 // Force update the data for existing system curves
                 currentCurvas[existingIndex].curve = sysCurve.curve;
                 currentCurvas[existingIndex].metas = sysCurve.metas;
                 if (sysCurve.programa_alimentar) {
                    currentCurvas[existingIndex].programa_alimentar = sysCurve.programa_alimentar;
                 }
                 updated = true;
              }
           }
        });

        if (updated) {
          if (config) {
            await supabase.from('empresa_configuracoes').update({
              curva_desempenho: currentCurvas
            }).eq('empresa_id', empresa.id);
          } else {
            await supabase.from('empresa_configuracoes').insert({
              empresa_id: empresa.id,
              tipo_calculo_curva: 'DIA_UM',
              curva_desempenho: currentCurvas
            });
          }
          console.log(`Cleaned up and migrated curves for ${empresa.nome}`);
        }
      }
    };
    run();
  }, []);
  
  return null;
};
