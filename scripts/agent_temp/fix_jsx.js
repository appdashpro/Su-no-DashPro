import fs from 'fs';
let code = fs.readFileSync('src/components/MedicationAnalysis.tsx', 'utf8');

const oldStr = `
          </select>
        </div>
      </div>
`;
const newStr = `
          </select>
        </div>
        </div>
      </div>
`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/components/MedicationAnalysis.tsx', code);
