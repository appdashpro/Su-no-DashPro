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
  { dia: 1, pesoInicial: 20.000, pesoFinal: 20.680, cmd: 1.089, consumoAcumulado: 1.089, gpd: 0.680 },
  { dia: 2, pesoInicial: 20.680, pesoFinal: 21.370, cmd: 1.116, consumoAcumulado: 2.205, gpd: 0.690 },
  { dia: 3, pesoInicial: 21.370, pesoFinal: 22.080, cmd: 1.143, consumoAcumulado: 3.347, gpd: 0.710 },
  { dia: 4, pesoInicial: 22.080, pesoFinal: 22.790, cmd: 1.169, consumoAcumulado: 4.516, gpd: 0.710 },
  { dia: 5, pesoInicial: 22.790, pesoFinal: 23.520, cmd: 1.196, consumoAcumulado: 5.712, gpd: 0.730 },
  { dia: 6, pesoInicial: 23.520, pesoFinal: 24.270, cmd: 1.222, consumoAcumulado: 6.935, gpd: 0.750 },
  { dia: 7, pesoInicial: 24.270, pesoFinal: 25.030, cmd: 1.249, consumoAcumulado: 8.183, gpd: 0.760 },
  { dia: 8, pesoInicial: 25.030, pesoFinal: 25.800, cmd: 1.275, consumoAcumulado: 9.458, gpd: 0.770 },
  { dia: 9, pesoInicial: 25.800, pesoFinal: 26.580, cmd: 1.301, consumoAcumulado: 10.759, gpd: 0.780 },
  { dia: 10, pesoInicial: 26.580, pesoFinal: 27.380, cmd: 1.327, consumoAcumulado: 12.087, gpd: 0.800 },
  { dia: 11, pesoInicial: 27.380, pesoFinal: 28.190, cmd: 1.353, consumoAcumulado: 13.440, gpd: 0.810 },
  { dia: 12, pesoInicial: 28.190, pesoFinal: 29.010, cmd: 1.379, consumoAcumulado: 14.819, gpd: 0.820 },
  { dia: 13, pesoInicial: 29.010, pesoFinal: 29.850, cmd: 1.405, consumoAcumulado: 16.224, gpd: 0.840 },
  { dia: 14, pesoInicial: 29.850, pesoFinal: 30.700, cmd: 1.431, consumoAcumulado: 17.654, gpd: 0.850 },
  { dia: 15, pesoInicial: 30.700, pesoFinal: 31.570, cmd: 1.498, consumoAcumulado: 19.153, gpd: 0.870 },
  { dia: 16, pesoInicial: 31.570, pesoFinal: 32.440, cmd: 1.525, consumoAcumulado: 20.677, gpd: 0.870 },
  { dia: 17, pesoInicial: 32.440, pesoFinal: 33.330, cmd: 1.551, consumoAcumulado: 22.228, gpd: 0.890 },
  { dia: 18, pesoInicial: 33.330, pesoFinal: 34.220, cmd: 1.576, consumoAcumulado: 23.804, gpd: 0.890 },
  { dia: 19, pesoInicial: 34.220, pesoFinal: 35.120, cmd: 1.602, consumoAcumulado: 25.406, gpd: 0.900 },
  { dia: 20, pesoInicial: 35.120, pesoFinal: 36.020, cmd: 1.627, consumoAcumulado: 27.034, gpd: 0.900 },
  { dia: 21, pesoInicial: 36.020, pesoFinal: 36.940, cmd: 1.652, consumoAcumulado: 28.686, gpd: 0.920 },
  { dia: 22, pesoInicial: 36.940, pesoFinal: 37.860, cmd: 1.677, consumoAcumulado: 30.363, gpd: 0.920 },
  { dia: 23, pesoInicial: 37.860, pesoFinal: 38.790, cmd: 1.702, consumoAcumulado: 32.064, gpd: 0.930 },
  { dia: 24, pesoInicial: 38.790, pesoFinal: 39.730, cmd: 1.726, consumoAcumulado: 33.790, gpd: 0.940 },
  { dia: 25, pesoInicial: 39.730, pesoFinal: 40.670, cmd: 1.750, consumoAcumulado: 35.540, gpd: 0.940 },
  { dia: 26, pesoInicial: 40.670, pesoFinal: 41.620, cmd: 1.774, consumoAcumulado: 37.314, gpd: 0.950 },
  { dia: 27, pesoInicial: 41.620, pesoFinal: 42.590, cmd: 1.797, consumoAcumulado: 39.111, gpd: 0.970 },
  { dia: 28, pesoInicial: 42.590, pesoFinal: 43.550, cmd: 1.821, consumoAcumulado: 40.932, gpd: 0.960 },
  { dia: 29, pesoInicial: 43.550, pesoFinal: 44.530, cmd: 1.844, consumoAcumulado: 42.776, gpd: 0.980 },
  { dia: 30, pesoInicial: 44.530, pesoFinal: 45.510, cmd: 1.867, consumoAcumulado: 44.642, gpd: 0.980 },
  { dia: 31, pesoInicial: 45.510, pesoFinal: 46.500, cmd: 1.889, consumoAcumulado: 46.531, gpd: 0.990 },
  { dia: 32, pesoInicial: 46.500, pesoFinal: 47.500, cmd: 1.912, consumoAcumulado: 48.443, gpd: 1.000 },
  { dia: 33, pesoInicial: 47.500, pesoFinal: 48.500, cmd: 1.974, consumoAcumulado: 50.418, gpd: 1.000 },
  { dia: 34, pesoInicial: 48.500, pesoFinal: 49.510, cmd: 1.997, consumoAcumulado: 52.414, gpd: 1.010 },
  { dia: 35, pesoInicial: 49.510, pesoFinal: 50.520, cmd: 2.019, consumoAcumulado: 54.433, gpd: 1.010 },
  { dia: 36, pesoInicial: 50.520, pesoFinal: 51.520, cmd: 2.041, consumoAcumulado: 56.474, gpd: 1.000 },
  { dia: 37, pesoInicial: 51.520, pesoFinal: 52.540, cmd: 2.062, consumoAcumulado: 58.535, gpd: 1.020 },
  { dia: 38, pesoInicial: 52.540, pesoFinal: 53.560, cmd: 2.083, consumoAcumulado: 60.618, gpd: 1.020 },
  { dia: 39, pesoInicial: 53.560, pesoFinal: 54.580, cmd: 2.104, consumoAcumulado: 62.722, gpd: 1.020 },
  { dia: 40, pesoInicial: 54.580, pesoFinal: 55.610, cmd: 2.124, consumoAcumulado: 64.847, gpd: 1.030 },
  { dia: 41, pesoInicial: 55.610, pesoFinal: 56.650, cmd: 2.145, consumoAcumulado: 66.992, gpd: 1.040 },
  { dia: 42, pesoInicial: 56.650, pesoFinal: 57.700, cmd: 2.165, consumoAcumulado: 69.157, gpd: 1.050 },
  { dia: 43, pesoInicial: 57.700, pesoFinal: 58.750, cmd: 2.185, consumoAcumulado: 71.342, gpd: 1.050 },
  { dia: 44, pesoInicial: 58.750, pesoFinal: 59.800, cmd: 2.205, consumoAcumulado: 73.546, gpd: 1.050 },
  { dia: 45, pesoInicial: 59.800, pesoFinal: 60.860, cmd: 2.224, consumoAcumulado: 75.770, gpd: 1.060 },
  { dia: 46, pesoInicial: 60.860, pesoFinal: 61.930, cmd: 2.243, consumoAcumulado: 78.014, gpd: 1.070 },
  { dia: 47, pesoInicial: 61.930, pesoFinal: 62.990, cmd: 2.300, consumoAcumulado: 80.314, gpd: 1.060 },
  { dia: 48, pesoInicial: 62.990, pesoFinal: 64.060, cmd: 2.319, consumoAcumulado: 82.633, gpd: 1.070 },
  { dia: 49, pesoInicial: 64.060, pesoFinal: 65.130, cmd: 2.338, consumoAcumulado: 84.971, gpd: 1.070 },
  { dia: 50, pesoInicial: 65.130, pesoFinal: 66.200, cmd: 2.356, consumoAcumulado: 87.327, gpd: 1.070 },
  { dia: 51, pesoInicial: 66.200, pesoFinal: 67.280, cmd: 2.374, consumoAcumulado: 89.701, gpd: 1.080 },
  { dia: 52, pesoInicial: 67.280, pesoFinal: 68.360, cmd: 2.392, consumoAcumulado: 92.092, gpd: 1.080 },
  { dia: 53, pesoInicial: 68.360, pesoFinal: 69.450, cmd: 2.409, consumoAcumulado: 94.502, gpd: 1.090 },
  { dia: 54, pesoInicial: 69.450, pesoFinal: 70.530, cmd: 2.426, consumoAcumulado: 96.928, gpd: 1.080 },
  { dia: 55, pesoInicial: 70.530, pesoFinal: 71.620, cmd: 2.443, consumoAcumulado: 99.371, gpd: 1.090 },
  { dia: 56, pesoInicial: 71.620, pesoFinal: 72.710, cmd: 2.460, consumoAcumulado: 101.831, gpd: 1.090 },
  { dia: 57, pesoInicial: 72.710, pesoFinal: 73.810, cmd: 2.476, consumoAcumulado: 104.308, gpd: 1.100 },
  { dia: 58, pesoInicial: 73.810, pesoFinal: 74.900, cmd: 2.492, consumoAcumulado: 106.800, gpd: 1.090 },
  { dia: 59, pesoInicial: 74.900, pesoFinal: 75.990, cmd: 2.508, consumoAcumulado: 109.308, gpd: 1.090 },
  { dia: 60, pesoInicial: 75.990, pesoFinal: 77.090, cmd: 2.524, consumoAcumulado: 111.832, gpd: 1.100 },
  { dia: 61, pesoInicial: 77.090, pesoFinal: 78.180, cmd: 2.539, consumoAcumulado: 114.370, gpd: 1.090 },
  { dia: 62, pesoInicial: 78.180, pesoFinal: 79.280, cmd: 2.553, consumoAcumulado: 116.924, gpd: 1.100 },
  { dia: 63, pesoInicial: 79.280, pesoFinal: 80.370, cmd: 2.568, consumoAcumulado: 119.492, gpd: 1.090 },
  { dia: 64, pesoInicial: 80.370, pesoFinal: 81.460, cmd: 2.582, consumoAcumulado: 122.074, gpd: 1.090 },
  { dia: 65, pesoInicial: 81.460, pesoFinal: 82.810, cmd: 2.680, consumoAcumulado: 124.754, gpd: 1.350 },
  { dia: 66, pesoInicial: 82.810, pesoFinal: 84.150, cmd: 2.698, consumoAcumulado: 127.452, gpd: 1.340 },
  { dia: 67, pesoInicial: 84.150, pesoFinal: 85.490, cmd: 2.714, consumoAcumulado: 130.166, gpd: 1.340 },
  { dia: 68, pesoInicial: 85.490, pesoFinal: 86.810, cmd: 2.731, consumoAcumulado: 132.897, gpd: 1.320 },
  { dia: 69, pesoInicial: 86.810, pesoFinal: 88.120, cmd: 2.746, consumoAcumulado: 135.643, gpd: 1.310 },
  { dia: 70, pesoInicial: 88.120, pesoFinal: 89.430, cmd: 2.761, consumoAcumulado: 138.405, gpd: 1.310 },
  { dia: 71, pesoInicial: 89.430, pesoFinal: 90.720, cmd: 2.776, consumoAcumulado: 141.181, gpd: 1.290 },
  { dia: 72, pesoInicial: 90.720, pesoFinal: 92.000, cmd: 2.790, consumoAcumulado: 143.970, gpd: 1.280 },
  { dia: 73, pesoInicial: 92.000, pesoFinal: 93.260, cmd: 2.803, consumoAcumulado: 146.774, gpd: 1.260 },
  { dia: 74, pesoInicial: 93.260, pesoFinal: 94.520, cmd: 2.816, consumoAcumulado: 149.590, gpd: 1.260 },
  { dia: 75, pesoInicial: 94.520, pesoFinal: 95.740, cmd: 2.827, consumoAcumulado: 152.417, gpd: 1.220 },
  { dia: 76, pesoInicial: 95.740, pesoFinal: 96.940, cmd: 2.839, consumoAcumulado: 155.256, gpd: 1.200 },
  { dia: 77, pesoInicial: 96.940, pesoFinal: 98.130, cmd: 2.850, consumoAcumulado: 158.106, gpd: 1.190 },
  { dia: 78, pesoInicial: 98.130, pesoFinal: 99.300, cmd: 2.861, consumoAcumulado: 160.967, gpd: 1.170 },
  { dia: 79, pesoInicial: 99.300, pesoFinal: 100.470, cmd: 2.871, consumoAcumulado: 163.839, gpd: 1.170 },
  { dia: 80, pesoInicial: 100.470, pesoFinal: 101.620, cmd: 2.881, consumoAcumulado: 166.720, gpd: 1.150 },
  { dia: 81, pesoInicial: 101.620, pesoFinal: 102.750, cmd: 2.891, consumoAcumulado: 169.611, gpd: 1.130 },
  { dia: 82, pesoInicial: 102.750, pesoFinal: 103.880, cmd: 2.900, consumoAcumulado: 172.511, gpd: 1.130 },
  { dia: 83, pesoInicial: 103.880, pesoFinal: 104.990, cmd: 2.900, consumoAcumulado: 175.411, gpd: 1.110 },
  { dia: 84, pesoInicial: 104.990, pesoFinal: 106.090, cmd: 2.900, consumoAcumulado: 178.311, gpd: 1.100 },
  { dia: 85, pesoInicial: 106.090, pesoFinal: 107.180, cmd: 2.900, consumoAcumulado: 181.211, gpd: 1.090 },
  { dia: 86, pesoInicial: 107.180, pesoFinal: 108.230, cmd: 2.900, consumoAcumulado: 184.112, gpd: 1.050 },
  { dia: 87, pesoInicial: 108.230, pesoFinal: 109.270, cmd: 2.900, consumoAcumulado: 187.012, gpd: 1.040 },
  { dia: 88, pesoInicial: 109.270, pesoFinal: 110.280, cmd: 2.900, consumoAcumulado: 189.912, gpd: 1.010 },
  { dia: 89, pesoInicial: 110.280, pesoFinal: 111.300, cmd: 2.900, consumoAcumulado: 192.812, gpd: 1.020 },
  { dia: 90, pesoInicial: 111.300, pesoFinal: 112.320, cmd: 2.900, consumoAcumulado: 195.712, gpd: 1.020 },
  { dia: 91, pesoInicial: 112.320, pesoFinal: 113.340, cmd: 2.900, consumoAcumulado: 198.612, gpd: 1.020 },
  { dia: 92, pesoInicial: 113.340, pesoFinal: 114.350, cmd: 2.900, consumoAcumulado: 201.512, gpd: 1.010 },
  { dia: 93, pesoInicial: 114.350, pesoFinal: 115.370, cmd: 2.900, consumoAcumulado: 204.412, gpd: 1.020 },
  { dia: 94, pesoInicial: 115.370, pesoFinal: 116.390, cmd: 2.900, consumoAcumulado: 207.312, gpd: 1.020 },
  { dia: 95, pesoInicial: 116.390, pesoFinal: 117.400, cmd: 2.900, consumoAcumulado: 210.212, gpd: 1.010 },
  { dia: 96, pesoInicial: 117.400, pesoFinal: 118.420, cmd: 2.900, consumoAcumulado: 213.112, gpd: 1.020 },
  { dia: 97, pesoInicial: 118.420, pesoFinal: 119.430, cmd: 2.900, consumoAcumulado: 216.012, gpd: 1.010 },
  { dia: 98, pesoInicial: 119.430, pesoFinal: 120.440, cmd: 2.900, consumoAcumulado: 218.912, gpd: 1.010 },

];


