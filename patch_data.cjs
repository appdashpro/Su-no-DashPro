const fs = require('fs');
const path = './src/data.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "export const getActiveCurve = (alojamentoDate?: string, status?: string, tipoLote?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string) => {",
  "export const getActiveCurve = (alojamentoDate?: string, status?: string, tipoLote?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string) => {"
);

content = content.replace(
  "const referenceDate = fechamentoDate || alojamentoDate || '2000-01-01';",
  "const referenceDate = visitDate || fechamentoDate || alojamentoDate || '2000-01-01';"
);

content = content.replace(
  "export const getExpectedPerformance = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string) => {",
  "export const getExpectedPerformance = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string) => {"
);

content = content.replace(
  "const activeCurveInfo = getActiveCurve(alojamentoDate, status, tipoLote, fechamentoDate, empresaConfig, curvaId);",
  "const activeCurveInfo = getActiveCurve(alojamentoDate, status, tipoLote, fechamentoDate, empresaConfig, curvaId, visitDate);"
);

content = content.replace(
  "export const getExpectedConsumption = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string): number => {",
  "export const getExpectedConsumption = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string): number => {"
);

content = content.replace(
  "return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId).expectedConsumption;",
  "return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId, visitDate).expectedConsumption;"
);

content = content.replace(
  "export const getExpectedWeight = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string): number => {",
  "export const getExpectedWeight = (idade: number, tipoLote?: 'Misto' | 'Fêmea' | 'Macho', pesoAloj?: number, alojamentoDate?: string, status?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string): number => {"
);

content = content.replace(
  "return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId).expectedWeight;",
  "return getExpectedPerformance(idade, tipoLote, pesoAloj, alojamentoDate, status, fechamentoDate, empresaConfig, curvaId, visitDate).expectedWeight;"
);

fs.writeFileSync(path, content);
