const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', process.env.VITE_SUPABASE_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');

const rawData = [
{ dia: 1, fase: 'Aloj', peso: 22.00, cmd: 1.120, cons: 1.120 },
{ dia: 2, fase: 'Aloj', peso: 22.68, cmd: 1.144, cons: 2.264 },
{ dia: 3, fase: 'Aloj', peso: 23.36, cmd: 1.168, cons: 3.432 },
{ dia: 4, fase: 'Aloj', peso: 24.07, cmd: 1.192, cons: 4.624 },
{ dia: 5, fase: 'Aloj', peso: 24.78, cmd: 1.216, cons: 5.840 },
{ dia: 6, fase: 'Aloj', peso: 25.50, cmd: 1.240, cons: 7.080 },
{ dia: 7, fase: 'Aloj', peso: 26.24, cmd: 1.264, cons: 8.344 },
{ dia: 8, fase: 'Aloj', peso: 26.99, cmd: 1.287, cons: 9.631 },
{ dia: 9, fase: 'Aloj', peso: 27.75, cmd: 1.311, cons: 10.942 },
{ dia: 10, fase: 'Aloj', peso: 28.52, cmd: 1.334, cons: 12.276 },
{ dia: 11, fase: 'Aloj', peso: 29.31, cmd: 1.358, cons: 13.634 },
{ dia: 12, fase: 'Aloj', peso: 30.10, cmd: 1.381, cons: 15.015 },
{ dia: 13, fase: 'Aloj', peso: 30.91, cmd: 1.404, cons: 16.419 },
{ dia: 14, fase: 'Aloj', peso: 31.73, cmd: 1.427, cons: 17.846 },
{ dia: 15, fase: 'C1', peso: 32.57, cmd: 1.466, cons: 19.312 },
{ dia: 16, fase: 'C1', peso: 33.41, cmd: 1.489, cons: 20.801 },
{ dia: 17, fase: 'C1', peso: 34.26, cmd: 1.512, cons: 22.312 },
{ dia: 18, fase: 'C1', peso: 35.12, cmd: 1.534, cons: 23.847 },
{ dia: 19, fase: 'C1', peso: 35.98, cmd: 1.557, cons: 25.404 },
{ dia: 20, fase: 'C1', peso: 36.85, cmd: 1.579, cons: 26.983 },
{ dia: 21, fase: 'C1', peso: 37.73, cmd: 1.601, cons: 28.584 },
{ dia: 22, fase: 'C1', peso: 38.61, cmd: 1.623, cons: 30.207 },
{ dia: 23, fase: 'C1', peso: 39.51, cmd: 1.645, cons: 31.852 },
{ dia: 24, fase: 'C1', peso: 40.41, cmd: 1.666, cons: 33.518 },
{ dia: 25, fase: 'C1', peso: 41.31, cmd: 1.688, cons: 35.206 },
{ dia: 26, fase: 'C1', peso: 42.23, cmd: 1.709, cons: 36.914 },
{ dia: 27, fase: 'C1', peso: 43.15, cmd: 1.729, cons: 38.644 },
{ dia: 28, fase: 'C1', peso: 44.07, cmd: 1.750, cons: 40.394 },
{ dia: 29, fase: 'C1', peso: 45.01, cmd: 1.771, cons: 42.165 },
{ dia: 30, fase: 'C1', peso: 45.95, cmd: 1.791, cons: 43.956 },
{ dia: 31, fase: 'C1', peso: 46.90, cmd: 1.811, cons: 45.767 },
{ dia: 32, fase: 'C2', peso: 47.85, cmd: 1.886, cons: 47.653 },
{ dia: 33, fase: 'C2', peso: 48.82, cmd: 1.906, cons: 49.559 },
{ dia: 34, fase: 'C2', peso: 49.79, cmd: 1.926, cons: 51.485 },
{ dia: 35, fase: 'C2', peso: 50.75, cmd: 1.946, cons: 53.431 },
{ dia: 36, fase: 'C2', peso: 51.72, cmd: 1.966, cons: 55.397 },
{ dia: 37, fase: 'C2', peso: 52.70, cmd: 1.985, cons: 57.382 },
{ dia: 38, fase: 'C2', peso: 53.68, cmd: 2.004, cons: 59.386 },
{ dia: 39, fase: 'C2', peso: 54.67, cmd: 2.023, cons: 61.409 },
{ dia: 40, fase: 'C2', peso: 55.67, cmd: 2.042, cons: 63.451 },
{ dia: 41, fase: 'C2', peso: 56.67, cmd: 2.060, cons: 65.511 },
{ dia: 42, fase: 'C2', peso: 57.68, cmd: 2.078, cons: 67.590 },
{ dia: 43, fase: 'C2', peso: 58.69, cmd: 2.097, cons: 69.686 },
{ dia: 44, fase: 'C2', peso: 59.71, cmd: 2.114, cons: 71.801 },
{ dia: 45, fase: 'C2', peso: 60.73, cmd: 2.132, cons: 73.933 },
{ dia: 46, fase: 'C3', peso: 61.76, cmd: 2.190, cons: 76.123 },
{ dia: 47, fase: 'C3', peso: 62.78, cmd: 2.208, cons: 78.331 },
{ dia: 48, fase: 'C3', peso: 63.81, cmd: 2.225, cons: 80.556 },
{ dia: 49, fase: 'C3', peso: 64.84, cmd: 2.242, cons: 82.798 },
{ dia: 50, fase: 'C3', peso: 65.88, cmd: 2.259, cons: 85.056 },
{ dia: 51, fase: 'C3', peso: 66.92, cmd: 2.275, cons: 87.331 },
{ dia: 52, fase: 'C3', peso: 67.96, cmd: 2.291, cons: 89.622 },
{ dia: 53, fase: 'C3', peso: 69.01, cmd: 2.307, cons: 91.929 },
{ dia: 54, fase: 'C3', peso: 70.05, cmd: 2.323, cons: 94.252 },
{ dia: 55, fase: 'C3', peso: 71.11, cmd: 2.338, cons: 96.590 },
{ dia: 56, fase: 'C3', peso: 72.16, cmd: 2.353, cons: 98.944 },
{ dia: 57, fase: 'C3', peso: 73.21, cmd: 2.368, cons: 101.312 },
{ dia: 58, fase: 'C3', peso: 74.27, cmd: 2.383, cons: 103.695 },
{ dia: 59, fase: 'C3', peso: 75.33, cmd: 2.397, cons: 106.093 },
{ dia: 60, fase: 'C3', peso: 76.39, cmd: 2.412, cons: 108.504 },
{ dia: 61, fase: 'C3', peso: 77.45, cmd: 2.425, cons: 110.930 },
{ dia: 62, fase: 'C3', peso: 78.51, cmd: 2.439, cons: 113.369 },
{ dia: 63, fase: 'T1', peso: 79.57, cmd: 2.641, cons: 116.010 },
{ dia: 64, fase: 'T1', peso: 80.91, cmd: 2.659, cons: 118.668 },
{ dia: 65, fase: 'T1', peso: 82.24, cmd: 2.676, cons: 121.344 },
{ dia: 66, fase: 'T1', peso: 83.56, cmd: 2.692, cons: 124.036 },
{ dia: 67, fase: 'T1', peso: 84.88, cmd: 2.708, cons: 126.745 },
{ dia: 68, fase: 'T1', peso: 86.19, cmd: 2.724, cons: 129.469 },
{ dia: 69, fase: 'T1', peso: 87.48, cmd: 2.739, cons: 132.208 },
{ dia: 70, fase: 'T1', peso: 88.77, cmd: 2.754, cons: 134.962 },
{ dia: 71, fase: 'T1', peso: 90.05, cmd: 2.768, cons: 137.729 },
{ dia: 72, fase: 'T1', peso: 91.33, cmd: 2.781, cons: 140.510 },
{ dia: 73, fase: 'T1', peso: 92.59, cmd: 2.794, cons: 143.305 },
{ dia: 74, fase: 'T1', peso: 93.84, cmd: 2.807, cons: 146.112 },
{ dia: 75, fase: 'T1', peso: 95.08, cmd: 2.900, cons: 149.012 },
{ dia: 76, fase: 'T1', peso: 96.30, cmd: 2.900, cons: 151.912 },
{ dia: 77, fase: 'T2', peso: 97.50, cmd: 2.900, cons: 154.812 },
{ dia: 78, fase: 'T2', peso: 98.70, cmd: 2.900, cons: 157.712 },
{ dia: 79, fase: 'T2', peso: 99.87, cmd: 2.900, cons: 160.612 },
{ dia: 80, fase: 'T2', peso: 101.03, cmd: 2.900, cons: 163.512 },
{ dia: 81, fase: 'T2', peso: 102.16, cmd: 2.900, cons: 166.412 },
{ dia: 82, fase: 'T2', peso: 103.28, cmd: 2.950, cons: 169.362 },
{ dia: 83, fase: 'T2', peso: 104.37, cmd: 2.950, cons: 172.312 },
{ dia: 84, fase: 'T2', peso: 105.45, cmd: 2.950, cons: 175.262 },
{ dia: 85, fase: 'T2', peso: 106.52, cmd: 2.950, cons: 178.212 },
{ dia: 86, fase: 'T2', peso: 107.58, cmd: 2.950, cons: 181.162 },
{ dia: 87, fase: 'T2', peso: 108.65, cmd: 2.950, cons: 184.112 },
{ dia: 88, fase: 'T2', peso: 109.72, cmd: 2.950, cons: 187.062 },
{ dia: 89, fase: 'T2', peso: 110.79, cmd: 2.950, cons: 190.012 },
{ dia: 90, fase: 'T2', peso: 111.86, cmd: 2.950, cons: 192.962 },
{ dia: 91, fase: 'T2', peso: 112.93, cmd: 2.950, cons: 195.912 },
{ dia: 92, fase: 'T2', peso: 114.00, cmd: 2.950, cons: 198.862 },
{ dia: 93, fase: 'T2', peso: 115.06, cmd: 2.950, cons: 201.812 },
{ dia: 94, fase: 'T2', peso: 116.13, cmd: 2.950, cons: 204.762 },
{ dia: 95, fase: 'T2', peso: 117.19, cmd: 2.950, cons: 207.712 },
{ dia: 96, fase: 'T2', peso: 118.25, cmd: 2.950, cons: 210.662 }
];

