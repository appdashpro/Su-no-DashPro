import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { growthCurvesMisto } from '../data';

export const CopagriUpdate = () => {
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    const run = async () => {
      setStatus('Fetching Copagri...');
      const { data: empresa } = await supabase.from('empresas').select('*').ilike('nome', '%Copagri%').single();
      if (!empresa) {
        setStatus('Copagri not found');
        return;
      }
      setStatus('Found Copagri: ' + empresa.id);

      const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', empresa.id).single();
      
      const copagriCurve = growthCurvesMisto.find(c => c.version === 'copagri');
      if (!copagriCurve) {
        setStatus('Copagri curve data not found in data.ts');
        return;
      }

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

      // Make sure we also have PROGRAMA_ALIMENTAR or GOMPERTZ if they were there, wait, those have _type.
      // Filtering out any copagri_2026 is enough.

      if (config) {
        const { error } = await supabase.from('empresa_configuracoes').update({
          curva_desempenho: currentCurvas
        }).eq('empresa_id', empresa.id);
        
        if (error) setStatus('Error updating: ' + error.message);
        else setStatus('Successfully updated Copagri curve!');
      } else {
        const { error } = await supabase.from('empresa_configuracoes').insert({
          empresa_id: empresa.id,
          tipo_calculo_curva: 'DIA_UM',
          curva_desempenho: currentCurvas
        });
        if (error) setStatus('Error inserting: ' + error.message);
        else setStatus('Successfully inserted Copagri config!');
      }
    };
    run();
  }, []);

  return <div style={{position:'fixed', top:0, left:0, background:'black', color:'lime', zIndex:9999}}>{status}</div>;
};
