import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { growthCurvesMisto } from '../data';

export const CopagriMigration = () => {
  useEffect(() => {
    const run = async () => {
      console.log('Running CopagriMigration...');
      const { data: empresas } = await supabase.from('empresas').select('*').ilike('nome', '%Copagri%');
      
      if (!empresas || empresas.length === 0) {
        console.log('Copagri not found in DB');
        return;
      }
      
      const empresa = empresas[0];
      
      const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', empresa.id).single();
      
      const copagriCurve = growthCurvesMisto.find(c => c.version === 'copagri');
      if (!copagriCurve) return;

      const copagriCurveObject = {
         id: 'copagri_2026',
         nome: 'Curva Copagri Atualizada',
         dataVigencia: '2026-04-01',
         tipoLote: 'Misto',
         curve: copagriCurve.curve,
         metas: copagriCurve.metas
      };

      let currentCurvas = [];
      if (config && config.curva_desempenho && Array.isArray(config.curva_desempenho)) {
        currentCurvas = config.curva_desempenho.filter(c => c.id !== 'copagri_2026');
      }
      currentCurvas.push(copagriCurveObject);

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
      console.log('Copagri migrated successfully');
    };
    run();
  }, []);
  
  return null;
};
