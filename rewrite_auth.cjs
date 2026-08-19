const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.ts', 'utf8');

const regex = /\/\/ 2\. If password provided.*?safeStorage\.setItem\(USERS_LIST_KEY, JSON\.stringify\(currentList\)\);/s;

const replacement = `
    const existingIdx = currentList.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const isExistingUser = existingIdx >= 0 || !!user.auth_uid;
    const targetAuthUid = user.auth_uid || (existingIdx >= 0 ? currentList[existingIdx].auth_uid : null);

    // 2. Auth handling (creation or update)
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
      } else if (!isExistingUser && password && password.trim().length >= 6) {
        // CREATE NEW USER via signUp
        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
          const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
          
          const tempAuthClient = createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
          });

          const { data: signUpData, error: signUpError } = await tempAuthClient.auth.signUp({
            email: user.email.toLowerCase().trim(),
            password: password.trim()
          });
          
          if (signUpError) {
            if (signUpError.message?.includes('Signups not allowed') || (signUpError as any).code === 'signup_disabled') {
              authErrorMsg = 'signup_disabled';
            } else if (signUpError.message?.includes('already registered') || signUpError.message?.includes('already exists')) {
              authErrorMsg = 'already_exists';
            } else {
              authErrorMsg = signUpError.message;
            }
          } else if (signUpData?.user) {
            resolvedAuthUid = signUpData.user.id;
            authCreated = true;
          }
        } catch (authErr: any) {
          console.warn('Could not auto-register Supabase auth user:', authErr);
        }
      }
    }

    if (existingIdx >= 0) {
      currentList[existingIdx] = { ...updatedUser, auth_uid: resolvedAuthUid || currentList[existingIdx].auth_uid };
    } else {
      currentList.push({ ...updatedUser, auth_uid: resolvedAuthUid });
    }
    safeStorage.setItem(USERS_LIST_KEY, JSON.stringify(currentList));
`;

content = content.replace(regex, replacement.trim());

fs.writeFileSync('src/lib/auth.ts', content, 'utf8');
