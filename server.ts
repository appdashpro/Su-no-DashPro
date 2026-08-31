import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ============================================================================
  // ADMIN API: SECURE EDGE FUNCTION FOR USER CREATION
  // ============================================================================
  app.post("/api/admin/create-user", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing Token" });
      }

      const token = authHeader.split(" ")[1];
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cnemtndccfppibecjuep.supabase.co';
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!serviceRoleKey) {
        return res.status(500).json({ error: "Server Configuration Error: Missing Service Role Key" });
      }

      // Initialize Admin Client
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      // 1. Verify the caller's JWT and get their User object
      const { data: { user: callerUser }, error: verifyError } = await supabaseAdmin.auth.getUser(token);
      if (verifyError || !callerUser) {
        return res.status(401).json({ error: "Unauthorized: Invalid Token" });
      }

      // 2. Verify if caller is a MASTER in the database
      const { data: callerProfile, error: profileError } = await supabaseAdmin
        .from('usuarios')
        .select('papel')
        .eq('auth_uid', callerUser.id)
        .single();

      if (profileError || !callerProfile || (callerProfile.papel !== 'MASTER' && callerProfile.papel !== 'SUPER_ADMIN')) {
        return res.status(403).json({ error: "Forbidden: Only MASTER can create users" });
      }

      // 3. Extract new user payload
      const { email, password, nome, papel, empresa_id, clientes_permitidos } = req.body;
      if (!email || !password || !nome || !papel) {
        return res.status(400).json({ error: "Bad Request: Missing required fields" });
      }

      // 4. Create User in Supabase Auth via Admin API
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: password.trim(),
        email_confirm: true
      });

      if (createAuthError) {
        return res.status(400).json({ error: "Auth Creation Failed: " + createAuthError.message });
      }

      const newAuthUid = newAuthUser.user.id;

      // 5. Insert User Profile in `usuarios` table
      const { data: newUserProfile, error: createProfileError } = await supabaseAdmin
        .from('usuarios')
        .insert({
          auth_uid: newAuthUid,
          email: email.toLowerCase().trim(),
          nome: nome,
          papel: papel,
          empresa_id: empresa_id || '00000000-0000-0000-0000-000000000000',
          ativo: true
        })
        .select()
        .single();

      if (createProfileError) {
        // Rollback Auth User if DB insert fails
        await supabaseAdmin.auth.admin.deleteUser(newAuthUid);
        return res.status(500).json({ error: "Profile Creation Failed: " + createProfileError.message });
      }

      // 6. Insert permissions in the new relational table
      if (clientes_permitidos && Array.isArray(clientes_permitidos) && clientes_permitidos.length > 0) {
        const permissoesToInsert = clientes_permitidos.map((emp_id: string) => ({
          usuario_id: newUserProfile.id,
          empresa_id: emp_id
        }));

        const { error: permError } = await supabaseAdmin
          .from('usuario_empresas_permitidas')
          .insert(permissoesToInsert);

        if (permError) {
          console.error("Failed to insert permissions, continuing anyway:", permError);
        }
      }

      return res.status(200).json({ success: true, user: newUserProfile });
    } catch (err: any) {
      console.error("Admin Create User Error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
