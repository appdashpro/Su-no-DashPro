const fs = require('fs');

let file = 'src/data.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /export const getActiveCurve = \([\s\S]*?\{/;

const gompertzHook = `export const getActiveCurve = (alojamentoDate?: string, status?: string, tipoLote?: string, fechamentoDate?: string, empresaConfig?: any, curvaId?: string, visitDate?: string) => {
  if (empresaConfig?.tipo_calculo_curva === 'GOMPERTZ') {
    const pm = empresaConfig?.gompertz_params?.pm || 260;
    const b = empresaConfig?.gompertz_params?.b || 0.012;
    const em = empresaConfig?.gompertz_params?.em || 3780;
    const pi = 22.00; // Default visualization weight
    const curve = generateGompertzCurve(pm, b, em, pi, 120);
    return {
      id: 'gompertz',
      curve: curve,
      metas: {
        metaAlojamento: 0,
        metaCrescimento1: 0,
        metaCrescimento2: 0,
        metaCrescimento3: 0,
        metaTerminacao1: 0,
        metaTerminacao2: 0,
        metaAcumulada: curve[curve.length - 1].consumoAcumulado
      },
      tipoCalculo: 'GOMPERTZ'
    };
  }
`;

code = code.replace(regex, gompertzHook);

fs.writeFileSync(file, code);
