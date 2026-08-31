const { createClient } = require('@supabase/supabase-js');

const rawData = `
1 20.00 20.68 1.089 1.089
2 20.68 21.37 1.116 2.205
3 21.37 22.08 1.143 3.347
4 22.08 22.79 1.169 4.516
5 22.79 23.52 1.196 5.712
6 23.52 24.27 1.222 6.935
7 24.27 25.03 1.249 8.183
8 25.03 25.80 1.275 9.458
9 25.80 26.58 1.301 10.759
10 26.58 27.38 1.327 12.087
11 27.38 28.19 1.353 13.440
12 28.19 29.01 1.379 14.819
13 29.01 29.85 1.405 16.224
14 29.85 30.70 1.431 17.654
15 30.70 31.57 1.498 19.153
16 31.57 32.44 1.525 20.677
17 32.44 33.33 1.551 22.228
18 33.33 34.22 1.576 23.804
19 34.22 35.12 1.602 25.406
20 35.12 36.02 1.627 27.034
21 36.02 36.94 1.652 28.686
22 36.94 37.86 1.677 30.363
23 37.86 38.79 1.702 32.064
24 38.79 39.73 1.726 33.790
25 39.73 40.67 1.750 35.540
26 40.67 41.62 1.774 37.314
27 41.62 42.59 1.797 39.111
28 42.59 43.55 1.821 40.932
29 43.55 44.53 1.844 42.776
30 44.53 45.51 1.867 44.642
31 45.51 46.50 1.889 46.531
32 46.50 47.50 1.912 48.443
33 47.50 48.50 1.974 50.418
34 48.50 49.51 1.997 52.414
35 49.51 50.52 2.019 54.433
36 50.52 51.52 2.041 56.474
37 51.52 52.54 2.062 58.535
38 52.54 53.56 2.083 60.618
39 53.56 54.58 2.104 62.722
40 54.58 55.61 2.124 64.847
41 55.61 56.65 2.145 66.992
42 56.65 57.70 2.165 69.157
43 57.70 58.75 2.185 71.342
44 58.75 59.80 2.205 73.546
45 59.80 60.86 2.224 75.770
46 60.86 61.93 2.243 78.014
47 61.93 62.99 2.300 80.314
48 62.99 64.06 2.319 82.633
49 64.06 65.13 2.338 84.971
50 65.13 66.20 2.356 87.327
51 66.20 67.28 2.374 89.701
52 67.28 68.36 2.392 92.092
53 68.36 69.45 2.409 94.502
54 69.45 70.53 2.426 96.928
55 70.53 71.62 2.443 99.371
56 71.62 72.71 2.460 101.831
57 72.71 73.81 2.476 104.308
58 73.81 74.90 2.492 106.800
59 74.90 75.99 2.508 109.308
60 75.99 77.09 2.524 111.832
61 77.09 78.18 2.539 114.370
62 78.18 79.28 2.553 116.924
63 79.28 80.37 2.568 119.492
64 80.37 81.46 2.582 122.074
65 81.46 82.81 2.680 124.754
66 82.81 84.15 2.698 127.452
67 84.15 85.49 2.714 130.166
68 85.49 86.81 2.731 132.897
69 86.81 88.12 2.746 135.643
70 88.12 89.43 2.750 138.393
71 89.43 90.72 2.750 141.143
72 90.72 92.00 2.750 143.893
73 92.00 93.26 2.750 146.643
74 93.26 94.52 2.750 149.393
75 94.52 95.74 2.800 152.193
76 95.74 96.94 2.800 154.993
77 96.94 98.13 2.800 157.793
78 98.13 99.30 2.800 160.593
79 99.30 100.47 2.800 163.393
80 100.47 101.62 2.800 166.193
81 101.62 102.75 2.800 168.993
82 102.75 103.88 2.800 171.793
83 103.88 104.99 2.800 174.593
84 104.99 106.09 2.800 177.393
85 106.09 107.18 2.800 180.193
86 107.18 108.23 2.850 183.043
87 108.23 109.27 2.850 185.893
88 109.27 110.28 2.850 188.743
89 110.28 111.30 2.850 191.593
90 111.30 112.32 2.850 194.443
91 112.32 113.34 2.850 197.293
92 113.34 114.35 2.850 200.143
93 114.35 115.37 2.850 202.993
94 115.37 116.39 2.850 205.843
95 116.39 117.40 2.850 208.693
96 117.40 118.42 2.850 211.543
97 118.42 119.43 2.900 214.443
98 119.43 120.44 2.900 217.343
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
  metaAlojamento: 17.65,
  metaCrescimento1: 30.79,
  metaCrescimento2: 29.57,
  metaCrescimento3: 44.06,
  metaTerminacao1: 27.52,
  metaTerminacao2: 63.52,
  metaAcumulada: 213.11
};

const progV2 = [
  { nome: 'Alojamento', racao: 'Pré-Inicial / Alojamento', dia_inicio: 1, dia_fim: 14 },
  { nome: 'Crescimento 1', racao: 'Crescimento 1', dia_inicio: 15, dia_fim: 32 },
  { nome: 'Crescimento 2', racao: 'Crescimento 2', dia_inicio: 33, dia_fim: 46 },
  { nome: 'Crescimento 3', racao: 'Crescimento 3', dia_inicio: 47, dia_fim: 64 },
  { nome: 'Terminação 1', racao: 'Terminação 1', dia_inicio: 65, dia_fim: 74 },
  { nome: 'Terminação 2', racao: 'Terminação 2', dia_inicio: 75, dia_fim: 96 }
];

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
           if (curveDef.nome && curveDef.nome.includes('Curva V2')) {
               config.curva_desempenho[i].curve = curveObj;
               config.curva_desempenho[i].metas = metas;
               config.curva_desempenho[i].programa_alimentar = progV2;
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
           console.log('Supabase successfully updated for Pastre V2 (Misto, Macho, Fêmea)!');
         }
       } else {
         console.log('Could not find the curve to update.');
       }
  }
}

updateSupabase();
