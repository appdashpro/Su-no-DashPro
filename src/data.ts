import { defaultBtzProgramaAlimentar, defaultMetasBtz, growthCurveBtz } from './btzData';
export { defaultBtzProgramaAlimentar, defaultMetasBtz, growthCurveBtz };
import { defaultBugioProgramaAlimentar, defaultMetasBugio, growthCurveBugio } from './bugioData';
export { defaultBugioProgramaAlimentar, defaultMetasBugio, growthCurveBugio };
import { GrowthCurvePoint, Integrado, Visit } from './types';
import { pdfData } from './pdf-data';


export interface CurveVersion {
  version: string;
  effectiveDate: string;
  curve: GrowthCurvePoint[];
  metas: {
    metaAlojamento: number;
    metaCrescimento1: number;
    metaCrescimento2: number;
    metaCrescimento3: number;
    metaTerminacao1: number;
    metaTerminacao2: number;
    metaAcumulada: number;
  }
}

const growthCurveV1: GrowthCurvePoint[] = [
  {
    "dia": 1,
    "pesoInicial": 20,
    "pesoFinal": 20.68,
    "cmd": 1.089,
    "consumoAcumulado": 1.089,
    "gpd": 0.68
  },
  {
    "dia": 2,
    "pesoInicial": 20.68,
    "pesoFinal": 21.37,
    "cmd": 1.116,
    "consumoAcumulado": 2.205,
    "gpd": 0.69
  },
  {
    "dia": 3,
    "pesoInicial": 21.37,
    "pesoFinal": 22.08,
    "cmd": 1.143,
    "consumoAcumulado": 3.347,
    "gpd": 0.71
  },
  {
    "dia": 4,
    "pesoInicial": 22.08,
    "pesoFinal": 22.79,
    "cmd": 1.169,
    "consumoAcumulado": 4.516,
    "gpd": 0.71
  },
  {
    "dia": 5,
    "pesoInicial": 22.79,
    "pesoFinal": 23.52,
    "cmd": 1.196,
    "consumoAcumulado": 5.712,
    "gpd": 0.73
  },
  {
    "dia": 6,
    "pesoInicial": 23.52,
    "pesoFinal": 24.27,
    "cmd": 1.222,
    "consumoAcumulado": 6.935,
    "gpd": 0.75
  },
  {
    "dia": 7,
    "pesoInicial": 24.27,
    "pesoFinal": 25.03,
    "cmd": 1.249,
    "consumoAcumulado": 8.183,
    "gpd": 0.76
  },
  {
    "dia": 8,
    "pesoInicial": 25.03,
    "pesoFinal": 25.8,
    "cmd": 1.275,
    "consumoAcumulado": 9.458,
    "gpd": 0.77
  },
  {
    "dia": 9,
    "pesoInicial": 25.8,
    "pesoFinal": 26.58,
    "cmd": 1.301,
    "consumoAcumulado": 10.759,
    "gpd": 0.78
  },
  {
    "dia": 10,
    "pesoInicial": 26.58,
    "pesoFinal": 27.38,
    "cmd": 1.327,
    "consumoAcumulado": 12.087,
    "gpd": 0.8
  },
  {
    "dia": 11,
    "pesoInicial": 27.38,
    "pesoFinal": 28.19,
    "cmd": 1.353,
    "consumoAcumulado": 13.44,
    "gpd": 0.81
  },
  {
    "dia": 12,
    "pesoInicial": 28.19,
    "pesoFinal": 29.01,
    "cmd": 1.379,
    "consumoAcumulado": 14.819,
    "gpd": 0.82
  },
  {
    "dia": 13,
    "pesoInicial": 29.01,
    "pesoFinal": 29.85,
    "cmd": 1.405,
    "consumoAcumulado": 16.224,
    "gpd": 0.84
  },
  {
    "dia": 14,
    "pesoInicial": 29.85,
    "pesoFinal": 30.7,
    "cmd": 1.431,
    "consumoAcumulado": 17.654,
    "gpd": 0.85
  },
  {
    "dia": 15,
    "pesoInicial": 30.7,
    "pesoFinal": 31.57,
    "cmd": 1.498,
    "consumoAcumulado": 19.153,
    "gpd": 0.87
  },
  {
    "dia": 16,
    "pesoInicial": 31.57,
    "pesoFinal": 32.44,
    "cmd": 1.525,
    "consumoAcumulado": 20.677,
    "gpd": 0.87
  },
  {
    "dia": 17,
    "pesoInicial": 32.44,
    "pesoFinal": 33.33,
    "cmd": 1.551,
    "consumoAcumulado": 22.228,
    "gpd": 0.89
  },
  {
    "dia": 18,
    "pesoInicial": 33.33,
    "pesoFinal": 34.22,
    "cmd": 1.576,
    "consumoAcumulado": 23.804,
    "gpd": 0.89
  },
  {
    "dia": 19,
    "pesoInicial": 34.22,
    "pesoFinal": 35.12,
    "cmd": 1.602,
    "consumoAcumulado": 25.406,
    "gpd": 0.9
  },
  {
    "dia": 20,
    "pesoInicial": 35.12,
    "pesoFinal": 36.02,
    "cmd": 1.627,
    "consumoAcumulado": 27.034,
    "gpd": 0.9
  },
  {
    "dia": 21,
    "pesoInicial": 36.02,
    "pesoFinal": 36.94,
    "cmd": 1.652,
    "consumoAcumulado": 28.686,
    "gpd": 0.92
  },
  {
    "dia": 22,
    "pesoInicial": 36.94,
    "pesoFinal": 37.86,
    "cmd": 1.677,
    "consumoAcumulado": 30.363,
    "gpd": 0.92
  },
  {
    "dia": 23,
    "pesoInicial": 37.86,
    "pesoFinal": 38.79,
    "cmd": 1.702,
    "consumoAcumulado": 32.064,
    "gpd": 0.93
  },
  {
    "dia": 24,
    "pesoInicial": 38.79,
    "pesoFinal": 39.73,
    "cmd": 1.726,
    "consumoAcumulado": 33.79,
    "gpd": 0.94
  },
  {
    "dia": 25,
    "pesoInicial": 39.73,
    "pesoFinal": 40.67,
    "cmd": 1.75,
    "consumoAcumulado": 35.54,
    "gpd": 0.94
  },
  {
    "dia": 26,
    "pesoInicial": 40.67,
    "pesoFinal": 41.62,
    "cmd": 1.774,
    "consumoAcumulado": 37.314,
    "gpd": 0.95
  },
  {
    "dia": 27,
    "pesoInicial": 41.62,
    "pesoFinal": 42.59,
    "cmd": 1.797,
    "consumoAcumulado": 39.111,
    "gpd": 0.97
  },
  {
    "dia": 28,
    "pesoInicial": 42.59,
    "pesoFinal": 43.55,
    "cmd": 1.821,
    "consumoAcumulado": 40.932,
    "gpd": 0.96
  },
  {
    "dia": 29,
    "pesoInicial": 43.55,
    "pesoFinal": 44.53,
    "cmd": 1.844,
    "consumoAcumulado": 42.776,
    "gpd": 0.98
  },
  {
    "dia": 30,
    "pesoInicial": 44.53,
    "pesoFinal": 45.51,
    "cmd": 1.867,
    "consumoAcumulado": 44.642,
    "gpd": 0.98
  },
  {
    "dia": 31,
    "pesoInicial": 45.51,
    "pesoFinal": 46.5,
    "cmd": 1.889,
    "consumoAcumulado": 46.531,
    "gpd": 0.99
  },
  {
    "dia": 32,
    "pesoInicial": 46.5,
    "pesoFinal": 47.5,
    "cmd": 1.912,
    "consumoAcumulado": 48.443,
    "gpd": 1
  },
  {
    "dia": 33,
    "pesoInicial": 47.5,
    "pesoFinal": 48.5,
    "cmd": 1.974,
    "consumoAcumulado": 50.418,
    "gpd": 1
  },
  {
    "dia": 34,
    "pesoInicial": 48.5,
    "pesoFinal": 49.51,
    "cmd": 1.997,
    "consumoAcumulado": 52.414,
    "gpd": 1.01
  },
  {
    "dia": 35,
    "pesoInicial": 49.51,
    "pesoFinal": 50.52,
    "cmd": 2.019,
    "consumoAcumulado": 54.433,
    "gpd": 1.01
  },
  {
    "dia": 36,
    "pesoInicial": 50.52,
    "pesoFinal": 51.52,
    "cmd": 2.041,
    "consumoAcumulado": 56.474,
    "gpd": 1
  },
  {
    "dia": 37,
    "pesoInicial": 51.52,
    "pesoFinal": 52.54,
    "cmd": 2.062,
    "consumoAcumulado": 58.535,
    "gpd": 1.02
  },
  {
    "dia": 38,
    "pesoInicial": 52.54,
    "pesoFinal": 53.56,
    "cmd": 2.083,
    "consumoAcumulado": 60.618,
    "gpd": 1.02
  },
  {
    "dia": 39,
    "pesoInicial": 53.56,
    "pesoFinal": 54.58,
    "cmd": 2.104,
    "consumoAcumulado": 62.722,
    "gpd": 1.02
  },
  {
    "dia": 40,
    "pesoInicial": 54.58,
    "pesoFinal": 55.61,
    "cmd": 2.124,
    "consumoAcumulado": 64.847,
    "gpd": 1.03
  },
  {
    "dia": 41,
    "pesoInicial": 55.61,
    "pesoFinal": 56.65,
    "cmd": 2.145,
    "consumoAcumulado": 66.992,
    "gpd": 1.04
  },
  {
    "dia": 42,
    "pesoInicial": 56.65,
    "pesoFinal": 57.7,
    "cmd": 2.165,
    "consumoAcumulado": 69.157,
    "gpd": 1.05
  },
  {
    "dia": 43,
    "pesoInicial": 57.7,
    "pesoFinal": 58.75,
    "cmd": 2.185,
    "consumoAcumulado": 71.342,
    "gpd": 1.05
  },
  {
    "dia": 44,
    "pesoInicial": 58.75,
    "pesoFinal": 59.8,
    "cmd": 2.205,
    "consumoAcumulado": 73.546,
    "gpd": 1.05
  },
  {
    "dia": 45,
    "pesoInicial": 59.8,
    "pesoFinal": 60.86,
    "cmd": 2.224,
    "consumoAcumulado": 75.77,
    "gpd": 1.06
  },
  {
    "dia": 46,
    "pesoInicial": 60.86,
    "pesoFinal": 61.93,
    "cmd": 2.243,
    "consumoAcumulado": 78.014,
    "gpd": 1.07
  },
  {
    "dia": 47,
    "pesoInicial": 61.93,
    "pesoFinal": 62.99,
    "cmd": 2.3,
    "consumoAcumulado": 80.314,
    "gpd": 1.06
  },
  {
    "dia": 48,
    "pesoInicial": 62.99,
    "pesoFinal": 64.06,
    "cmd": 2.319,
    "consumoAcumulado": 82.633,
    "gpd": 1.07
  },
  {
    "dia": 49,
    "pesoInicial": 64.06,
    "pesoFinal": 65.13,
    "cmd": 2.338,
    "consumoAcumulado": 84.971,
    "gpd": 1.07
  },
  {
    "dia": 50,
    "pesoInicial": 65.13,
    "pesoFinal": 66.2,
    "cmd": 2.356,
    "consumoAcumulado": 87.327,
    "gpd": 1.07
  },
  {
    "dia": 51,
    "pesoInicial": 66.2,
    "pesoFinal": 67.28,
    "cmd": 2.374,
    "consumoAcumulado": 89.701,
    "gpd": 1.08
  },
  {
    "dia": 52,
    "pesoInicial": 67.28,
    "pesoFinal": 68.36,
    "cmd": 2.392,
    "consumoAcumulado": 92.092,
    "gpd": 1.08
  },
  {
    "dia": 53,
    "pesoInicial": 68.36,
    "pesoFinal": 69.45,
    "cmd": 2.409,
    "consumoAcumulado": 94.502,
    "gpd": 1.09
  },
  {
    "dia": 54,
    "pesoInicial": 69.45,
    "pesoFinal": 70.53,
    "cmd": 2.426,
    "consumoAcumulado": 96.928,
    "gpd": 1.08
  },
  {
    "dia": 55,
    "pesoInicial": 70.53,
    "pesoFinal": 71.62,
    "cmd": 2.443,
    "consumoAcumulado": 99.371,
    "gpd": 1.09
  },
  {
    "dia": 56,
    "pesoInicial": 71.62,
    "pesoFinal": 72.71,
    "cmd": 2.46,
    "consumoAcumulado": 101.831,
    "gpd": 1.09
  },
  {
    "dia": 57,
    "pesoInicial": 72.71,
    "pesoFinal": 73.81,
    "cmd": 2.476,
    "consumoAcumulado": 104.308,
    "gpd": 1.1
  },
  {
    "dia": 58,
    "pesoInicial": 73.81,
    "pesoFinal": 74.9,
    "cmd": 2.492,
    "consumoAcumulado": 106.8,
    "gpd": 1.09
  },
  {
    "dia": 59,
    "pesoInicial": 74.9,
    "pesoFinal": 75.99,
    "cmd": 2.508,
    "consumoAcumulado": 109.308,
    "gpd": 1.09
  },
  {
    "dia": 60,
    "pesoInicial": 75.99,
    "pesoFinal": 77.09,
    "cmd": 2.524,
    "consumoAcumulado": 111.832,
    "gpd": 1.1
  },
  {
    "dia": 61,
    "pesoInicial": 77.09,
    "pesoFinal": 78.18,
    "cmd": 2.539,
    "consumoAcumulado": 114.37,
    "gpd": 1.09
  },
  {
    "dia": 62,
    "pesoInicial": 78.18,
    "pesoFinal": 79.28,
    "cmd": 2.553,
    "consumoAcumulado": 116.924,
    "gpd": 1.1
  },
  {
    "dia": 63,
    "pesoInicial": 79.28,
    "pesoFinal": 80.37,
    "cmd": 2.568,
    "consumoAcumulado": 119.492,
    "gpd": 1.09
  },
  {
    "dia": 64,
    "pesoInicial": 80.37,
    "pesoFinal": 81.46,
    "cmd": 2.582,
    "consumoAcumulado": 122.074,
    "gpd": 1.09
  },
  {
    "dia": 65,
    "pesoInicial": 81.46,
    "pesoFinal": 82.81,
    "cmd": 2.68,
    "consumoAcumulado": 124.754,
    "gpd": 1.35
  },
  {
    "dia": 66,
    "pesoInicial": 82.81,
    "pesoFinal": 84.15,
    "cmd": 2.698,
    "consumoAcumulado": 127.452,
    "gpd": 1.34
  },
  {
    "dia": 67,
    "pesoInicial": 84.15,
    "pesoFinal": 85.49,
    "cmd": 2.714,
    "consumoAcumulado": 130.166,
    "gpd": 1.34
  },
  {
    "dia": 68,
    "pesoInicial": 85.49,
    "pesoFinal": 86.81,
    "cmd": 2.731,
    "consumoAcumulado": 132.897,
    "gpd": 1.32
  },
  {
    "dia": 69,
    "pesoInicial": 86.81,
    "pesoFinal": 88.12,
    "cmd": 2.746,
    "consumoAcumulado": 135.643,
    "gpd": 1.31
  },
  {
    "dia": 70,
    "pesoInicial": 88.12,
    "pesoFinal": 89.43,
    "cmd": 2.75,
    "consumoAcumulado": 138.393,
    "gpd": 1.31
  },
  {
    "dia": 71,
    "pesoInicial": 89.43,
    "pesoFinal": 90.72,
    "cmd": 2.75,
    "consumoAcumulado": 141.143,
    "gpd": 1.29
  },
  {
    "dia": 72,
    "pesoInicial": 90.72,
    "pesoFinal": 92,
    "cmd": 2.75,
    "consumoAcumulado": 143.893,
    "gpd": 1.28
  },
  {
    "dia": 73,
    "pesoInicial": 92,
    "pesoFinal": 93.26,
    "cmd": 2.75,
    "consumoAcumulado": 146.643,
    "gpd": 1.26
  },
  {
    "dia": 74,
    "pesoInicial": 93.26,
    "pesoFinal": 94.52,
    "cmd": 2.75,
    "consumoAcumulado": 149.393,
    "gpd": 1.26
  },
  {
    "dia": 75,
    "pesoInicial": 94.52,
    "pesoFinal": 95.74,
    "cmd": 2.8,
    "consumoAcumulado": 152.193,
    "gpd": 1.22
  },
  {
    "dia": 76,
    "pesoInicial": 95.74,
    "pesoFinal": 96.94,
    "cmd": 2.8,
    "consumoAcumulado": 154.993,
    "gpd": 1.2
  },
  {
    "dia": 77,
    "pesoInicial": 96.94,
    "pesoFinal": 98.13,
    "cmd": 2.8,
    "consumoAcumulado": 157.793,
    "gpd": 1.19
  },
  {
    "dia": 78,
    "pesoInicial": 98.13,
    "pesoFinal": 99.3,
    "cmd": 2.8,
    "consumoAcumulado": 160.593,
    "gpd": 1.17
  },
  {
    "dia": 79,
    "pesoInicial": 99.3,
    "pesoFinal": 100.47,
    "cmd": 2.8,
    "consumoAcumulado": 163.393,
    "gpd": 1.17
  },
  {
    "dia": 80,
    "pesoInicial": 100.47,
    "pesoFinal": 101.62,
    "cmd": 2.8,
    "consumoAcumulado": 166.193,
    "gpd": 1.15
  },
  {
    "dia": 81,
    "pesoInicial": 101.62,
    "pesoFinal": 102.75,
    "cmd": 2.8,
    "consumoAcumulado": 168.993,
    "gpd": 1.13
  },
  {
    "dia": 82,
    "pesoInicial": 102.75,
    "pesoFinal": 103.88,
    "cmd": 2.8,
    "consumoAcumulado": 171.793,
    "gpd": 1.13
  },
  {
    "dia": 83,
    "pesoInicial": 103.88,
    "pesoFinal": 104.99,
    "cmd": 2.8,
    "consumoAcumulado": 174.593,
    "gpd": 1.11
  },
  {
    "dia": 84,
    "pesoInicial": 104.99,
    "pesoFinal": 106.09,
    "cmd": 2.8,
    "consumoAcumulado": 177.393,
    "gpd": 1.1
  },
  {
    "dia": 85,
    "pesoInicial": 106.09,
    "pesoFinal": 107.18,
    "cmd": 2.8,
    "consumoAcumulado": 180.193,
    "gpd": 1.09
  },
  {
    "dia": 86,
    "pesoInicial": 107.18,
    "pesoFinal": 108.23,
    "cmd": 2.85,
    "consumoAcumulado": 183.043,
    "gpd": 1.05
  },
  {
    "dia": 87,
    "pesoInicial": 108.23,
    "pesoFinal": 109.27,
    "cmd": 2.85,
    "consumoAcumulado": 185.893,
    "gpd": 1.04
  },
  {
    "dia": 88,
    "pesoInicial": 109.27,
    "pesoFinal": 110.28,
    "cmd": 2.85,
    "consumoAcumulado": 188.743,
    "gpd": 1.01
  },
  {
    "dia": 89,
    "pesoInicial": 110.28,
    "pesoFinal": 111.3,
    "cmd": 2.85,
    "consumoAcumulado": 191.593,
    "gpd": 1.02
  },
  {
    "dia": 90,
    "pesoInicial": 111.3,
    "pesoFinal": 112.32,
    "cmd": 2.85,
    "consumoAcumulado": 194.443,
    "gpd": 1.02
  },
  {
    "dia": 91,
    "pesoInicial": 112.32,
    "pesoFinal": 113.34,
    "cmd": 2.85,
    "consumoAcumulado": 197.293,
    "gpd": 1.02
  },
  {
    "dia": 92,
    "pesoInicial": 113.34,
    "pesoFinal": 114.35,
    "cmd": 2.85,
    "consumoAcumulado": 200.143,
    "gpd": 1.01
  },
  {
    "dia": 93,
    "pesoInicial": 114.35,
    "pesoFinal": 115.37,
    "cmd": 2.85,
    "consumoAcumulado": 202.993,
    "gpd": 1.02
  },
  {
    "dia": 94,
    "pesoInicial": 115.37,
    "pesoFinal": 116.39,
    "cmd": 2.85,
    "consumoAcumulado": 205.843,
    "gpd": 1.02
  },
  {
    "dia": 95,
    "pesoInicial": 116.39,
    "pesoFinal": 117.4,
    "cmd": 2.85,
    "consumoAcumulado": 208.693,
    "gpd": 1.01
  },
  {
    "dia": 96,
    "pesoInicial": 117.4,
    "pesoFinal": 118.42,
    "cmd": 2.85,
    "consumoAcumulado": 211.543,
    "gpd": 1.02
  },
  {
    "dia": 97,
    "pesoInicial": 118.42,
    "pesoFinal": 119.43,
    "cmd": 2.9,
    "consumoAcumulado": 214.443,
    "gpd": 1.01
  },
  {
    "dia": 98,
    "pesoInicial": 119.43,
    "pesoFinal": 120.44,
    "cmd": 2.9,
    "consumoAcumulado": 217.343,
    "gpd": 1.01
  }
];


