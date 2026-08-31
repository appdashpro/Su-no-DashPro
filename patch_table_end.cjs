const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const targetStr = `                     </tbody>
                   </table>
                </div>`;

const replacement = `                     </tbody>
                   </table>
                  </div>
                </div>`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
    console.log("Patched end of table");
} else {
    console.log("Target not found");
}