const defaultMetasV1 = {
  metaAlojamento: 17.65,
  metaCrescimento1: 30.79,
  metaCrescimento2: 29.57,
  metaCrescimento3: 44.06,
  metaTerminacao1: 27.52,
  metaTerminacao2: 63.52,
  metaAcumulada: 213.11
};


const growthCurveV2: GrowthCurvePoint[] = [
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
const defaultMetasV2 = {
  "metaAlojamento": 17.66,
  "metaCrescimento1": 30.79,
  "metaCrescimento2": 29.57,
  "metaCrescimento3": 44.06,
  "metaTerminacao1": 27.32,
  "metaTerminacao2": 67.95,
  "metaAcumulada": 217.34
};

export const growthCurvesMisto: CurveVersion[] = [
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

export const getActiveCurve = (alojamentoDate?: string, status?: string, tipoLote?: string, fechamentoDate?: string) => {
  if (tipoLote === 'Fêmea') return { curve: growthCurveFemea, metas: defaultMetasFemea };
  
  if (status === 'Em andamento') {
    return growthCurvesMisto[growthCurvesMisto.length - 1];
  }
  
  const referenceDate = fechamentoDate || alojamentoDate || '2000-01-01';
  let selected = growthCurvesMisto[0];
  for (const cv of growthCurvesMisto) {
    if (referenceDate >= cv.effectiveDate) {
      selected = cv;
    }
  }
  return selected;
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

export const getExpectedPerformance = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string) => {
  const { curve } = getActiveCurve(alojamentoDate, status, tipoLote, fechamentoDate);
  
  let currentWeight = (pesoAloj && Number(pesoAloj) > 0) ? Number(pesoAloj) : curve[0].pesoInicial;
  let totalConsumo = 0;
  
  for (let d = 0; d < idade; d++) {
    let point = curve.find(p => p.dia === (d + 1));
    if (!point) {
      point = curve[curve.length - 1];
    }
    totalConsumo += point.cmd;
    currentWeight += point.gpd;
  }
  
  return {
    expectedConsumption: Number(totalConsumo.toFixed(2)),
    expectedWeight: Number(currentWeight.toFixed(2))
  };
};

export const getExpectedConsumption = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string): number => {
  return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate).expectedConsumption;
};

