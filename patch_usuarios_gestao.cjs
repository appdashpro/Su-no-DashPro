const fs = require('fs');
let content = fs.readFileSync('src/components/UsuariosGestao.tsx', 'utf8');

// 1. Add state for RPC Modal
if (!content.includes('isRpcModalOpen')) {
  content = content.replace(
    "const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);",
    "const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);\n  const [isRpcModalOpen, setIsRpcModalOpen] = useState(false);"
  );
}

// 2. Handle the save logic
const saveLogicTarget = `      if (result.success) {
        if (result.authCreated) {
          setSaveSuccess(\`Usuário e Login criados com sucesso no Supabase! Senha definida.\`);
        } else if (result.authError === 'signup_disabled') {`;

const saveLogicReplacement = `      if (result.success) {
        if (result.authError === 'rpc_missing') {
          setError('Para alterar e-mail/senha de um usuário existente, instale a Função SQL (RPC) no Supabase.');
          setIsRpcModalOpen(true);
          return; // Do not close the modal
        }
        
        if (result.authCreated) {
          setSaveSuccess(\`Usuário e credenciais de login atualizados no Supabase com sucesso!\`);
        } else if (result.authError === 'signup_disabled') {`;

content = content.replace(saveLogicTarget, saveLogicReplacement);

// 3. Add the RPC Modal JSX just above the {isSqlModalOpen} modal
const jsBacktick = "`";
const rpcModalJsx = `
      {/* RPC SQL Setup Modal for Updating Users */}
      {isRpcModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Habilitar Alteração de E-mail e Senha
                </h3>
              </div>
              <button
                onClick={() => setIsRpcModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>
            <div className="py-3 text-xs text-slate-600 flex-1 overflow-y-auto">
              <p className="mb-2">
                O Supabase bloqueia a alteração de credenciais (e-mail/senha) diretamente pelo cliente por questões de segurança nativas (Privacidade de Sessão).
              </p>
              <p className="mb-3 text-slate-500">
                Para permitir que o <strong>Acesso Master</strong> atualize os acessos de outros técnicos, precisamos injetar uma permissão segura (RPC) no banco.
                Copie o script abaixo e execute no <strong>SQL Editor</strong> do painel do Supabase.
              </p>
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 font-mono text-[11px] border border-slate-800">
                <pre>{${jsBacktick}-- Função Segura (RPC) para Forçar Atualização de Senha/Email
CREATE OR REPLACE FUNCTION admin_update_user(
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
$$ LANGUAGE plpgsql SECURITY DEFINER;${jsBacktick}}</pre>
              </div>
              <p className="mt-3 text-emerald-600 font-semibold">
                Após executar o script no Supabase, tente clicar em Salvar novamente nesta tela.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setIsRpcModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 font-semibold rounded-lg text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace("{/* Modal Script SQL Supabase Viewer */}", rpcModalJsx + "\n      {/* Modal Script SQL Supabase Viewer */}");

fs.writeFileSync('src/components/UsuariosGestao.tsx', content, 'utf8');
