import fs from 'fs';

let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

// 1. Add Legend to recharts import
if (!code.includes("Legend")) {
  code = code.replace(
    "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';",
    "import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';"
  );
}

// 2. Add chartProducts memo before chartData
const chartProductsStr = `
  const chartProducts = useMemo(() => {
    return Array.from(new Set(periodFilteredData.map(t => t.produto))).sort();
  }, [periodFilteredData]);

  // Chart Data
`;
if (!code.includes("const chartProducts = useMemo")) {
  code = code.replace("  // Chart Data", chartProductsStr);
}

// 3. Update chartData definition
const oldChartData = `  const chartData = useMemo(() => {
    const grouped = periodFilteredData.reduce((acc, t) => {
      const dateObj = new Date(t.visitDate);
      const key = format(dateObj, 'yyyy-MM');
      const label = format(dateObj, 'MMM/yy', { locale: ptBR });
      
      if (!acc[key]) {
        acc[key] = { key, label, kg: 0 };
      }
      acc[key].kg += t.produtoConsumidoKg;
      return acc;
    }, {} as Record<string, { key: string, label: string, kg: number }>);

    return Object.values(grouped)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => ({
        name: item.label,
        kg: Number(item.kg.toFixed(1))
      }));
  }, [periodFilteredData]);`;

const newChartData = `  const chartData = useMemo(() => {
    const grouped = periodFilteredData.reduce((acc, t) => {
      const dateObj = new Date(t.visitDate);
      const key = format(dateObj, 'yyyy-MM');
      const label = format(dateObj, 'MMM/yy', { locale: ptBR });
      
      if (!acc[key]) {
        acc[key] = { key, label, total: 0 };
      }
      if (!acc[key][t.produto]) {
        acc[key][t.produto] = 0;
      }
      acc[key][t.produto] += t.produtoConsumidoKg;
      acc[key].total += t.produtoConsumidoKg;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(item => {
        const formattedItem: any = { name: item.label };
        Object.keys(item).forEach(k => {
          if (k !== 'key' && k !== 'label' && k !== 'total') {
            formattedItem[k] = Number(item[k].toFixed(2));
          }
        });
        return formattedItem;
      });
  }, [periodFilteredData]);

  const COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#84cc16',
    '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#0ea5e9'
  ];`;

code = code.replace(oldChartData, newChartData);

// 4. Replace BarChart JSX
const oldBarChart = `              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [\`\${Number(value).toLocaleString('pt-BR')} kg\`, 'Consumo']}
                />
                <Bar dataKey="kg" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>`;

const newBarChart = `              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: string) => [\`\${Number(value).toLocaleString('pt-BR')} kg\`, name]}
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

code = code.replace(oldBarChart, newBarChart);

fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
console.log("Patched chart data successfully");