export const getExpectedWeight = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string): number => {
  return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate).expectedWeight;
};

// Parser
function parsePdfData() {
  const integradosMap = new Map<string, Integrado>();
  const visits: Visit[] = [];
  
  const lines = pdfData.trim().split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(-?\d+)\s+(.+?)\s+(Automático|Linear|Misto|Multitratos|Basculante|Robô|automático com\s+água)\s+([^\d]+)\s+([\d.]+)\s+(\d+)$/i);
    
    if (match) {
      const [, dateStr, name, alojamentoStr, idadeStr, rec, comedouro, colab, consumoStr, mortStr] = match;
      
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
      if (comedouro.toLowerCase().includes('linear')) parsedComedouro = 'Linear';
      if (comedouro.toLowerCase().includes('misto')) parsedComedouro = 'Misto';
      
      visits.push({
        id: `v_${id}_${index}`,
        integradoId: id,
        date: dateStr.split('/').reverse().join('-'),
        idade: parseInt(idadeStr, 10),
        recomendacao: rec.trim(),
        comedouro: parsedComedouro as 'Automático' | 'Linear' | 'Misto',
        colaborador: colab.trim(),
        consumoAcumuladoReal: parseFloat(consumoStr) || 0,
        mortalidade: parseInt(mortStr, 10) || 0
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