const curveObj = rawData.map((d, i) => {
  const nextPeso = rawData[i + 1] ? rawData[i + 1].peso : (d.peso + (d.peso - rawData[i - 1].peso));
  const gpd = nextPeso - d.peso;
  return {
    dia: d.dia,
    pesoInicial: d.peso,
    pesoFinal: nextPeso,
    cmd: d.cmd,
    consumoAcumulado: d.cons,
    gpd: gpd
  };
});

const progBTZ = [
  { nome: 'Alojamento', racao: 'Alojamento', dia_inicio: 1, dia_fim: 14 },
  { nome: 'Crescimento 1', racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 31 },
  { nome: 'Crescimento 2', racao: 'Crescimento 2', dia_inicio: 32, dia_fim: 45 },
  { nome: 'Crescimento 3', racao: 'Crescimento 3', dia_inicio: 46, dia_fim: 62 },
  { nome: 'Terminação 1', racao: 'Terminação 1', dia_inicio: 63, dia_fim: 76 },
  { nome: 'Terminação 2', racao: 'Terminação 2', dia_inicio: 77, dia_fim: 96 }
];

const metasBTZ = {
  metaAlojamento: 17.85,
  metaCrescimento1: 27.92,
  metaCrescimento2: 28.17,
  metaCrescimento3: 39.44,
  metaTerminacao1: 38.54,
  metaTerminacao2: 58.74, // 210.66 - 151.912 = 58.748 -> rounded 58.75
  metaAcumulada: 210.66
};

async function updateSupabase() {
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000004';
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
    let updated = false;
    for (let i = 0; i < config.curva_desempenho.length; i++) {
        const curveDef = config.curva_desempenho[i];
        if (curveDef.tipoLote === 'Misto') {
            config.curva_desempenho[i].curve = curveObj;
            config.curva_desempenho[i].metas = metasBTZ;
            config.curva_desempenho[i].programa_alimentar = progBTZ;
            updated = true;
        }
    }
    if (updated) {
      await supabase.from('empresa_configuracoes').update({ curva_desempenho: config.curva_desempenho }).eq('empresa_id', EMPRESA_ID);
      console.log('BTZ Misto updated successfully!');
    }
  }
}
updateSupabase();
