const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf-8');

// Replace saving logic
code = code.replace(
  /'Tratamentos': v\.tratamentos \? JSON\.stringify\(v\.tratamentos\) : null,/g,
  "'Tratamentos': v.tratamentos && v.tratamentos.length > 0 ? v.tratamentos.map(t => `${t.produto} (${t.doseMgKg}mg/kg, ${t.duracaoDias} dias)`).join(' | ') : null,"
);

// Replace loading logic
const oldLoadLogic = `            tratamentos: (() => {
              try {
                const t = getCol(row, 'Tratamentos');
                if (!t) return undefined;
                return typeof t === 'string' ? JSON.parse(t) : t;
              } catch (e) {
                return undefined;
              }
            })(),`;

const newLoadLogic = `            tratamentos: (() => {
              try {
                const t = getCol(row, 'Tratamentos');
                if (!t) return undefined;
                if (typeof t === 'string') {
                    if (t.startsWith('[')) return JSON.parse(t);
                    // Parse readable text back into object if possible
                    return t.split(' | ').map((str, i) => {
                        const match = str.match(/(.*?)\\s*\\((.*?)mg\\/kg,\\s*(.*?)\\s*dias/);
                        if (match) {
                            return {
                                id: 't_' + i,
                                produto: match[1].trim(),
                                doseMgKg: Number(match[2]),
                                duracaoDias: Number(match[3])
                            };
                        }
                        return { id: 't_' + i, produto: str.trim(), doseMgKg: 0, duracaoDias: 0 };
                    });
                }
                return t;
              } catch (e) {
                return undefined;
              }
            })(),`;

code = code.replace(oldLoadLogic, newLoadLogic);

fs.writeFileSync('src/lib/storage.ts', code);
console.log('patched storage tratamentos');
