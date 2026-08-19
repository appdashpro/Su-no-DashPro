const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

const targetLogic = `    // 2. Auth handling (creation or update)
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      if (isExistingUser && targetAuthUid && (password || user.email)) {
        // UPDATE EXISTING USER via RPC
        const { error: rpcError } = await supabase.rpc('admin_update_user', {
          target_user_id: targetAuthUid,
          new_email: user.email.toLowerCase().trim(),
          new_password: password && password.trim().length >= 6 ? password.trim() : null
        });
        
        if (rpcError) {
          if (rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
            authErrorMsg = 'rpc_missing';
          } else {
            authErrorMsg = rpcError.message;
          }
        } else {
          authCreated = true; // Use this flag to indicate auth success
          resolvedAuthUid = targetAuthUid;
        }
      } else if (!isExistingUser && password && password.trim().length >= 6) {`;

const replacementLogic = `    // 2. Auth handling (creation or update)
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      let rpcExecutedSuccessfully = false;
      
      if (isExistingUser && (password || user.email)) {
        const oldEmail = existingIdx >= 0 ? currentList[existingIdx].email.toLowerCase().trim() : user.email.toLowerCase().trim();
        
        // UPDATE EXISTING USER via RPC
        const { data: rpcSuccess, error: rpcError } = await supabase.rpc('admin_update_user_credentials', {
          target_old_email: oldEmail,
          new_email: user.email.toLowerCase().trim(),
          new_password: password && password.trim().length >= 6 ? password.trim() : null
        });
        
        if (rpcError) {
          if (rpcError.message?.includes('function') && rpcError.message?.includes('does not exist')) {
            authErrorMsg = 'rpc_missing';
            rpcExecutedSuccessfully = true; // We don't want to fallback to signup if RPC is missing, we want to show the modal
          } else {
            authErrorMsg = rpcError.message;
            rpcExecutedSuccessfully = true;
          }
        } else if (rpcSuccess === true) {
          authCreated = true; // Use this flag to indicate auth success
          resolvedAuthUid = targetAuthUid;
          rpcExecutedSuccessfully = true;
        }
        // If rpcSuccess === false, the user wasn't found in auth.users. We will let it fallback to signUp.
      }
      
      if (!rpcExecutedSuccessfully && password && password.trim().length >= 6) {`;

content = content.replace(targetLogic, replacementLogic);
fs.writeFileSync('src/lib/auth.ts', content, 'utf8');