const defaultMetasV1 = {
  "metaAlojamento": 17.65,
  "metaCrescimento1": 30.79,
  "metaCrescimento2": 29.57,
  "metaCrescimento3": 44.06,
  "metaTerminacao1": 27.52,
  "metaTerminacao2": 63.52,
  "metaAcumulada": 213.11
};


const growthCurveV2: GrowthCurvePoint[] = [
  {
    "dia": 1,
    "pesoInicial": 22.3,
    "pesoFinal": 23,
    "cmd": 1.08,
    "consumoAcumulado": 1.08,
    "gpd": 0.7
  },
  {
    "dia": 2,
    "pesoInicial": 23,
    "pesoFinal": 23.72,
    "cmd": 1.093,
    "consumoAcumulado": 2.17,
    "gpd": 0.719
  },
  {
    "dia": 3,
    "pesoInicial": 23.72,
    "pesoFinal": 24.45,
    "cmd": 1.116,
    "consumoAcumulado": 3.29,
    "gpd": 0.731
  },
  {
    "dia": 4,
    "pesoInicial": 24.45,
    "pesoFinal": 25.19,
    "cmd": 1.14,
    "consumoAcumulado": 4.43,
    "gpd": 0.743
  },
  {
    "dia": 5,
    "pesoInicial": 25.19,
    "pesoFinal": 25.95,
    "cmd": 1.163,
    "consumoAcumulado": 5.59,
    "gpd": 0.755
  },
  {
    "dia": 6,
    "pesoInicial": 25.95,
    "pesoFinal": 26.71,
    "cmd": 1.186,
    "consumoAcumulado": 6.78,
    "gpd": 0.767
  },
  {
    "dia": 7,
    "pesoInicial": 26.71,
    "pesoFinal": 27.49,
    "cmd": 1.209,
    "consumoAcumulado": 7.99,
    "gpd": 0.779
  },
  {
    "dia": 8,
    "pesoInicial": 27.49,
    "pesoFinal": 28.29,
    "cmd": 1.232,
    "consumoAcumulado": 9.22,
    "gpd": 0.792
  },
  {
    "dia": 9,
    "pesoInicial": 28.29,
    "pesoFinal": 29.09,
    "cmd": 1.255,
    "consumoAcumulado": 10.48,
    "gpd": 0.804
  },
  {
    "dia": 10,
    "pesoInicial": 29.09,
    "pesoFinal": 29.91,
    "cmd": 1.278,
    "consumoAcumulado": 11.75,
    "gpd": 0.816
  },
  {
    "dia": 11,
    "pesoInicial": 29.91,
    "pesoFinal": 30.73,
    "cmd": 1.301,
    "consumoAcumulado": 13.06,
    "gpd": 0.827
  },
  {
    "dia": 12,
    "pesoInicial": 30.73,
    "pesoFinal": 31.57,
    "cmd": 1.323,
    "consumoAcumulado": 14.38,
    "gpd": 0.835
  },
  {
    "dia": 13,
    "pesoInicial": 31.57,
    "pesoFinal": 32.41,
    "cmd": 1.346,
    "consumoAcumulado": 15.72,
    "gpd": 0.842
  },
  {
    "dia": 14,
    "pesoInicial": 32.41,
    "pesoFinal": 33.26,
    "cmd": 1.368,
    "consumoAcumulado": 17.09,
    "gpd": 0.849
  },
  {
    "dia": 15,
    "pesoInicial": 33.26,
    "pesoFinal": 34.11,
    "cmd": 1.39,
    "consumoAcumulado": 18.48,
    "gpd": 0.856
  },
  {
    "dia": 16,
    "pesoInicial": 34.11,
    "pesoFinal": 35.04,
    "cmd": 1.575,
    "consumoAcumulado": 20.06,
    "gpd": 0.93
  },
  {
    "dia": 17,
    "pesoInicial": 35.04,
    "pesoFinal": 35.98,
    "cmd": 1.601,
    "consumoAcumulado": 21.66,
    "gpd": 0.938
  },
  {
    "dia": 18,
    "pesoInicial": 35.98,
    "pesoFinal": 36.93,
    "cmd": 1.626,
    "consumoAcumulado": 23.28,
    "gpd": 0.946
  },
  {
    "dia": 19,
    "pesoInicial": 36.93,
    "pesoFinal": 37.88,
    "cmd": 1.652,
    "consumoAcumulado": 24.94,
    "gpd": 0.954
  },
  {
    "dia": 20,
    "pesoInicial": 37.88,
    "pesoFinal": 38.85,
    "cmd": 1.677,
    "consumoAcumulado": 26.61,
    "gpd": 0.962
  },
  {
    "dia": 21,
    "pesoInicial": 38.85,
    "pesoFinal": 39.82,
    "cmd": 1.701,
    "consumoAcumulado": 28.31,
    "gpd": 0.971
  },
  {
    "dia": 22,
    "pesoInicial": 39.82,
    "pesoFinal": 40.79,
    "cmd": 1.726,
    "consumoAcumulado": 30.04,
    "gpd": 0.979
  },
  {
    "dia": 23,
    "pesoInicial": 40.79,
    "pesoFinal": 41.78,
    "cmd": 1.75,
    "consumoAcumulado": 31.79,
    "gpd": 0.986
  },
  {
    "dia": 24,
    "pesoInicial": 41.78,
    "pesoFinal": 42.78,
    "cmd": 1.774,
    "consumoAcumulado": 33.56,
    "gpd": 0.994
  },
  {
    "dia": 25,
    "pesoInicial": 42.78,
    "pesoFinal": 43.78,
    "cmd": 1.798,
    "consumoAcumulado": 35.36,
    "gpd": 1.002
  },
  {
    "dia": 26,
    "pesoInicial": 43.78,
    "pesoFinal": 44.79,
    "cmd": 1.821,
    "consumoAcumulado": 37.18,
    "gpd": 1.01
  },
  {
    "dia": 27,
    "pesoInicial": 44.79,
    "pesoFinal": 45.81,
    "cmd": 1.845,
    "consumoAcumulado": 39.03,
    "gpd": 1.018
  },
  {
    "dia": 28,
    "pesoInicial": 45.81,
    "pesoFinal": 46.83,
    "cmd": 1.868,
    "consumoAcumulado": 40.9,
    "gpd": 1.026
  },
  {
    "dia": 29,
    "pesoInicial": 46.83,
    "pesoFinal": 47.87,
    "cmd": 1.89,
    "consumoAcumulado": 42.79,
    "gpd": 1.034
  },
  {
    "dia": 30,
    "pesoInicial": 47.87,
    "pesoFinal": 48.91,
    "cmd": 1.913,
    "consumoAcumulado": 44.7,
    "gpd": 1.041
  },
  {
    "dia": 31,
    "pesoInicial": 48.91,
    "pesoFinal": 49.96,
    "cmd": 1.935,
    "consumoAcumulado": 46.63,
    "gpd": 1.049
  },
  {
    "dia": 32,
    "pesoInicial": 49.96,
    "pesoFinal": 51,
    "cmd": 1.957,
    "consumoAcumulado": 48.59,
    "gpd": 1.044
  },
  {
    "dia": 33,
    "pesoInicial": 51,
    "pesoFinal": 52.05,
    "cmd": 1.979,
    "consumoAcumulado": 50.57,
    "gpd": 1.051
  },
  {
    "dia": 34,
    "pesoInicial": 52.05,
    "pesoFinal": 53.11,
    "cmd": 2,
    "consumoAcumulado": 52.57,
    "gpd": 1.058
  },
  {
    "dia": 35,
    "pesoInicial": 53.11,
    "pesoFinal": 54.22,
    "cmd": 2.181,
    "consumoAcumulado": 54.75,
    "gpd": 1.108
  },
  {
    "dia": 36,
    "pesoInicial": 54.22,
    "pesoFinal": 55.33,
    "cmd": 2.204,
    "consumoAcumulado": 56.96,
    "gpd": 1.115
  },
  {
    "dia": 37,
    "pesoInicial": 55.33,
    "pesoFinal": 56.45,
    "cmd": 2.227,
    "consumoAcumulado": 59.18,
    "gpd": 1.123
  },
  {
    "dia": 38,
    "pesoInicial": 56.45,
    "pesoFinal": 57.58,
    "cmd": 2.25,
    "consumoAcumulado": 61.43,
    "gpd": 1.13
  },
  {
    "dia": 39,
    "pesoInicial": 57.58,
    "pesoFinal": 58.72,
    "cmd": 2.272,
    "consumoAcumulado": 63.7,
    "gpd": 1.137
  },
  {
    "dia": 40,
    "pesoInicial": 58.72,
    "pesoFinal": 59.86,
    "cmd": 2.294,
    "consumoAcumulado": 66,
    "gpd": 1.143
  },
  {
    "dia": 41,
    "pesoInicial": 59.86,
    "pesoFinal": 61.01,
    "cmd": 2.316,
    "consumoAcumulado": 68.32,
    "gpd": 1.15
  },
  {
    "dia": 42,
    "pesoInicial": 61.01,
    "pesoFinal": 62.17,
    "cmd": 2.338,
    "consumoAcumulado": 70.65,
    "gpd": 1.156
  },
  {
    "dia": 43,
    "pesoInicial": 62.17,
    "pesoFinal": 63.33,
    "cmd": 2.359,
    "consumoAcumulado": 73.01,
    "gpd": 1.162
  },
  {
    "dia": 44,
    "pesoInicial": 63.33,
    "pesoFinal": 64.5,
    "cmd": 2.38,
    "consumoAcumulado": 75.39,
    "gpd": 1.167
  },
  {
    "dia": 45,
    "pesoInicial": 64.5,
    "pesoFinal": 65.67,
    "cmd": 2.401,
    "consumoAcumulado": 77.79,
    "gpd": 1.172
  },
  {
    "dia": 46,
    "pesoInicial": 65.67,
    "pesoFinal": 66.85,
    "cmd": 2.421,
    "consumoAcumulado": 80.22,
    "gpd": 1.177
  },
  {
    "dia": 47,
    "pesoInicial": 66.85,
    "pesoFinal": 68.03,
    "cmd": 2.441,
    "consumoAcumulado": 82.66,
    "gpd": 1.182
  },
  {
    "dia": 48,
    "pesoInicial": 68.03,
    "pesoFinal": 69.22,
    "cmd": 2.461,
    "consumoAcumulado": 85.12,
    "gpd": 1.186
  },
  {
    "dia": 49,
    "pesoInicial": 69.22,
    "pesoFinal": 70.4,
    "cmd": 2.524,
    "consumoAcumulado": 87.64,
    "gpd": 1.184
  },
  {
    "dia": 50,
    "pesoInicial": 70.4,
    "pesoFinal": 71.59,
    "cmd": 2.543,
    "consumoAcumulado": 90.18,
    "gpd": 1.187
  },
  {
    "dia": 51,
    "pesoInicial": 71.59,
    "pesoFinal": 72.78,
    "cmd": 2.562,
    "consumoAcumulado": 92.75,
    "gpd": 1.19
  },
  {
    "dia": 52,
    "pesoInicial": 72.78,
    "pesoFinal": 73.97,
    "cmd": 2.581,
    "consumoAcumulado": 95.33,
    "gpd": 1.193
  },
  {
    "dia": 53,
    "pesoInicial": 73.97,
    "pesoFinal": 75.16,
    "cmd": 2.599,
    "consumoAcumulado": 97.93,
    "gpd": 1.195
  },
  {
    "dia": 54,
    "pesoInicial": 75.16,
    "pesoFinal": 76.36,
    "cmd": 2.617,
    "consumoAcumulado": 100.54,
    "gpd": 1.196
  },
  {
    "dia": 55,
    "pesoInicial": 76.36,
    "pesoFinal": 77.56,
    "cmd": 2.634,
    "consumoAcumulado": 103.18,
    "gpd": 1.198
  },
  {
    "dia": 56,
    "pesoInicial": 77.56,
    "pesoFinal": 78.76,
    "cmd": 2.651,
    "consumoAcumulado": 105.83,
    "gpd": 1.199
  },
  {
    "dia": 57,
    "pesoInicial": 78.76,
    "pesoFinal": 79.96,
    "cmd": 2.668,
    "consumoAcumulado": 108.5,
    "gpd": 1.199
  },
  {
    "dia": 58,
    "pesoInicial": 79.96,
    "pesoFinal": 81.15,
    "cmd": 2.685,
    "consumoAcumulado": 111.18,
    "gpd": 1.199
  },
  {
    "dia": 59,
    "pesoInicial": 81.15,
    "pesoFinal": 82.35,
    "cmd": 2.701,
    "consumoAcumulado": 113.88,
    "gpd": 1.199
  },
  {
    "dia": 60,
    "pesoInicial": 82.35,
    "pesoFinal": 83.55,
    "cmd": 2.716,
    "consumoAcumulado": 116.6,
    "gpd": 1.198
  },
  {
    "dia": 61,
    "pesoInicial": 83.55,
    "pesoFinal": 84.75,
    "cmd": 2.731,
    "consumoAcumulado": 119.33,
    "gpd": 1.195
  },
  {
    "dia": 62,
    "pesoInicial": 84.75,
    "pesoFinal": 85.94,
    "cmd": 2.746,
    "consumoAcumulado": 122.08,
    "gpd": 1.19
  },
  {
    "dia": 63,
    "pesoInicial": 85.94,
    "pesoFinal": 87.12,
    "cmd": 2.761,
    "consumoAcumulado": 124.84,
    "gpd": 1.186
  },
  {
    "dia": 64,
    "pesoInicial": 87.12,
    "pesoFinal": 88.3,
    "cmd": 2.775,
    "consumoAcumulado": 127.61,
    "gpd": 1.18
  },
  {
    "dia": 65,
    "pesoInicial": 88.3,
    "pesoFinal": 89.48,
    "cmd": 2.788,
    "consumoAcumulado": 130.4,
    "gpd": 1.175
  },
  {
    "dia": 66,
    "pesoInicial": 89.48,
    "pesoFinal": 90.65,
    "cmd": 2.802,
    "consumoAcumulado": 133.2,
    "gpd": 1.169
  },
  {
    "dia": 67,
    "pesoInicial": 90.65,
    "pesoFinal": 91.81,
    "cmd": 2.814,
    "consumoAcumulado": 136.02,
    "gpd": 1.163
  },
  {
    "dia": 68,
    "pesoInicial": 91.81,
    "pesoFinal": 92.97,
    "cmd": 2.827,
    "consumoAcumulado": 138.84,
    "gpd": 1.156
  },
  {
    "dia": 69,
    "pesoInicial": 92.97,
    "pesoFinal": 94.12,
    "cmd": 2.839,
    "consumoAcumulado": 141.68,
    "gpd": 1.15
  },
  {
    "dia": 70,
    "pesoInicial": 94.12,
    "pesoFinal": 95.41,
    "cmd": 2.806,
    "consumoAcumulado": 144.49,
    "gpd": 1.296
  },
  {
    "dia": 71,
    "pesoInicial": 95.41,
    "pesoFinal": 96.7,
    "cmd": 2.819,
    "consumoAcumulado": 147.31,
    "gpd": 1.284
  },
  {
    "dia": 72,
    "pesoInicial": 96.7,
    "pesoFinal": 97.97,
    "cmd": 2.831,
    "consumoAcumulado": 150.14,
    "gpd": 1.272
  },
  {
    "dia": 73,
    "pesoInicial": 97.97,
    "pesoFinal": 99.23,
    "cmd": 2.843,
    "consumoAcumulado": 152.98,
    "gpd": 1.261
  },
  {
    "dia": 74,
    "pesoInicial": 99.23,
    "pesoFinal": 100.48,
    "cmd": 2.854,
    "consumoAcumulado": 155.84,
    "gpd": 1.249
  },
  {
    "dia": 75,
    "pesoInicial": 100.48,
    "pesoFinal": 101.72,
    "cmd": 2.864,
    "consumoAcumulado": 158.7,
    "gpd": 1.238
  },
  {
    "dia": 76,
    "pesoInicial": 101.72,
    "pesoFinal": 102.94,
    "cmd": 2.875,
    "consumoAcumulado": 161.57,
    "gpd": 1.227
  },
  {
    "dia": 77,
    "pesoInicial": 102.94,
    "pesoFinal": 104.16,
    "cmd": 2.884,
    "consumoAcumulado": 164.46,
    "gpd": 1.216
  },
  {
    "dia": 78,
    "pesoInicial": 104.16,
    "pesoFinal": 105.36,
    "cmd": 2.894,
    "consumoAcumulado": 167.35,
    "gpd": 1.205
  },
  {
    "dia": 79,
    "pesoInicial": 105.36,
    "pesoFinal": 106.56,
    "cmd": 2.903,
    "consumoAcumulado": 170.26,
    "gpd": 1.194
  },
  {
    "dia": 80,
    "pesoInicial": 106.56,
    "pesoFinal": 107.7,
    "cmd": 2.834,
    "consumoAcumulado": 173.09,
    "gpd": 1.14
  },
  {
    "dia": 81,
    "pesoInicial": 107.7,
    "pesoFinal": 108.83,
    "cmd": 2.841,
    "consumoAcumulado": 175.93,
    "gpd": 1.129
  },
  {
    "dia": 82,
    "pesoInicial": 108.83,
    "pesoFinal": 109.94,
    "cmd": 2.849,
    "consumoAcumulado": 178.78,
    "gpd": 1.118
  },
  {
    "dia": 83,
    "pesoInicial": 109.94,
    "pesoFinal": 111.06,
    "cmd": 2.871,
    "consumoAcumulado": 181.65,
    "gpd": 1.116
  },
  {
    "dia": 84,
    "pesoInicial": 111.06,
    "pesoFinal": 112.18,
    "cmd": 2.898,
    "consumoAcumulado": 184.55,
    "gpd": 1.117
  },
  {
    "dia": 85,
    "pesoInicial": 112.18,
    "pesoFinal": 113.3,
    "cmd": 2.925,
    "consumoAcumulado": 187.47,
    "gpd": 1.119
  },
  {
    "dia": 86,
    "pesoInicial": 113.3,
    "pesoFinal": 114.4,
    "cmd": 2.952,
    "consumoAcumulado": 190.43,
    "gpd": 1.105
  },
  {
    "dia": 87,
    "pesoInicial": 114.4,
    "pesoFinal": 115.49,
    "cmd": 2.98,
    "consumoAcumulado": 193.41,
    "gpd": 1.091
  },
  {
    "dia": 88,
    "pesoInicial": 115.49,
    "pesoFinal": 116.57,
    "cmd": 2.98,
    "consumoAcumulado": 196.39,
    "gpd": 1.076
  },
  {
    "dia": 89,
    "pesoInicial": 116.57,
    "pesoFinal": 117.63,
    "cmd": 2.98,
    "consumoAcumulado": 199.37,
    "gpd": 1.061
  },
  {
    "dia": 90,
    "pesoInicial": 117.63,
    "pesoFinal": 118.68,
    "cmd": 2.98,
    "consumoAcumulado": 202.35,
    "gpd": 1.046
  },
  {
    "dia": 91,
    "pesoInicial": 118.68,
    "pesoFinal": 119.71,
    "cmd": 2.98,
    "consumoAcumulado": 205.33,
    "gpd": 1.031
  },
  {
    "dia": 92,
    "pesoInicial": 119.71,
    "pesoFinal": 120.72,
    "cmd": 2.98,
    "consumoAcumulado": 208.31,
    "gpd": 1.016
  },
  {
    "dia": 93,
    "pesoInicial": 120.72,
    "pesoFinal": 121.72,
    "cmd": 2.98,
    "consumoAcumulado": 211.29,
    "gpd": 1
  },
  {
    "dia": 94,
    "pesoInicial": 121.72,
    "pesoFinal": 122.71,
    "cmd": 2.98,
    "consumoAcumulado": 214.27,
    "gpd": 0.985
  },
  {
    "dia": 95,
    "pesoInicial": 122.71,
    "pesoFinal": 123.69,
    "cmd": 2.98,
    "consumoAcumulado": 217.25,
    "gpd": 0.979
  },
  {
    "dia": 96,
    "pesoInicial": 123.69,
    "pesoFinal": 124.66,
    "cmd": 2.98,
    "consumoAcumulado": 220.23,
    "gpd": 0.973
  },
  {
    "dia": 97,
    "pesoInicial": 124.66,
    "pesoFinal": 125.63,
    "cmd": 2.98,
    "consumoAcumulado": 223.21,
    "gpd": 0.966
  },
  {
    "dia": 98,
    "pesoInicial": 125.63,
    "pesoFinal": 126.59,
    "cmd": 2.98,
    "consumoAcumulado": 226.19,
    "gpd": 0.959
  },
  {
    "dia": 99,
    "pesoInicial": 126.59,
    "pesoFinal": 127.54,
    "cmd": 2.98,
    "consumoAcumulado": 229.17,
    "gpd": 0.951
  },
  {
    "dia": 100,
    "pesoInicial": 127.54,
    "pesoFinal": 128.48,
    "cmd": 2.98,
    "consumoAcumulado": 232.15,
    "gpd": 0.942
  }
];
const defaultMetasV2 = {
  "metaAlojamento": 17,
  "metaCrescimento1": 30.82,
  "metaCrescimento2": 30.67,
  "metaCrescimento3": 45.71,
  "metaTerminacao1": 27.49,
  "metaTerminacao2": 63.15,
  "metaAcumulada": 214.85
};

