const fs = require('fs');
let content = fs.readFileSync('src/components/UsuariosGestao.tsx', 'utf8');

const targetUI = `CREATE OR REPLACE FUNCTION admin_update_user(
  target_user_id UUID,
  new_email TEXT,
  new_password TEXT
) RETURNS boolean AS $$
BEGIN
  -- Atualiza e-mail
  IF new_email IS NOT NULL THEN
    UPDATE auth.users
    SET 
      email = new_email,
      email_confirmed_at = now(),
      updated_at = now()
    WHERE id = target_user_id;
  END IF;

  -- Atualiza senha (apenas se for fornecida)
  IF new_password IS NOT NULL AND length(new_password) >= 6 THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
    WHERE id = target_user_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;\`}`;

const replacementUI = `CREATE OR REPLACE FUNCTION admin_update_user_credentials(
  target_old_email TEXT,
  new_email TEXT,
  new_password TEXT
) RETURNS boolean AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Tenta encontrar o usuário pelo email antigo
  SELECT id INTO v_user_id FROM auth.users WHERE email = target_old_email LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Atualiza e-mail
  IF new_email IS NOT NULL AND new_email != target_old_email THEN
    UPDATE auth.users
    SET 
      email = new_email,
      email_confirmed_at = now(),
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Atualiza senha (apenas se for fornecida)
  IF new_password IS NOT NULL AND length(new_password) >= 6 THEN
    UPDATE auth.users
    SET 
      encrypted_password = crypt(new_password, gen_salt('bf', 10)),
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;\`}`;

content = content.replace(targetUI, replacementUI);
fs.writeFileSync('src/components/UsuariosGestao.tsx', content, 'utf8');
