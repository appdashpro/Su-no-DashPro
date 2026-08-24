const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

content = content.replace(
  '</ResponsiveContainer>\n                \n              </div>\n\n              <div className="mb-8 mt-8">',
  '</ResponsiveContainer>\n                </div>\n              </div>\n\n              <div className="mb-8 mt-8">'
);

fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
