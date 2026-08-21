const fs = require('fs');
let code = fs.readFileSync('src/components/UsuariosGestao.tsx', 'utf8');

const modalCode = `
      {/* Modal Confirmar Exclusão */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remover Usuário</h3>
            <p className="text-sm text-slate-600 mb-6">
              Tem certeza que deseja remover o usuário <strong className="text-slate-900">{userToDelete.nome}</strong> ({userToDelete.email})? 
              <br/><br/>
              Ele perderá o acesso ao sistema. O histórico de visitas vinculadas será mantido em segurança.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
              >
                Remover Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/    <\/div>\s*  \);\s*}\s*$/, modalCode + '\n}');
fs.writeFileSync('src/components/UsuariosGestao.tsx', code, 'utf8');
