const fs = require('fs');
const file = 'src/components/IntegradoDetailsModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div className="mt-8 mb-4 border-t border-slate-100 pt-6">[\s\S]*?<\/ComposedChart>\s*<\/ResponsiveContainer>\s*<\/div>\s*<\/div>/;

if (regex.test(content)) {
  content = content.replace(regex, '');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Success');
} else {
  console.log('Regex did not match');
}
