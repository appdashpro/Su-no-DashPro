import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

const oldStart = '<BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>';
const oldEnd = '</BarChart>';
const oldStr = code.substring(code.indexOf(oldStart), code.indexOf(oldEnd) + oldEnd.length);

const newStr = `              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: string) => [\`\${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg\`, name]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                {chartProducts.map((product, index) => (
                  <Bar 
                    key={product} 
                    dataKey={product} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                    maxBarSize={50} 
                  />
                ))}
              </BarChart>`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
