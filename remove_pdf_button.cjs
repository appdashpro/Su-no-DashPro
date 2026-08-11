const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Remove import html2canvas and jspdf
code = code.replace(/import html2canvas from 'html2canvas-pro';\nimport \{ jsPDF \} from 'jspdf';\n/, "");

// Remove handleExportPDF
const exportFuncRegex = /const handleExportPDF = async \(\) => \{[\s\S]*?\}, 300\);\n  \};/;
code = code.replace(exportFuncRegex, "");

// Remove the button
const buttonRegex = /\{selectedIntegradoIds\.length === 1 && \([\s\S]*?Gerar PDF\n\s*<\/button>\n\s*\)\}/;
code = code.replace(buttonRegex, "");

// Remove isExporting
code = code.replace("const [isDropdownOpen, setIsDropdownOpen] = useState(false);\n  const [isExporting, setIsExporting] = useState(false);", "const [isDropdownOpen, setIsDropdownOpen] = useState(false);");

// Remove the condition for UI hiding
code = code.replace(/\{!isExporting && \(\n\s*<div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">/, '<div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-3">');
code = code.replace(/\)\}\n\s*\{\/\* KPI Cards \*\/\}/, '{/* KPI Cards */}');

// Remove the table we just added
const tableRegex = /\{isExporting && selectedIntegradoIds\.length === 1 && \([\s\S]*?<\/div>\n\s*\)\}/;
code = code.replace(tableRegex, "");

fs.writeFileSync('src/components/Dashboard.tsx', code);
console.log('Removed PDF button completely');
