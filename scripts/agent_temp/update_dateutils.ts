import fs from 'fs';

const filePath = 'src/reports/templates/ConsolidatedVisitsReport.ts';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace("import { formatDate } from '../../utils/dateUtils';", "");

const formatFn = `  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const [y, m, d] = dateString.split('-');
    if (d && m && y) return \`\${d}/\${m}/\${y}\`;
    return new Date(dateString).toLocaleDateString('pt-BR');
  };`;

content = content.replace("const currentDate = new Date().toLocaleDateString('pt-BR');", "const currentDate = new Date().toLocaleDateString('pt-BR');\n" + formatFn);

fs.writeFileSync(filePath, content);
