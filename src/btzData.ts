
export const defaultBtzProgramaAlimentar = [
  { nome: 'Alojamento', dia_inicio: 1, dia_fim: 14, racao: 'Alojamento' },
  { nome: 'Crescimento 1', dia_inicio: 15, dia_fim: 31, racao: 'Crescimento 1' },
  { nome: 'Crescimento 2', dia_inicio: 32, dia_fim: 45, racao: 'Crescimento 2' },
  { nome: 'Crescimento 3', dia_inicio: 46, dia_fim: 62, racao: 'Crescimento 3' },
  { nome: 'Terminação 1', dia_inicio: 63, dia_fim: 76, racao: 'Terminação 1' },
  { nome: 'Terminação 2', dia_inicio: 77, dia_fim: 96, racao: 'Terminação 2' }
];

export const defaultMetasBtz = {
  metaAlojamento: 17.85,
  metaCrescimento1: 27.92,
  metaCrescimento2: 28.17,
  metaCrescimento3: 39.44,
  metaTerminacao1: 38.54,
  metaTerminacao2: 58.75,
  metaAcumulada: 210.67
};

export const growthCurveBtz = [
  {
    "dia": 1,
    "pesoInicial": 22,
    "pesoFinal": 22.68,
    "cmd": 1.12,
    "consumoAcumulado": 1.12,
    "gpd": 0.68
  },
  {
    "dia": 2,
    "pesoInicial": 22.68,
    "pesoFinal": 23.36,
    "cmd": 1.144,
    "consumoAcumulado": 2.264,
    "gpd": 0.68
  },
  {
    "dia": 3,
    "pesoInicial": 23.36,
    "pesoFinal": 24.07,
    "cmd": 1.168,
    "consumoAcumulado": 3.432,
    "gpd": 0.71
  },
  {
    "dia": 4,
    "pesoInicial": 24.07,
    "pesoFinal": 24.78,
    "cmd": 1.192,
    "consumoAcumulado": 4.624,
    "gpd": 0.71
  },
  {
    "dia": 5,
    "pesoInicial": 24.78,
    "pesoFinal": 25.5,
    "cmd": 1.216,
    "consumoAcumulado": 5.84,
    "gpd": 0.72
  },
  {
    "dia": 6,
    "pesoInicial": 25.5,
    "pesoFinal": 26.24,
    "cmd": 1.24,
    "consumoAcumulado": 7.08,
    "gpd": 0.74
  },
  {
    "dia": 7,
    "pesoInicial": 26.24,
    "pesoFinal": 26.99,
    "cmd": 1.264,
    "consumoAcumulado": 8.344,
    "gpd": 0.75
  },
  {
    "dia": 8,
    "pesoInicial": 26.99,
    "pesoFinal": 27.75,
    "cmd": 1.287,
    "consumoAcumulado": 9.631,
    "gpd": 0.76
  },
  {
    "dia": 9,
    "pesoInicial": 27.75,
    "pesoFinal": 28.52,
    "cmd": 1.311,
    "consumoAcumulado": 10.942,
    "gpd": 0.77
  },
  {
    "dia": 10,
    "pesoInicial": 28.52,
    "pesoFinal": 29.31,
    "cmd": 1.334,
    "consumoAcumulado": 12.276,
    "gpd": 0.79
  },
  {
    "dia": 11,
    "pesoInicial": 29.31,
    "pesoFinal": 30.1,
    "cmd": 1.358,
    "consumoAcumulado": 13.634,
    "gpd": 0.79
  },
  {
    "dia": 12,
    "pesoInicial": 30.1,
    "pesoFinal": 30.91,
    "cmd": 1.381,
    "consumoAcumulado": 15.015,
    "gpd": 0.81
  },
  {
    "dia": 13,
    "pesoInicial": 30.91,
    "pesoFinal": 31.73,
    "cmd": 1.404,
    "consumoAcumulado": 16.419,
    "gpd": 0.82
  },
  {
    "dia": 14,
    "pesoInicial": 31.73,
    "pesoFinal": 32.57,
    "cmd": 1.427,
    "consumoAcumulado": 17.846,
    "gpd": 0.84
  },
  {
    "dia": 15,
    "pesoInicial": 32.57,
    "pesoFinal": 33.41,
    "cmd": 1.466,
    "consumoAcumulado": 19.312,
    "gpd": 0.84
  },
  {
    "dia": 16,
    "pesoInicial": 33.41,
    "pesoFinal": 34.26,
    "cmd": 1.489,
    "consumoAcumulado": 20.801,
    "gpd": 0.85
  },
  {
    "dia": 17,
    "pesoInicial": 34.26,
    "pesoFinal": 35.12,
    "cmd": 1.512,
    "consumoAcumulado": 22.312,
    "gpd": 0.86
  },
  {
    "dia": 18,
    "pesoInicial": 35.12,
    "pesoFinal": 35.98,
    "cmd": 1.534,
    "consumoAcumulado": 23.847,
    "gpd": 0.86
  },
  {
    "dia": 19,
    "pesoInicial": 35.98,
    "pesoFinal": 36.85,
    "cmd": 1.557,
    "consumoAcumulado": 25.404,
    "gpd": 0.87
  },
  {
    "dia": 20,
    "pesoInicial": 36.85,
    "pesoFinal": 37.73,
    "cmd": 1.579,
    "consumoAcumulado": 26.983,
    "gpd": 0.88
  },
  {
    "dia": 21,
    "pesoInicial": 37.73,
    "pesoFinal": 38.61,
    "cmd": 1.601,
    "consumoAcumulado": 28.584,
    "gpd": 0.88
  },
  {
    "dia": 22,
    "pesoInicial": 38.61,
    "pesoFinal": 39.51,
    "cmd": 1.623,
    "consumoAcumulado": 30.207,
    "gpd": 0.9
  },
  {
    "dia": 23,
    "pesoInicial": 39.51,
    "pesoFinal": 40.41,
    "cmd": 1.645,
    "consumoAcumulado": 31.852,
    "gpd": 0.9
  },
  {
    "dia": 24,
    "pesoInicial": 40.41,
    "pesoFinal": 41.31,
    "cmd": 1.666,
    "consumoAcumulado": 33.518,
    "gpd": 0.9
  },
  {
    "dia": 25,
    "pesoInicial": 41.31,
    "pesoFinal": 42.23,
    "cmd": 1.688,
    "consumoAcumulado": 35.206,
    "gpd": 0.92
  },
  {
    "dia": 26,
    "pesoInicial": 42.23,
    "pesoFinal": 43.15,
    "cmd": 1.709,
    "consumoAcumulado": 36.914,
    "gpd": 0.92
  },
  {
    "dia": 27,
    "pesoInicial": 43.15,
    "pesoFinal": 44.07,
    "cmd": 1.729,
    "consumoAcumulado": 38.644,
    "gpd": 0.92
  },
  {
    "dia": 28,
    "pesoInicial": 44.07,
    "pesoFinal": 45.01,
    "cmd": 1.75,
    "consumoAcumulado": 40.394,
    "gpd": 0.94
  },
  {
    "dia": 29,
    "pesoInicial": 45.01,
    "pesoFinal": 45.95,
    "cmd": 1.771,
    "consumoAcumulado": 42.165,
    "gpd": 0.94
  },
  {
    "dia": 30,
    "pesoInicial": 45.95,
    "pesoFinal": 46.9,
    "cmd": 1.791,
    "consumoAcumulado": 43.956,
    "gpd": 0.95
  },
  {
    "dia": 31,
    "pesoInicial": 46.9,
    "pesoFinal": 47.85,
    "cmd": 1.811,
    "consumoAcumulado": 45.767,
    "gpd": 0.95
  },
  {
    "dia": 32,
    "pesoInicial": 47.85,
    "pesoFinal": 48.82,
    "cmd": 1.886,
    "consumoAcumulado": 47.653,
    "gpd": 0.97
  },
  {
    "dia": 33,
    "pesoInicial": 48.82,
    "pesoFinal": 49.79,
    "cmd": 1.906,
    "consumoAcumulado": 49.559,
    "gpd": 0.97
  },
  {
    "dia": 34,
    "pesoInicial": 49.79,
    "pesoFinal": 50.75,
    "cmd": 1.926,
    "consumoAcumulado": 51.485,
    "gpd": 0.96
  },
  {
    "dia": 35,
    "pesoInicial": 50.75,
    "pesoFinal": 51.72,
    "cmd": 1.946,
    "consumoAcumulado": 53.431,
    "gpd": 0.97
  },
  {
    "dia": 36,
    "pesoInicial": 51.72,
    "pesoFinal": 52.7,
    "cmd": 1.966,
    "consumoAcumulado": 55.397,
    "gpd": 0.98
  },
  {
    "dia": 37,
    "pesoInicial": 52.7,
    "pesoFinal": 53.68,
    "cmd": 1.985,
    "consumoAcumulado": 57.382,
    "gpd": 0.98
  },
  {
    "dia": 38,
    "pesoInicial": 53.68,
    "pesoFinal": 54.67,
    "cmd": 2.004,
    "consumoAcumulado": 59.386,
    "gpd": 0.99
  },
  {
    "dia": 39,
    "pesoInicial": 54.67,
    "pesoFinal": 55.67,
    "cmd": 2.023,
    "consumoAcumulado": 61.409,
    "gpd": 1
  },
  {
    "dia": 40,
    "pesoInicial": 55.67,
    "pesoFinal": 56.67,
    "cmd": 2.042,
    "consumoAcumulado": 63.451,
    "gpd": 1
  },
  {
    "dia": 41,
    "pesoInicial": 56.67,
    "pesoFinal": 57.68,
    "cmd": 2.06,
    "consumoAcumulado": 65.511,
    "gpd": 1.01
  },
  {
    "dia": 42,
    "pesoInicial": 57.68,
    "pesoFinal": 58.69,
    "cmd": 2.078,
    "consumoAcumulado": 67.59,
    "gpd": 1.01
  },
  {
    "dia": 43,
    "pesoInicial": 58.69,
    "pesoFinal": 59.71,
    "cmd": 2.097,
    "consumoAcumulado": 69.686,
    "gpd": 1.02
  },
  {
    "dia": 44,
    "pesoInicial": 59.71,
    "pesoFinal": 60.73,
    "cmd": 2.114,
    "consumoAcumulado": 71.801,
    "gpd": 1.02
  },
  {
    "dia": 45,
    "pesoInicial": 60.73,
    "pesoFinal": 61.76,
    "cmd": 2.132,
    "consumoAcumulado": 73.933,
    "gpd": 1.03
  },
  {
    "dia": 46,
    "pesoInicial": 61.76,
    "pesoFinal": 62.78,
    "cmd": 2.19,
    "consumoAcumulado": 76.123,
    "gpd": 1.02
  },
  {
    "dia": 47,
    "pesoInicial": 62.78,
    "pesoFinal": 63.81,
    "cmd": 2.208,
    "consumoAcumulado": 78.331,
    "gpd": 1.03
  },
  {
    "dia": 48,
    "pesoInicial": 63.81,
    "pesoFinal": 64.84,
    "cmd": 2.225,
    "consumoAcumulado": 80.556,
    "gpd": 1.03
  },
  {
    "dia": 49,
    "pesoInicial": 64.84,
    "pesoFinal": 65.88,
    "cmd": 2.242,
    "consumoAcumulado": 82.798,
    "gpd": 1.04
  },
  {
    "dia": 50,
    "pesoInicial": 65.88,
    "pesoFinal": 66.92,
    "cmd": 2.259,
    "consumoAcumulado": 85.056,
    "gpd": 1.04
  },
  {
    "dia": 51,
    "pesoInicial": 66.92,
    "pesoFinal": 67.96,
    "cmd": 2.275,
    "consumoAcumulado": 87.331,
    "gpd": 1.04
  },
  {
    "dia": 52,
    "pesoInicial": 67.96,
    "pesoFinal": 69.01,
    "cmd": 2.291,
    "consumoAcumulado": 89.622,
    "gpd": 1.05
  },
  {
    "dia": 53,
    "pesoInicial": 69.01,
    "pesoFinal": 70.05,
    "cmd": 2.307,
    "consumoAcumulado": 91.929,
    "gpd": 1.04
  },
  {
    "dia": 54,
    "pesoInicial": 70.05,
    "pesoFinal": 71.11,
    "cmd": 2.323,
    "consumoAcumulado": 94.252,
    "gpd": 1.06
  },
  {
    "dia": 55,
    "pesoInicial": 71.11,
    "pesoFinal": 72.16,
    "cmd": 2.338,
    "consumoAcumulado": 96.59,
    "gpd": 1.05
  },
  {
    "dia": 56,
    "pesoInicial": 72.16,
    "pesoFinal": 73.21,
    "cmd": 2.353,
    "consumoAcumulado": 98.944,
    "gpd": 1.05
  },
  {
    "dia": 57,
    "pesoInicial": 73.21,
    "pesoFinal": 74.27,
    "cmd": 2.368,
    "consumoAcumulado": 101.312,
    "gpd": 1.06
  },
  {
    "dia": 58,
    "pesoInicial": 74.27,
    "pesoFinal": 75.33,
    "cmd": 2.383,
    "consumoAcumulado": 103.695,
    "gpd": 1.06
  },
  {
    "dia": 59,
    "pesoInicial": 75.33,
    "pesoFinal": 76.39,
    "cmd": 2.397,
    "consumoAcumulado": 106.093,
    "gpd": 1.06
  },
  {
    "dia": 60,
    "pesoInicial": 76.39,
    "pesoFinal": 77.45,
    "cmd": 2.412,
    "consumoAcumulado": 108.504,
    "gpd": 1.06
  },
  {
    "dia": 61,
    "pesoInicial": 77.45,
    "pesoFinal": 78.51,
    "cmd": 2.425,
    "consumoAcumulado": 110.93,
    "gpd": 1.06
  },
  {
    "dia": 62,
    "pesoInicial": 78.51,
    "pesoFinal": 79.57,
    "cmd": 2.439,
    "consumoAcumulado": 113.369,
    "gpd": 1.06
  },
  {
    "dia": 63,
    "pesoInicial": 79.57,
    "pesoFinal": 80.91,
    "cmd": 2.641,
    "consumoAcumulado": 116.01,
    "gpd": 1.34
  },
  {
    "dia": 64,
    "pesoInicial": 80.91,
    "pesoFinal": 82.24,
    "cmd": 2.659,
    "consumoAcumulado": 118.668,
    "gpd": 1.33
  },
  {
    "dia": 65,
    "pesoInicial": 82.24,
    "pesoFinal": 83.56,
    "cmd": 2.676,
    "consumoAcumulado": 121.344,
    "gpd": 1.32
  },
  {
    "dia": 66,
    "pesoInicial": 83.56,
    "pesoFinal": 84.88,
    "cmd": 2.692,
    "consumoAcumulado": 124.036,
    "gpd": 1.32
  },
  {
    "dia": 67,
    "pesoInicial": 84.88,
    "pesoFinal": 86.19,
    "cmd": 2.708,
    "consumoAcumulado": 126.745,
    "gpd": 1.31
  },
  {
    "dia": 68,
    "pesoInicial": 86.19,
    "pesoFinal": 87.48,
    "cmd": 2.724,
    "consumoAcumulado": 129.469,
    "gpd": 1.29
  },
  {
    "dia": 69,
    "pesoInicial": 87.48,
    "pesoFinal": 88.77,
    "cmd": 2.739,
    "consumoAcumulado": 132.208,
    "gpd": 1.29
  },
  {
    "dia": 70,
    "pesoInicial": 88.77,
    "pesoFinal": 90.05,
    "cmd": 2.754,
    "consumoAcumulado": 134.962,
    "gpd": 1.28
  },
  {
    "dia": 71,
    "pesoInicial": 90.05,
    "pesoFinal": 91.33,
    "cmd": 2.768,
    "consumoAcumulado": 137.729,
    "gpd": 1.28
  },
  {
    "dia": 72,
    "pesoInicial": 91.33,
    "pesoFinal": 92.59,
    "cmd": 2.781,
    "consumoAcumulado": 140.51,
    "gpd": 1.26
  },
  {
    "dia": 73,
    "pesoInicial": 92.59,
    "pesoFinal": 93.84,
    "cmd": 2.794,
    "consumoAcumulado": 143.305,
    "gpd": 1.25
  },
  {
    "dia": 74,
    "pesoInicial": 93.84,
    "pesoFinal": 95.08,
    "cmd": 2.807,
    "consumoAcumulado": 146.112,
    "gpd": 1.24
  },
  {
    "dia": 75,
    "pesoInicial": 95.08,
    "pesoFinal": 96.3,
    "cmd": 2.9,
    "consumoAcumulado": 149.012,
    "gpd": 1.22
  },
  {
    "dia": 76,
    "pesoInicial": 96.3,
    "pesoFinal": 97.5,
    "cmd": 2.9,
    "consumoAcumulado": 151.912,
    "gpd": 1.2
  },
  {
    "dia": 77,
    "pesoInicial": 97.5,
    "pesoFinal": 98.7,
    "cmd": 2.9,
    "consumoAcumulado": 154.812,
    "gpd": 1.2
  },
  {
    "dia": 78,
    "pesoInicial": 98.7,
    "pesoFinal": 99.87,
    "cmd": 2.9,
    "consumoAcumulado": 157.712,
    "gpd": 1.17
  },
  {
    "dia": 79,
    "pesoInicial": 99.87,
    "pesoFinal": 101.03,
    "cmd": 2.9,
    "consumoAcumulado": 160.612,
    "gpd": 1.16
  },
  {
    "dia": 80,
    "pesoInicial": 101.03,
    "pesoFinal": 102.16,
    "cmd": 2.9,
    "consumoAcumulado": 163.512,
    "gpd": 1.13
  },
  {
    "dia": 81,
    "pesoInicial": 102.16,
    "pesoFinal": 103.28,
    "cmd": 2.9,
    "consumoAcumulado": 166.412,
    "gpd": 1.12
  },
  {
    "dia": 82,
    "pesoInicial": 103.28,
    "pesoFinal": 104.37,
    "cmd": 2.95,
    "consumoAcumulado": 169.362,
    "gpd": 1.09
  },
  {
    "dia": 83,
    "pesoInicial": 104.37,
    "pesoFinal": 105.45,
    "cmd": 2.95,
    "consumoAcumulado": 172.312,
    "gpd": 1.08
  },
  {
    "dia": 84,
    "pesoInicial": 105.45,
    "pesoFinal": 106.52,
    "cmd": 2.95,
    "consumoAcumulado": 175.262,
    "gpd": 1.07
  },
  {
    "dia": 85,
    "pesoInicial": 106.52,
    "pesoFinal": 107.58,
    "cmd": 2.95,
    "consumoAcumulado": 178.212,
    "gpd": 1.06
  },
  {
    "dia": 86,
    "pesoInicial": 107.58,
    "pesoFinal": 108.65,
    "cmd": 2.95,
    "consumoAcumulado": 181.162,
    "gpd": 1.07
  },
  {
    "dia": 87,
    "pesoInicial": 108.65,
    "pesoFinal": 109.72,
    "cmd": 2.95,
    "consumoAcumulado": 184.112,
    "gpd": 1.07
  },
  {
    "dia": 88,
    "pesoInicial": 109.72,
    "pesoFinal": 110.79,
    "cmd": 2.95,
    "consumoAcumulado": 187.062,
    "gpd": 1.07
  },
  {
    "dia": 89,
    "pesoInicial": 110.79,
    "pesoFinal": 111.86,
    "cmd": 2.95,
    "consumoAcumulado": 190.012,
    "gpd": 1.07
  },
  {
    "dia": 90,
    "pesoInicial": 111.86,
    "pesoFinal": 112.93,
    "cmd": 2.95,
    "consumoAcumulado": 192.962,
    "gpd": 1.07
  },
  {
    "dia": 91,
    "pesoInicial": 112.93,
    "pesoFinal": 114,
    "cmd": 2.95,
    "consumoAcumulado": 195.912,
    "gpd": 1.07
  },
  {
    "dia": 92,
    "pesoInicial": 114,
    "pesoFinal": 115.06,
    "cmd": 2.95,
    "consumoAcumulado": 198.862,
    "gpd": 1.06
  },
  {
    "dia": 93,
    "pesoInicial": 115.06,
    "pesoFinal": 116.13,
    "cmd": 2.95,
    "consumoAcumulado": 201.812,
    "gpd": 1.07
  },
  {
    "dia": 94,
    "pesoInicial": 116.13,
    "pesoFinal": 117.19,
    "cmd": 2.95,
    "consumoAcumulado": 204.762,
    "gpd": 1.06
  },
  {
    "dia": 95,
    "pesoInicial": 117.19,
    "pesoFinal": 118.25,
    "cmd": 2.95,
    "consumoAcumulado": 207.712,
    "gpd": 1.06
  },
  {
    "dia": 96,
    "pesoInicial": 118.25,
    "pesoFinal": 119.31,
    "cmd": 2.95,
    "consumoAcumulado": 210.662,
    "gpd": 1.06
  }
];
