const { createClient } = require('@supabase/supabase-js');

const rawData = `
1 22.00 22.68 1.029 1.029
2 22.68 23.37 1.051 2.079
3 23.37 24.08 1.073 3.153
4 24.08 24.79 1.095 4.248
5 24.79 25.52 1.117 5.365
6 25.52 26.26 1.139 6.504
7 26.26 27.01 1.161 7.665
8 27.01 27.77 1.183 8.848
9 27.77 28.54 1.204 10.052
10 28.54 29.32 1.226 11.278
11 29.32 30.12 1.247 12.525
12 30.12 30.93 1.269 13.794
13 30.93 31.74 1.290 15.084
14 31.74 32.56 1.311 16.395
15 32.56 33.44 1.486 17.881
16 33.44 34.34 1.511 19.392
17 34.34 35.24 1.535 20.927
18 35.24 36.16 1.560 22.487
19 36.16 37.08 1.584 24.070
20 37.08 38.00 1.607 25.678
21 38.00 38.94 1.631 27.309
22 38.94 39.88 1.654 28.963
23 39.88 40.83 1.677 30.640
24 40.83 41.79 1.700 32.340
25 41.79 42.75 1.723 34.063
26 42.75 43.73 1.745 35.808
27 43.73 44.71 1.767 37.575
28 44.71 45.69 1.789 39.364
29 45.69 46.73 1.954 41.317
30 46.73 47.78 1.978 43.295
31 47.78 48.83 2.002 45.297
32 48.83 49.90 2.025 47.322
33 49.90 50.95 2.049 49.371
34 50.95 52.02 2.072 51.443
35 52.02 53.09 2.094 53.537
36 53.09 54.17 2.117 55.654
37 54.17 55.26 2.139 57.793
38 55.26 56.36 2.161 59.953
39 56.36 57.46 2.182 62.136
40 57.46 58.57 2.204 64.339
41 58.57 59.68 2.225 66.564
42 59.68 60.80 2.246 68.810
43 60.80 61.92 2.306 71.116
44 61.92 63.05 2.326 73.442
45 63.05 64.18 2.347 75.789
46 64.18 65.32 2.367 78.155
47 65.32 66.46 2.386 80.542
48 66.46 67.61 2.406 82.947
49 67.61 68.76 2.425 85.372
50 68.76 69.91 2.443 87.815
51 69.91 71.07 2.462 90.277
52 71.07 72.23 2.480 92.756
53 72.23 73.39 2.497 95.254
54 73.39 74.56 2.515 97.769
55 74.56 75.73 2.532 100.300
56 75.73 76.89 2.549 102.849
57 76.89 78.19 2.525 105.374
58 78.19 79.49 2.543 107.917
59 79.49 80.77 2.560 110.477
60 80.77 82.05 2.576 113.054
61 82.05 83.33 2.593 115.646
62 83.33 84.59 2.608 118.254
63 84.59 85.85 2.623 120.877
64 85.85 87.10 2.638 123.515
65 87.10 88.34 2.652 126.167
66 88.34 89.57 2.666 128.833
67 89.57 90.76 2.607 131.440
68 90.76 91.94 2.620 134.060
69 91.94 93.10 2.631 136.691
70 93.10 94.26 2.642 139.333
71 94.26 95.41 2.653 141.987
72 95.41 96.54 2.664 144.651
73 96.54 97.67 2.674 147.324
74 97.67 98.78 2.684 150.008
75 98.78 99.88 2.693 152.701
76 99.88 100.98 2.702 155.403
77 100.98 102.06 2.711 158.114
78 102.06 103.13 2.719 160.833
79 103.13 104.17 2.727 163.560
80 104.17 105.19 2.735 166.295
`;

const lines = rawData.trim().split('\n');
const curveObj = lines.map(line => {
  const parts = line.trim().split(/\s+/).map(Number);
  const dia = parts[0];
  const pesoIn = parts[1];
  const pesoFim = parts[2];
  const cmd = parts[3];
  const cons = parts[4];
  const gpd = pesoFim - pesoIn;
  return {
    dia: dia,
    pesoInicial: pesoIn,
    pesoFinal: pesoFim,
    cmd: cmd,
    consumoAcumulado: cons,
    gpd: gpd
  };
});

const metas = {
  metaAlojamento: 16.39,
  metaCrescimento1: 22.97,
  metaCrescimento2: 29.45,
  metaCrescimento3: 34.04,
  metaTerminacao1: 25.98,
  metaTerminacao2: 37.46,
  metaAcumulada: 166.29
};

async function updateSupabase() {
  const supabaseUrl = "https://cnemtndccfppibecjuep.supabase.co";
  const supabaseKey = process.env.VITE_SUPABASE_KEY || "sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const EMPRESA_ID = '00000000-0000-0000-0000-000000000001'; // Pastre
  const { data: config } = await supabase.from('empresa_configuracoes').select('*').eq('empresa_id', EMPRESA_ID).single();
  
  if (config && config.curva_desempenho) {
       let updated = false;
       for (let i = 0; i < config.curva_desempenho.length; i++) {
           const curveDef = config.curva_desempenho[i];
           if (curveDef.nome && curveDef.nome.includes('Curva V1') && curveDef.tipoLote === 'Fêmea') {
               config.curva_desempenho[i].curve = curveObj;
               config.curva_desempenho[i].metas = metas;
               updated = true;
           }
       }
       
       if (updated) {
         const { error } = await supabase.from('empresa_configuracoes').update({
            curva_desempenho: config.curva_desempenho
         }).eq('empresa_id', EMPRESA_ID);
         
         if (error) {
           console.error('Failed to update Supabase:', error);
         } else {
           console.log('Supabase successfully updated for Pastre V1 Fêmea!');
         }
       } else {
         console.log('Could not find the curve to update.');
       }
  }
}

updateSupabase();
