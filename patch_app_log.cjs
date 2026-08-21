const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `     const { data, error } = await supabase.from("empresas").select("*");
     if (!error && data) {
       setEmpresas(data);`,
  `     const { data, error } = await supabase.from("empresas").select("*");
     console.log("LOAD EMPRESAS RESULT:", data, error);
     if (!error && data) {
       setEmpresas(data);`
);

fs.writeFileSync('src/App.tsx', code, 'utf8');
