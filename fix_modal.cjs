const fs = require('fs');
let code = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

code = code.replace(
  `{visit.tratamentos!.map(t => (`,
  `{visit.tratamentos!.map(t => {
                                  // Recalculate total if missing
                                  let qtTotal = t.quantidadeTotal;
                                  if (!qtTotal || qtTotal <= 0) {
                                      let pesoEstimadoKg = t.pesoEstimadoKg || visit.pesoAmostradoKg || 0;
                                      if (pesoEstimadoKg <= 0) {
                                          const { curve } = getActiveCurve(integrado.alojamentoDate || visit.date, 'Em andamento', visit.tipoLote || 'Misto');
                                          const expectedPoint = curve.find((p: GrowthCurvePoint) => p.dia >= (visit.idade || 0));
                                          pesoEstimadoKg = expectedPoint ? expectedPoint.pesoInicial : 0;
                                      }
                                      const animaisTratados = Math.max(0, (visit.animaisAlojados || 0) - (visit.animaisMortos || 0));
                                      const concentracao = t.concentracao && t.concentracao > 0 ? t.concentracao : 100;
                                      const mgTotal = animaisTratados * pesoEstimadoKg * (t.doseMgKg || 0) * (t.duracaoDias || 1);
                                      const produtoConsumidoKg = (mgTotal / 1000000) / (concentracao / 100);
                                      qtTotal = Number((produtoConsumidoKg * 1000).toFixed(2));
                                  }
                                  
                                  return (
`
);

code = code.replace(
  `{t.quantidadeTotal && t.quantidadeTotal > 0 && (
                                      <span className="bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded font-bold shadow-sm">
                                        Total: {t.quantidadeTotal} g
                                      </span>
                                    )}`,
  `{qtTotal && qtTotal > 0 && (
                                      <span className="bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded font-bold shadow-sm">
                                        Total: {qtTotal} g
                                      </span>
                                    )}`
);

// fix the syntax of the map function closing
code = code.replace(
  `}
                                  </div>
                                </div>
                              ))}
                            </div>`,
  `}
                                  </div>
                                </div>
                                );
                              })}
                            </div>`
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', code);
