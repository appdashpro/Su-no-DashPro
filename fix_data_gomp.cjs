const fs = require('fs');

let file = 'src/data.ts';
let code = fs.readFileSync(file, 'utf8');

const gompFn = `export const generateGompertzCurve = (pm: number, b: number, em: number, pi: number, days: number = 120) => {
  const curve = [];
  let currentAccumulated = 0;
  for (let t = 0; t < days; t++) {
    const W = pm * Math.exp(Math.log(pi / pm) * Math.exp(-b * t));
    const gpd = b * W * Math.log(pm / W);
    const cmd = ((106 * Math.pow(W, 0.75)) + (2211 + 76.66 * W - 0.3726 * Math.pow(W, 2)) * gpd) / em;
    
    currentAccumulated += cmd;
    
    // Peso Final will be W + gpd, or next day's W
    const nextW = pm * Math.exp(Math.log(pi / pm) * Math.exp(-b * (t + 1)));
    
    curve.push({
      dia: t + 1,
      pesoInicial: W,
      pesoFinal: nextW,
      cmd: cmd,
      gpd: gpd,
      consumoAcumulado: currentAccumulated
    });
  }
  return curve;
};

`;

const target1 = "export const getExpectedPerformance =";
code = code.replace(target1, gompFn + target1);

const expectedLogic = `  if (tipoCalculo === 'GOMPERTZ') {
    const pm = empresaConfig?.gompertz_params?.pm || 260;
    const b = empresaConfig?.gompertz_params?.b || 0.012;
    const em = empresaConfig?.gompertz_params?.em || 3780;
    const pi = (pesoAloj && Number(pesoAloj) > 0) ? Number(pesoAloj) : 22.00;
    
    const gompertzCurve = generateGompertzCurve(pm, b, em, pi, Math.max(120, idade));
    
    for (let d = 0; d < idade; d++) {
      let point = gompertzCurve.find((p: any) => p.dia === (d + 1));
      if (point) {
        totalConsumo += point.cmd;
        currentWeight = point.pesoFinal;
      }
    }
    
    return {
      expectedConsumption: Number(totalConsumo.toFixed(2)),
      expectedWeight: Number(currentWeight.toFixed(2))
    };
  }

  if (tipoCalculo === 'PESO_ALOJAMENTO'`;

code = code.replace("if (tipoCalculo === 'PESO_ALOJAMENTO'", expectedLogic);

fs.writeFileSync(file, code);
