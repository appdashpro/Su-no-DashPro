const fs = require('fs');

let file = 'src/components/IntegradoDetailsModal.tsx';
let code = fs.readFileSync(file, 'utf8');

const target = `              </div>
              </>}

              {activeTab === 'tratamentos' && (`;
if (code.includes(target)) {
  console.log("Found");
}

