const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

const targetLogic = `{userProfile && (
          <div className="px-1 mb-1 mt-1">`;

const replacementLogic = `{userProfile && isMaster && (
          <div className="px-1 mb-1 mt-1">`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
