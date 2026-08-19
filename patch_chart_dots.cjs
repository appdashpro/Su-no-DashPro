const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const replacement = `                      <Line 
                        type="monotone" 
                        dataKey="real" 
                        name="Consumo Real" 
                        stroke="#e2e8f0" 
                        strokeWidth={2} 
                        connectNulls={true}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        dot={(props) => {
                          const { cx, cy, payload, value } = props;
                          if (value === null || value === undefined) return null;
                          
                          let dotColor = '#3b82f6'; // default blue
                          if (payload.esperado !== null && payload.esperado !== undefined) {
                            const diff = payload.real - payload.esperado;
                            if (diff > 5) dotColor = '#ef4444'; // red
                            else if (diff < -5) dotColor = '#10b981'; // emerald
                          }
                          
                          return (
                            <circle cx={cx} cy={cy} r={5} fill={dotColor} stroke="#fff" strokeWidth={2} key={\`dot-\${payload.idade}\`} />
                          );
                        }} 
                      />`;

content = content.replace(/<Line type="monotone" dataKey="real" name="Consumo Real" [^>]+ \/>/g, replacement);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content, 'utf8');
