const supabaseUrl = 'https://cnemtndccfppibecjuep.supabase.co';
const supabaseKey = 'sb_publishable_DhXoLwRfFz1txE63iFDdUg_TivovFvj';

async function test() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`)
  const data = await response.json()
  
  if (data && data.paths) {
      console.log('Available RPCs:');
      Object.keys(data.paths).filter(p => p.startsWith('/rpc/')).forEach(p => console.log(p));
  } else {
      console.log(data);
  }
}
test()
