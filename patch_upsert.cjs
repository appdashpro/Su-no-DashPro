const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

const targetLogic = `      // Check if user exists by ID first (handles email changes), then fallback to email
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
      }

      const userPayload = {
        auth_uid: resolvedAuthUid || user.auth_uid || (existingDbUser ? existingDbUser.auth_uid : null) || crypto.randomUUID(),
        email: emailNorm,
        nome: user.nome,
        papel: user.papel,
        empresa_id: user.empresa_id || '00000000-0000-0000-0000-000000000001',
        integrado_padrao_id: updatedUser.integrado_padrao_id || null,
        clientes_permitidos: allowedIntegradoIds,
        ativo: true,
        updated_at: new Date().toISOString()
      };

      if (existingDbUser) {
        const { error: updErr } = await supabase
          .from('usuarios')
          .update(userPayload)
          .eq('id', existingDbUser.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('usuarios')
          .insert({
            id: user.id && !user.id.startsWith('usr_') ? user.id : undefined,
            ...userPayload
          });
        if (insErr) throw insErr;
      }`;

const replacementLogic = `      const validDbId = user.id && !user.id.startsWith('usr_') ? user.id : null;

      // 1. Determine existing user to preserve auth_uid if needed
      let existingAuthUid = null;
      let existingIdToUpdate = validDbId;

      if (validDbId) {
        const { data: byId } = await supabase.from('usuarios').select('id, auth_uid').eq('id', validDbId).maybeSingle();
        if (byId) existingAuthUid = byId.auth_uid;
      } else {
        const { data: byEmail } = await supabase.from('usuarios').select('id, auth_uid').eq('email', emailNorm).maybeSingle();
        if (byEmail) {
          existingAuthUid = byEmail.auth_uid;
          existingIdToUpdate = byEmail.id;
        }
      }

      const userPayload = {
        auth_uid: resolvedAuthUid || user.auth_uid || existingAuthUid || crypto.randomUUID(),
        email: emailNorm,
        nome: user.nome,
        papel: user.papel,
        empresa_id: user.empresa_id || '00000000-0000-0000-0000-000000000001',
        integrado_padrao_id: updatedUser.integrado_padrao_id || null,
        clientes_permitidos: allowedIntegradoIds,
        ativo: true,
        updated_at: new Date().toISOString()
      };

      if (existingIdToUpdate) {
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

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/lib/auth.ts', content, 'utf8');
