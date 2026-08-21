const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://cnemtndccfppibecjuep.supabase.co', 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj');
async function run() {
  const { data, error } = await supabase.from('usuarios').insert({
    id: '3a2bd791-821c-49aa-ad63-193837432ce5',
    auth_uid: '7fedbcc5-1796-4a65-b050-e7f7ff876c92',
    empresa_id: '00000000-0000-0000-0000-000000000001',
    nome: 'Wagner Galvan',
    email: 'wagner_galvan@cargill.com',
    papel: 'TECNICO_NUTRON',
    ativo: true,
    created_at: '2026-08-17T21:08:56.093543+00:00',
    updated_at: '2026-08-17T21:08:55.974+00:00',
    deleted_at: null,
    integrado_padrao_id: null,
    clientes_permitidos: [
      '00000000-0000-0000-0000-000000000002',
      '00000000-0000-0000-0000-000000000001'
    ]
  });
  console.log("Restore result:", error);
}
run();
