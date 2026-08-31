import { createClient } from '@supabase/supabase-js';
import { 
  growthCurvesMisto, 
  defaultPastreProgramaAlimentar, 
  defaultBugioProgramaAlimentar, 
  defaultBtzProgramaAlimentar,
  growthCurveBugio,
  growthCurveBtz,
  defaultMetasBugio,
  defaultMetasBtz
} from '../../src/data';
import { defaultMugnolConfig } from '../../src/mugnolConfig';

const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.VITE_SUPABASE_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

async function seed() {
  const { data: configs } = await supabase.from('empresa_configuracoes').select('*');
  const { data: empresas } = await supabase.from('empresas').select('*');

  for (const emp of empresas) {
    let cfg = configs?.find(c => c.empresa_id === emp.id);
    if (!cfg) {
      console.log('No config for', emp.nome, 'creating...');
      const { data: newCfg } = await supabase.from('empresa_configuracoes').insert({ empresa_id: emp.id }).select().single();
      cfg = newCfg;
    }

    let updated = false;
    let newCurva = cfg.curva_desempenho || [];
    let newProg = cfg.programa_alimentar || [];

    if (emp.id === '00000000-0000-0000-0000-000000000001') {
      // Pastre
      if (!newCurva.length) {
         newCurva = growthCurvesMisto;
         updated = true;
      }
      if (!newProg.length) {
         newProg = defaultPastreProgramaAlimentar;
         updated = true;
      }
    } else if (emp.id === '00000000-0000-0000-0000-000000000002') {
      // Bugio
      if (!newCurva.length) {
         newCurva = [{
            id: 'bugio-curve',
            nome: 'Curva Bugio',
            dataVigencia: '2026-08-01',
            tipoLote: 'Misto',
            version: 'bugio',
            tipoCalculo: 'DIA_UM',
            metaMortalidade: 0,
            curve: growthCurveBugio,
            metas: defaultMetasBugio
         }];
         updated = true;
      }
      if (!newProg.length) {
         newProg = defaultBugioProgramaAlimentar;
         updated = true;
      }
    } else if (emp.id === '00000000-0000-0000-0000-000000000003') {
      // Mugnol
      if (!newCurva.length) {
         newCurva = defaultMugnolConfig.curva_desempenho;
         updated = true;
      }
      if (!newProg.length) {
         newProg = defaultMugnolConfig.programa_alimentar;
         updated = true;
      }
    } else if (emp.nome.toLowerCase().includes('btz')) {
      // BTZ
      if (!newCurva.length) {
         newCurva = [{
             id: 'btz-curve',
             nome: 'Curva Grupo BTZ',
             dataVigencia: '2026-08-01',
             tipoLote: 'Misto',
             version: 'btz',
             tipoCalculo: 'DIA_UM',
             metaMortalidade: 0,
             curve: growthCurveBtz,
             metas: defaultMetasBtz
         }];
         updated = true;
      }
      if (!newProg.length) {
         newProg = defaultBtzProgramaAlimentar;
         updated = true;
      }
    }

    if (updated) {
      console.log('Updating config for', emp.nome);
      await supabase.from('empresa_configuracoes').update({
        curva_desempenho: newCurva,
        programa_alimentar: newProg
      }).eq('empresa_id', emp.id);
    }
  }
  
  console.log('Done!');
}

seed();