export const growthCurvesMisto: CurveVersion[] = [
  {
    version: 'btz',
    nome: 'Curva Grupo BTZ',
    effectiveDate: '2026-08-20',
    curve: growthCurveBtz,
    metas: defaultMetasBtz,
  },
  {
    version: 'bugio',
    nome: 'Curva Bugio',
    effectiveDate: '2026-08-01',
    curve: growthCurveBugio,
    metas: defaultMetasBugio,
  },
  {
    version: 'v1',
    effectiveDate: '2026-01-01',
    curve: growthCurveV1,
    metas: defaultMetasV1,
  },
  {
    version: 'v2',
    effectiveDate: '2026-08-03',
    curve: growthCurveV2,
    metas: defaultMetasV2,
  }
];

export const getActiveCurve = (alojamentoDate?: string, status?: string, tipoLote?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string) => {
  if (empresaConfig?.curva_desempenho && Array.isArray(empresaConfig.curva_desempenho) && empresaConfig.curva_desempenho.length > 0) {
    if ('dia' in empresaConfig.curva_desempenho[0]) {
      // Legacy flat array structure
      return { id: 'legacy', curve: empresaConfig.curva_desempenho, metas: defaultMetas };
    } else {
      // New CurveConfig structure
      const configs = empresaConfig.curva_desempenho;
      if (curvaId) {
        const found = configs.find((c: any) => c.id === curvaId);
        if (found) return found;
      }
      
      const referenceDate = visitDate || fechamentoDate || alojamentoDate || '2000-01-01';
      // Filter by tipoLote (defaulting to Misto if not specified in config)
      const matchingLote = configs.filter((c: any) => (c.tipoLote || 'Misto') === (tipoLote || 'Misto'));
      const listToSearch = matchingLote.length > 0 ? matchingLote : configs;
      
      // Sort by effectiveDate ASC
      const sorted = [...listToSearch].sort((a: any, b: any) => (a.dataVigencia || "").localeCompare(b.dataVigencia || ""));
      
      let selected = sorted[0];
      for (const cv of sorted) {
        if (referenceDate >= cv.dataVigencia) {
          selected = cv;
        }
      }
      return selected || { id: 'none', curve: [], metas: {} as any };
    }
  }

  return { id: 'none', curve: [], metas: {} as any };
};

