const { Client } = require('pg');
const connectionString = 'postgresql://postgres.cnemtndccfppibecjuep:DhXoLwRfFz1txE63iFDdUg_TivovFvj@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function runCheck() {
  try {
    await client.connect();
    
    // Check if user exists
    const query = `
      INSERT INTO public.usuarios (id, auth_uid, empresa_id, email, nome, ativo, papel)
      VALUES (
        'f677f168-07b6-4db7-a601-99eda334ff74',
        'f677f168-07b6-4db7-a601-99eda334ff74',
        '00000000-0000-0000-0000-000000000001',
        'rogerfrancescon@gmail.com',
        'rogerfrancescon',
        true,
        'TECNICO_NUTRON'
      )
      ON CONFLICT (id) DO UPDATE SET ativo = true;
    `;
    
    await client.query(query);
    console.log("User inserted successfully");

  } catch (err) {
    console.error("Erro:", err);
  } finally {
    await client.end();
  }
}

runCheck();
