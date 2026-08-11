const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">',
  '<div className="grid grid-cols-2 md:grid-cols-4 gap-2">'
);

// P-5 -> py-2 px-3, rounded-xl -> rounded-md
code = code.replace(
  /className="bg-white border border-slate-200 rounded-xl p-5/g,
  'className="bg-white border border-slate-200 rounded-md py-2 px-3'
);
code = code.replace(
  /className=\{`bg-white border border-slate-200 rounded-xl p-5/g,
  'className={`bg-white border border-slate-200 rounded-md py-2 px-3'
);
code = code.replace(
  /className="bg-blue-600 rounded-xl p-5/g,
  'className="bg-blue-600 rounded-md py-2 px-3'
);

// w-16 h-16 -> w-10 h-10, rounded-bl-[40px] -> rounded-bl-[30px]
code = code.replace(
  /w-16 h-16 bg-slate-100 rounded-bl-\[40px\]/g,
  'w-10 h-10 bg-slate-100 rounded-bl-[30px]'
);
code = code.replace(
  /w-16 h-16 bg-amber-50 rounded-bl-\[40px\]/g,
  'w-10 h-10 bg-amber-50 rounded-bl-[30px]'
);
code = code.replace(
  /w-16 h-16 bg-slate-50 rounded-bl-\[40px\]/g,
  'w-10 h-10 bg-slate-50 rounded-bl-[30px]'
);
code = code.replace(
  /w-24 h-24 bg-blue-500 opacity-50 rounded-bl-\[60px\]/g,
  'w-10 h-10 bg-blue-500 opacity-50 rounded-bl-[30px]'
);

// Title text size
code = code.replace(
  /<p className="text-xs font-bold text-slate-400 uppercase">/g,
  '<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">'
);
code = code.replace(
  /<p className="text-xs font-bold text-blue-100 uppercase">/g,
  '<p className="text-[10px] font-bold text-blue-100 uppercase tracking-wide">'
);

// Values size
code = code.replace(
  /<p className="text-3xl font-bold text-slate-800">/g,
  '<p className="text-lg font-bold text-slate-800 mt-0.5">'
);
code = code.replace(
  /<p className=\{`text-3xl font-bold flex items-center gap-2/g,
  '<p className={`text-lg font-bold flex items-center gap-1 mt-0.5'
);
code = code.replace(
  /<p className="text-3xl font-bold">/g,
  '<p className="text-lg font-bold mt-0.5">'
);

// Subtext size
code = code.replace(
  /<p className="text-xs text-blue-600 font-medium mt-3 relative z-10">/g,
  '<p className="text-[10px] text-blue-600 font-medium mt-1 relative z-10">'
);
code = code.replace(
  /<p className="text-xs text-slate-500 font-medium mt-3 relative z-10">/g,
  '<p className="text-[10px] text-slate-500 font-medium mt-1 relative z-10">'
);
code = code.replace(
  /<p className="text-xs text-blue-200 font-medium mt-3 relative z-10">/g,
  '<p className="text-[10px] text-blue-200 font-medium mt-1 relative z-10">'
);

// Adjust trend icon sizes
code = code.replace(
  /<TrendingUp className="w-6 h-6" \/>/g,
  '<TrendingUp className="w-4 h-4" />'
);
code = code.replace(
  /<TrendingDown className="w-6 h-6" \/>/g,
  '<TrendingDown className="w-4 h-4" />'
);
code = code.replace(
  /<ChevronDown className="w-4 h-4 -rotate-90" \/>/g,
  '<ChevronDown className="w-3.5 h-3.5 -rotate-90" />'
);
code = code.replace(
  /<AlertTriangle className="w-3 h-3 text-amber-500" \/>/g,
  '<AlertTriangle className="w-2.5 h-2.5 text-amber-500" />'
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