// Expose legacy exports to not break everything immediately, 
// though we will update callers to use getActiveCurve.
export const growthCurve = growthCurvesMisto[growthCurvesMisto.length - 1].curve;
export const defaultMetas = growthCurvesMisto[growthCurvesMisto.length - 1].metas;

export const growthCurveFemea: GrowthCurvePoint[] = [
  { dia: 1, pesoInicial: 22.000, pesoFinal: 22.680, cmd: 1.029, consumoAcumulado: 1.029, gpd: 0.681 },
  { dia: 2, pesoInicial: 22.680, pesoFinal: 23.370, cmd: 1.051, consumoAcumulado: 2.079, gpd: 0.692 },
  { dia: 3, pesoInicial: 23.370, pesoFinal: 24.080, cmd: 1.073, consumoAcumulado: 3.153, gpd: 0.704 },
  { dia: 4, pesoInicial: 24.080, pesoFinal: 24.790, cmd: 1.095, consumoAcumulado: 4.248, gpd: 0.715 },
  { dia: 5, pesoInicial: 24.790, pesoFinal: 25.520, cmd: 1.117, consumoAcumulado: 5.365, gpd: 0.727 },
  { dia: 6, pesoInicial: 25.520, pesoFinal: 26.260, cmd: 1.139, consumoAcumulado: 6.504, gpd: 0.738 },
  { dia: 7, pesoInicial: 26.260, pesoFinal: 27.010, cmd: 1.161, consumoAcumulado: 7.665, gpd: 0.750 },
  { dia: 8, pesoInicial: 27.010, pesoFinal: 27.770, cmd: 1.183, consumoAcumulado: 8.848, gpd: 0.761 },
  { dia: 9, pesoInicial: 27.770, pesoFinal: 28.540, cmd: 1.204, consumoAcumulado: 10.052, gpd: 0.773 },
  { dia: 10, pesoInicial: 28.540, pesoFinal: 29.320, cmd: 1.226, consumoAcumulado: 11.278, gpd: 0.784 },
  { dia: 11, pesoInicial: 29.320, pesoFinal: 30.120, cmd: 1.247, consumoAcumulado: 12.525, gpd: 0.796 },
  { dia: 12, pesoInicial: 30.120, pesoFinal: 30.930, cmd: 1.269, consumoAcumulado: 13.794, gpd: 0.806 },
  { dia: 13, pesoInicial: 30.930, pesoFinal: 31.740, cmd: 1.290, consumoAcumulado: 15.084, gpd: 0.813 },
  { dia: 14, pesoInicial: 31.740, pesoFinal: 32.560, cmd: 1.311, consumoAcumulado: 16.395, gpd: 0.820 },
  { dia: 15, pesoInicial: 32.560, pesoFinal: 33.440, cmd: 1.486, consumoAcumulado: 17.881, gpd: 0.886 },
  { dia: 16, pesoInicial: 33.440, pesoFinal: 34.340, cmd: 1.511, consumoAcumulado: 19.392, gpd: 0.896 },
  { dia: 17, pesoInicial: 34.340, pesoFinal: 35.240, cmd: 1.535, consumoAcumulado: 20.927, gpd: 0.904 },
  { dia: 18, pesoInicial: 35.240, pesoFinal: 36.160, cmd: 1.560, consumoAcumulado: 22.487, gpd: 0.912 },
  { dia: 19, pesoInicial: 36.160, pesoFinal: 37.080, cmd: 1.584, consumoAcumulado: 24.070, gpd: 0.920 },
  { dia: 20, pesoInicial: 37.080, pesoFinal: 38.000, cmd: 1.607, consumoAcumulado: 25.678, gpd: 0.927 },
  { dia: 21, pesoInicial: 38.000, pesoFinal: 38.940, cmd: 1.631, consumoAcumulado: 27.309, gpd: 0.935 },
  { dia: 22, pesoInicial: 38.940, pesoFinal: 39.880, cmd: 1.654, consumoAcumulado: 28.963, gpd: 0.943 },
  { dia: 23, pesoInicial: 39.880, pesoFinal: 40.830, cmd: 1.677, consumoAcumulado: 30.640, gpd: 0.950 },
  { dia: 24, pesoInicial: 40.830, pesoFinal: 41.790, cmd: 1.700, consumoAcumulado: 32.340, gpd: 0.958 },
  { dia: 25, pesoInicial: 41.790, pesoFinal: 42.750, cmd: 1.723, consumoAcumulado: 34.063, gpd: 0.965 },
  { dia: 26, pesoInicial: 42.750, pesoFinal: 43.730, cmd: 1.745, consumoAcumulado: 35.808, gpd: 0.973 },
  { dia: 27, pesoInicial: 43.730, pesoFinal: 44.710, cmd: 1.767, consumoAcumulado: 37.575, gpd: 0.980 },
  { dia: 28, pesoInicial: 44.710, pesoFinal: 45.690, cmd: 1.789, consumoAcumulado: 39.364, gpd: 0.988 },
  { dia: 29, pesoInicial: 45.690, pesoFinal: 46.730, cmd: 1.954, consumoAcumulado: 41.317, gpd: 1.039 },
  { dia: 30, pesoInicial: 46.730, pesoFinal: 47.780, cmd: 1.978, consumoAcumulado: 43.295, gpd: 1.047 },
  { dia: 31, pesoInicial: 47.780, pesoFinal: 48.830, cmd: 2.002, consumoAcumulado: 45.297, gpd: 1.055 },
  { dia: 32, pesoInicial: 48.830, pesoFinal: 49.900, cmd: 2.025, consumoAcumulado: 47.322, gpd: 1.063 },
  { dia: 33, pesoInicial: 49.900, pesoFinal: 50.950, cmd: 2.049, consumoAcumulado: 49.371, gpd: 1.058 },
  { dia: 34, pesoInicial: 50.950, pesoFinal: 52.020, cmd: 2.072, consumoAcumulado: 51.443, gpd: 1.066 },
  { dia: 35, pesoInicial: 52.020, pesoFinal: 53.090, cmd: 2.094, consumoAcumulado: 53.537, gpd: 1.073 },
  { dia: 36, pesoInicial: 53.090, pesoFinal: 54.170, cmd: 2.117, consumoAcumulado: 55.654, gpd: 1.081 },
  { dia: 37, pesoInicial: 54.170, pesoFinal: 55.260, cmd: 2.139, consumoAcumulado: 57.793, gpd: 1.088 },
  { dia: 38, pesoInicial: 55.260, pesoFinal: 56.360, cmd: 2.161, consumoAcumulado: 59.953, gpd: 1.095 },
  { dia: 39, pesoInicial: 56.360, pesoFinal: 57.460, cmd: 2.182, consumoAcumulado: 62.136, gpd: 1.102 },
  { dia: 40, pesoInicial: 57.460, pesoFinal: 58.570, cmd: 2.204, consumoAcumulado: 64.339, gpd: 1.108 },
  { dia: 41, pesoInicial: 58.570, pesoFinal: 59.680, cmd: 2.225, consumoAcumulado: 66.564, gpd: 1.115 },
  { dia: 42, pesoInicial: 59.680, pesoFinal: 60.800, cmd: 2.246, consumoAcumulado: 68.810, gpd: 1.121 },
  { dia: 43, pesoInicial: 60.800, pesoFinal: 61.920, cmd: 2.306, consumoAcumulado: 71.116, gpd: 1.121 },
  { dia: 44, pesoInicial: 61.920, pesoFinal: 63.050, cmd: 2.326, consumoAcumulado: 73.442, gpd: 1.127 },
  { dia: 45, pesoInicial: 63.050, pesoFinal: 64.180, cmd: 2.347, consumoAcumulado: 75.789, gpd: 1.132 },
  { dia: 46, pesoInicial: 64.180, pesoFinal: 65.320, cmd: 2.367, consumoAcumulado: 78.155, gpd: 1.137 },
  { dia: 47, pesoInicial: 65.320, pesoFinal: 66.460, cmd: 2.386, consumoAcumulado: 80.542, gpd: 1.142 },
  { dia: 48, pesoInicial: 66.460, pesoFinal: 67.610, cmd: 2.406, consumoAcumulado: 82.947, gpd: 1.146 },
  { dia: 49, pesoInicial: 67.610, pesoFinal: 68.760, cmd: 2.425, consumoAcumulado: 85.372, gpd: 1.150 },
  { dia: 50, pesoInicial: 68.760, pesoFinal: 69.910, cmd: 2.443, consumoAcumulado: 87.815, gpd: 1.154 },
  { dia: 51, pesoInicial: 69.910, pesoFinal: 71.070, cmd: 2.462, consumoAcumulado: 90.277, gpd: 1.157 },
  { dia: 52, pesoInicial: 71.070, pesoFinal: 72.230, cmd: 2.480, consumoAcumulado: 92.756, gpd: 1.160 },
  { dia: 53, pesoInicial: 72.230, pesoFinal: 73.390, cmd: 2.497, consumoAcumulado: 95.254, gpd: 1.163 },
  { dia: 54, pesoInicial: 73.390, pesoFinal: 74.560, cmd: 2.515, consumoAcumulado: 97.769, gpd: 1.165 },
  { dia: 55, pesoInicial: 74.560, pesoFinal: 75.730, cmd: 2.532, consumoAcumulado: 100.300, gpd: 1.167 },
  { dia: 56, pesoInicial: 75.730, pesoFinal: 76.890, cmd: 2.549, consumoAcumulado: 102.849, gpd: 1.169 },
  { dia: 57, pesoInicial: 76.890, pesoFinal: 78.190, cmd: 2.525, consumoAcumulado: 105.374, gpd: 1.299 },
  { dia: 58, pesoInicial: 78.190, pesoFinal: 79.490, cmd: 2.543, consumoAcumulado: 107.917, gpd: 1.293 },
  { dia: 59, pesoInicial: 79.490, pesoFinal: 80.770, cmd: 2.560, consumoAcumulado: 110.477, gpd: 1.287 },
  { dia: 60, pesoInicial: 80.770, pesoFinal: 82.050, cmd: 2.576, consumoAcumulado: 113.054, gpd: 1.280 },
  { dia: 61, pesoInicial: 82.050, pesoFinal: 83.330, cmd: 2.593, consumoAcumulado: 115.646, gpd: 1.273 },
  { dia: 62, pesoInicial: 83.330, pesoFinal: 84.590, cmd: 2.608, consumoAcumulado: 118.254, gpd: 1.265 },
  { dia: 63, pesoInicial: 84.590, pesoFinal: 85.850, cmd: 2.623, consumoAcumulado: 120.877, gpd: 1.257 },
  { dia: 64, pesoInicial: 85.850, pesoFinal: 87.100, cmd: 2.638, consumoAcumulado: 123.515, gpd: 1.249 },
  { dia: 65, pesoInicial: 87.100, pesoFinal: 88.340, cmd: 2.652, consumoAcumulado: 126.167, gpd: 1.240 },
  { dia: 66, pesoInicial: 88.340, pesoFinal: 89.570, cmd: 2.666, consumoAcumulado: 128.833, gpd: 1.231 },
  { dia: 67, pesoInicial: 89.570, pesoFinal: 90.760, cmd: 2.607, consumoAcumulado: 131.440, gpd: 1.189 },
  { dia: 68, pesoInicial: 90.760, pesoFinal: 91.940, cmd: 2.620, consumoAcumulado: 134.060, gpd: 1.179 },
  { dia: 69, pesoInicial: 91.940, pesoFinal: 93.100, cmd: 2.631, consumoAcumulado: 136.691, gpd: 1.168 },
  { dia: 70, pesoInicial: 93.100, pesoFinal: 94.260, cmd: 2.642, consumoAcumulado: 139.333, gpd: 1.157 },
  { dia: 71, pesoInicial: 94.260, pesoFinal: 95.410, cmd: 2.653, consumoAcumulado: 141.987, gpd: 1.146 },
  { dia: 72, pesoInicial: 95.410, pesoFinal: 96.540, cmd: 2.664, consumoAcumulado: 144.651, gpd: 1.135 },
  { dia: 73, pesoInicial: 96.540, pesoFinal: 97.670, cmd: 2.674, consumoAcumulado: 147.324, gpd: 1.125 },
  { dia: 74, pesoInicial: 97.670, pesoFinal: 98.780, cmd: 2.684, consumoAcumulado: 150.008, gpd: 1.114 },
  { dia: 75, pesoInicial: 98.780, pesoFinal: 99.880, cmd: 2.693, consumoAcumulado: 152.701, gpd: 1.104 },
  { dia: 76, pesoInicial: 99.880, pesoFinal: 100.980, cmd: 2.702, consumoAcumulado: 155.403, gpd: 1.094 },
  { dia: 77, pesoInicial: 100.980, pesoFinal: 102.060, cmd: 2.711, consumoAcumulado: 158.114, gpd: 1.084 },
  { dia: 78, pesoInicial: 102.060, pesoFinal: 103.130, cmd: 2.719, consumoAcumulado: 160.833, gpd: 1.065 },
  { dia: 79, pesoInicial: 103.130, pesoFinal: 104.170, cmd: 2.727, consumoAcumulado: 163.560, gpd: 1.042 },
  { dia: 80, pesoInicial: 104.170, pesoFinal: 105.190, cmd: 2.735, consumoAcumulado: 166.295, gpd: 1.020 }
];

