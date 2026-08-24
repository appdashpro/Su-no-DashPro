const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

// 1. Fix line 85: descartes_periodo -> descartesPeriodo
content = content.replace(
  'descartes: v.descartes_periodo || v.descartesPeriodo || 0,',
  'descartes: v.descartesPeriodo || 0,'
);

// 2. Fix line 68 (activeCurveInfo?.metas)
content = content.replace(
  'const activeCurveInfo = getActiveCurve(lote?.alojamentoDate, lote?.status, loteVisits[0]?.tipoLote, lote?.fechamentoDate, undefined, loteVisits[0]?.curva_consumo_id, loteVisits[0]?.date);',
  'const activeCurveInfo = getActiveCurve(lote?.alojamentoDate, lote?.status, loteVisits[0]?.tipoLote, lote?.fechamentoDate, undefined, loteVisits[0]?.curva_consumo_id, loteVisits[0]?.date) || {};'
);

// 3. Fix line 251-252 (Tooltip diff calculation)
content = content.replace(
  'const diff = (value - props.payload.esperado).toFixed(2);',
  'const diff = (Number(value) - Number(props.payload.esperado)).toFixed(2);'
);
content = content.replace(
  'return [`${value} kg (${diff > 0 ? \'+\' : \'\'}${diff} kg)`, name];',
  'return [`${value} kg (${Number(diff) > 0 ? \'+\' : \'\'}${diff} kg)`, name];'
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
