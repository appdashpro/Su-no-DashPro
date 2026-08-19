const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.cnemtndccfppibecjuep:DhXoLwRfFz1txE63iFDdUg_TivovFvj@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
});
client.connect()
  .then(() => client.query('SELECT count(*) FROM public.lotes'))
  .then(res => console.log('Lotes:', res.rows[0].count))
  .catch(err => console.error(err.message))
  .finally(() => client.end());
