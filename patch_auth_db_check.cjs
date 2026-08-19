const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

const targetCheck = `      // Check if user exists by email
      const { data: existingDbUser, error: selErr } = await supabase
        .from('usuarios')
        .select('id, auth_uid')
        .eq('email', emailNorm)
        .maybeSingle();

      if (selErr) throw selErr;`;

const replacementCheck = `      // Check if user exists by ID first (handles email changes), then fallback to email
      let existingDbUser = null;
      const validDbId = user.id && !user.id.startsWith('usr_') ? user.id : null;
      
      if (validDbId) {
        const { data: byIdData, error: byIdErr } = await supabase
          .from('usuarios')
          .select('id, auth_uid')
          .eq('id', validDbId)
          .maybeSingle();
          
        if (byIdErr) throw byIdErr;
        existingDbUser = byIdData;
      }
      
      if (!existingDbUser) {
        const { data: byEmailData, error: byEmailErr } = await supabase
          .from('usuarios')
          .select('id, auth_uid')
          .eq('email', emailNorm)
          .maybeSingle();
          
        if (byEmailErr) throw byEmailErr;
        existingDbUser = byEmailData;
      }`;

content = content.replace(targetCheck, replacementCheck);
fs.writeFileSync('src/lib/auth.ts', content, 'utf8');