export const defaultMetasFemea = {
  metaAlojamento: 16.39,
  metaCrescimento1: 22.97,
  metaCrescimento2: 29.45,
  metaCrescimento3: 34.04,
  metaTerminacao1: 25.98,
  metaTerminacao2: 37.46,
  metaAcumulada: 166.29
};

export const getExpectedPerformance = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string) => {
  const activeCurveInfo = getActiveCurve(alojamentoDate, status, tipoLote, fechamentoDate, empresaConfig, curvaId, visitDate);
  
  if (!activeCurveInfo || !activeCurveInfo.curve || activeCurveInfo.curve.length === 0) {
    return { expectedConsumption: 0, expectedWeight: 0 };
  }

  let currentWeight = (pesoAloj && Number(pesoAloj) > 0) ? Number(pesoAloj) : (activeCurveInfo.curve[0]?.pesoInicial || 0);
  let totalConsumo = 0;
  
  // Calculate offset if tipo_calculo_curva is PESO_ALOJAMENTO
  let offsetDays = 0;
  const tipoCalculo = activeCurveInfo.tipoCalculo || empresaConfig?.tipo_calculo_curva;
  if (tipoCalculo === 'PESO_ALOJAMENTO' && pesoAloj && Number(pesoAloj) > 0) {
    // Find the day in the curve where pesoInicial is closest to pesoAloj
    // (Assuming curve is sorted by day)
    for (let i = 0; i < activeCurveInfo.curve.length; i++) {
      if (activeCurveInfo.curve[i].pesoInicial >= Number(pesoAloj)) {
        offsetDays = i;
        break;
      }
    }
  }
  
  for (let d = 0; d < idade; d++) {
    let point = activeCurveInfo.curve.find((p: any) => p.dia === (d + 1 + offsetDays));
    if (!point) {
      point = activeCurveInfo.curve[activeCurveInfo.curve.length - 1];
    }
    totalConsumo += point.cmd;
    currentWeight += point.gpd;
  }
  
  return {
    expectedConsumption: Number(totalConsumo.toFixed(2)),
    expectedWeight: Number(currentWeight.toFixed(2))
  };
};

