const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

const targetLogic = `      if (existingIdToUpdate) {
        const { error: updErr } = await supabase
          .from('usuarios')
          .update(userPayload)
          .eq('id', existingIdToUpdate);
        
        // If update fails because somehow the ID doesn't exist anymore, fallback to insert
        if (updErr) {
          if (updErr.code === 'PGRST116' || updErr.message?.includes('0 rows')) {
             const { error: insErr } = await supabase.from('usuarios').insert({ id: existingIdToUpdate, ...userPayload });
             if (insErr) throw insErr;
          } else {
            throw updErr;
          }
        }
      } else {
        const { error: insErr } = await supabase
          .from('usuarios')
          .insert(userPayload);
        if (insErr) throw insErr;
      }`;

const replacementLogic = `      const { error: upsertErr } = await supabase
        .from('usuarios')
        .upsert({
          id: existingIdToUpdate || undefined,
          ...userPayload
        }, { onConflict: 'id' });
        
      if (upsertErr) {
        console.warn('Upsert failed, trying direct update/insert fallback', upsertErr);
        if (existingIdToUpdate) {
          const { error: updErr } = await supabase.from('usuarios').update(userPayload).eq('id', existingIdToUpdate);
          if (updErr) throw updErr;
        } else {
          const { error: insErr } = await supabase.from('usuarios').insert(userPayload);
          if (insErr) throw insErr;
        }
      }`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/lib/auth.ts', content, 'utf8');
