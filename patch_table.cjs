const fs = require('fs');
let content = fs.readFileSync('src/components/IntegradoDetailsModal.tsx', 'utf8');

const targetStr = `                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                   <table className="w-full text-sm text-left">`;

const replacement = `                <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left whitespace-nowrap">`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    // Don't forget to close the div! Where does the table end?
    fs.writeFileSync('src/components/IntegradoDetailsModal.tsx', content);
    console.log("Patched start of table");
} else {
    console.log("Target not found");
}