export const getExpectedConsumption = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string): number => {
  return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId, visitDate).expectedConsumption;
};

export const getExpectedWeight = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string): number => {
  return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId, visitDate).expectedWeight;
};

// Parser
function parsePdfData() {
  const integradosMap = new Map<string, Integrado>();
  const visits: Visit[] = [];
  
  const lines = pdfData.trim().split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?\d+)\s+(.+?)\s+(Automático|Linear|Misto|Multitratos|Basculante|Robô|automático com\s+água)\s+([^\d]+)\s+([\d.]+)\s+(\d+)(?:\s+(\d+))?(?:\s+([\d.]+))?$/i);
    
    if (match) {
      const [, dateStr, name, alojamentoStr, idadeStr, rec, comedouro, colab, consumoStr, mortStr, alojadosStr, pesoAlojStr] = match;
      
      const id = `i_${name.replace(/\s+/g, '').toLowerCase()}`;
      if (!integradosMap.has(id)) {
        integradosMap.set(id, {
          id,
          name: name.trim(),
          alojamentoDate: alojamentoStr.split('/').reverse().join('-'), // YYYY-MM-DD
          status: 'Em andamento'
        });
      }
      
      let parsedComedouro = 'Automático';
      const cLow = comedouro.toLowerCase();
      if (cLow.includes('linear')) parsedComedouro = 'Linear';
      else if (cLow.includes('misto') || cLow.includes('multitratos') || cLow.includes('basculante') || cLow.includes('robô')) parsedComedouro = 'Misto';
      
      const animaisMortos = parseInt(mortStr, 10) || 0;
      const alojNum = alojadosStr ? parseInt(alojadosStr, 10) : 0;
      const animaisAlojados = alojNum > 0 ? alojNum : undefined;
      const mortalidadePct = (animaisAlojados && animaisAlojados > 0) 
        ? Number(((animaisMortos / animaisAlojados) * 100).toFixed(2)) 
        : (animaisMortos > 0 ? undefined : 0);
      const pesoAloj = (pesoAlojStr && parseFloat(pesoAlojStr) > 0) ? parseFloat(pesoAlojStr) : undefined;
      const consumoAcumuladoReal = parseFloat(consumoStr) || 0;

      const activeCurveInfo = getActiveCurve(
        alojamentoStr.split('/').reverse().join('-'),
        'Em andamento',
        'Misto'
      );
      const metas = activeCurveInfo.metas;

      visits.push({
        id: `v_${id}_${index}`,
        integradoId: id,
        date: dateStr.split('/').reverse().join('-'),
        idade: parseInt(idadeStr, 10),
        recomendacao: rec.trim(),
        comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
        colaborador: colab.trim(),
        consumoAcumuladoReal,
        mortalidade: mortalidadePct,
        animaisMortos,
        animaisAlojados,
        pesoAloj,
        metaAlojamento: metas.metaAlojamento,
        metaCrescimento1: metas.metaCrescimento1,
        metaCrescimento2: metas.metaCrescimento2,
        metaCrescimento3: metas.metaCrescimento3,
        metaTerminacao1: metas.metaTerminacao1,
        metaTerminacao2: metas.metaTerminacao2,
        metaAcumulada: metas.metaAcumulada
      });
    }
  });

  return { 
    parsedIntegrados: Array.from(integradosMap.values()), 
    parsedVisits: visits 
  };
}

