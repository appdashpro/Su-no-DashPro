import { createClient } from "@supabase/supabase-js";
import { growthCurvesMisto, growthCurveFemea, defaultMetasFemea } from "./src/data";

const supabaseUrl = "https://cnemtndccfppibecjuep.supabase.co";
const supabaseKey = "sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPastre() {
  const { data: emp } = await supabase.from("empresas").select("id, nome").ilike("nome", "%Pastre%").limit(1);
  if (!emp || emp.length === 0) {
    console.log("Pastre not found");
    return;
  }
  const pastreId = emp[0].id;
  
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', pastreId).single();
  
  const novasCurvas = [
    // V1
    {
      id: crypto.randomUUID(),
      nome: 'Curva V1 (Antiga) - Misto',
      dataVigencia: '2026-01-01',
      tipoLote: 'Misto',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurvesMisto[0].curve,
      metas: growthCurvesMisto[0].metas
    },
    {
      id: crypto.randomUUID(),
      nome: 'Curva V1 (Antiga) - Macho',
      dataVigencia: '2026-01-01',
      tipoLote: 'Macho',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurvesMisto[0].curve,
      metas: growthCurvesMisto[0].metas
    },
    {
      id: crypto.randomUUID(),
      nome: 'Curva V1 (Antiga) - Fêmea',
      dataVigencia: '2026-01-01',
      tipoLote: 'Fêmea',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurveFemea,
      metas: defaultMetasFemea
    },
    // V2
    {
      id: crypto.randomUUID(),
      nome: 'Curva V2 (Atual) - Misto',
      dataVigencia: '2026-08-03',
      tipoLote: 'Misto',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurvesMisto[1].curve,
      metas: growthCurvesMisto[1].metas
    },
    {
      id: crypto.randomUUID(),
      nome: 'Curva V2 (Atual) - Macho',
      dataVigencia: '2026-08-03',
      tipoLote: 'Macho',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurvesMisto[1].curve,
      metas: growthCurvesMisto[1].metas
    },
    {
      id: crypto.randomUUID(),
      nome: 'Curva V2 (Atual) - Fêmea',
      dataVigencia: '2026-08-03',
      tipoLote: 'Fêmea',
      tipoCalculo: config?.tipo_calculo_curva || 'DIA_UM',
      metaMortalidade: config?.meta_mortalidade || 0,
      curve: growthCurveFemea,
      metas: defaultMetasFemea
    }
  ];

  if (config) {
    await supabase.from('empresa_configuracoes').update({ curva_desempenho: novasCurvas }).eq('empresa_id', pastreId);
  } else {
    await supabase.from('empresa_configuracoes').insert({ empresa_id: pastreId, curva_desempenho: novasCurvas });
  }
  
  console.log("Pastre curves updated successfully with all 6 variants.");
}

fixPastre();
