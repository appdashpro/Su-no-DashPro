const { createClient } = require('@supabase/supabase-js');
// Utilizando a chave de serviço (service_role) que ultrapassa o RLS para realizar a auditoria.
// Como não temos a chave secreta aqui no container de dev, faremos via anon key,
// mas logando como o usuário do cliente para puxar os dados.

const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';
const supabase = createClient(supabaseUrl, supabaseKey);

async function audit() {
  console.log("Iniciando auditoria no Supabase...\n");
  
  // Login com o usuário fornecido para pegar a sessão
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'wagner_galvan@cargill.com',
    password: 'senha_teste_123'
  });

  if (authErr) {
    console.log("Falha na autenticação via App. Provavelmente a senha mudou ou o ambiente restringe.");
    console.log("Erro:", authErr.message);
    return;
  }

  console.log("✅ Autenticado como:", authData.user.email);
  
  // 1. Checar Lotes e Animais Alojados
  console.log("\n--- AUDITORIA DE LOTES ---");
  const { data: lotes, error: lotesErr } = await supabase.from('lotes').select('id, data_alojamento, animais_alojados, status').order('data_alojamento', { ascending: false }).limit(10);
  
  if (lotesErr) {
     console.error("Erro ao buscar lotes:", lotesErr.message);
  } else {
     console.log(`Encontrados ${lotes.length} lotes recentes.`);
     console.table(lotes);
  }

  // 2. Checar Visitas
  console.log("\n--- AUDITORIA DE VISITAS ---");
  const { data: visitas, error: visitasErr } = await supabase.from('visitas').select('id, data_visita, mortalidade_periodo, tecnico_nome').order('data_visita', { ascending: false }).limit(10);
  
  if (visitasErr) {
     console.error("Erro ao buscar visitas:", visitasErr.message);
  } else {
     console.log(`Encontradas ${visitas.length} visitas recentes.`);
     console.table(visitas);
  }
}
audit();