const { parsedIntegrados, parsedVisits } = parsePdfData();

export const initialIntegrados: Integrado[] = parsedIntegrados.length > 0 ? parsedIntegrados : [
  { id: '1', name: 'Arildo Valcarenghi', alojamentoDate: '2026-03-30', status: 'Em andamento' },
  { id: '2', name: 'Wanderlei Richit', alojamentoDate: '2026-03-23', status: 'Em andamento' }
];

export const initialVisits: Visit[] = parsedVisits.length > 0 ? parsedVisits : [
  {
    id: 'v1', date: '2026-04-28', integradoId: '1', idade: 29, 
    recomendacao: 'Consumo acumulado 49,83 kg e tabela 51,36 kg',
    comedouro: 'Automático', colaborador: 'Wagner', consumoAcumuladoReal: 49.83, mortalidade: 0.12
  }
];

export const DEFAULT_MEDICAMENTOS_PERMITIDOS: string[] = [
  'Amoxicilina',
  'Apramicina',
  'Avilamicina',
  'Ciprofloxacino',
  'Ciromazina',
  'Clortetraciclina',
  'Colistina',
  'Doxiciclina',
  'Enramicina',
  'Espectinomicina',
  'Florfenicol',
  'Fosfomicina',
  'Gentamicina',
  'Halquinol',
  'Ivermectina',
  'Leucomicina',
  'Lincomicina',
  'Neomicina',
  'Norfloxacina',
  'Oxibendazole',
  'Oxitetraciclina',
  'Sulfadiazina',
  'Sulfadiazina + Trimetoprim',
  'Sulfadimidina',
  'Sulfametazina',
  'Sulfametoxazol',
  'Tiamulina',
  'Tildipirosina',
  'Tilmicosina',
  'Tilosina',
  'Tilvalosina',
  'Trimetoprima',
  'Tulatromicina',
  'Valnemulina',
  'Virginiamicina'
];

export const DEFAULT_CAUSAS_MORTALIDADE: string[] = [
  'Pneumonia / doença respiratória',
  'Úlcera gástrica / hemorragia gástrica',
  'Diarreia / enterite',
  'Refugagem',
  'Polisserosite',
  'Septicemia / infecção sistêmica',
  'Pericardite',
  'Artrite / poliartrite',
  'Meningite / encefalite / sinais neurológicos',
  'Torção / volvo de órgãos',
  'Trauma / lesões por briga ou manejo',
  'Fratura / problema locomotor',
  'Prolapso / hemorragia',
  'Morte súbita — causa não identificada',
  'Intoxicação / suspeita de intoxicação',
  'Outros',
  'Não diagnosticado'
];

export const DEFAULT_TECNICOS: string[] = ['Wagner', 'Helio', 'Alessandro', 'Roger', 'João', 'Luana', 'Adelio'];

export const defaultPastreProgramaAlimentar = [
  { nome: 'Alojamento', dia_inicio: 1, dia_fim: 14, racao: 'Alojamento' },
  { nome: 'Crescimento 1', dia_inicio: 15, dia_fim: 32, racao: 'Crescimento 1' },
  { nome: 'Crescimento 2', dia_inicio: 33, dia_fim: 46, racao: 'Crescimento 2' },
  { nome: 'Crescimento 3', dia_inicio: 47, dia_fim: 64, racao: 'Crescimento 3' },
  { nome: 'Terminação 1', dia_inicio: 65, dia_fim: 74, racao: 'Terminação 1' },
  { nome: 'Terminação 2', dia_inicio: 75, dia_fim: 96, racao: 'Terminação 2' }
];
