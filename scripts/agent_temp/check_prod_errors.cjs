const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  // Start the server directly or assume it's running? It's running on 3000!
  // Wait, `npm run build` completed, and then `Restarting dev server...` restarted dev server.
  // The dev server uses `node dist/server.cjs` or `tsx server.ts`?
  // Our package.json has `"dev": "tsx server.ts"`. So port 3000 is DEV.
  // Let's run prod on a different port and test it!

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    localStorage.setItem('dashpro_user', JSON.stringify({
      id: 'test-user', name: 'Test', email: 'test@test.com', role: 'técnico', empresaId: 'test-empresa'
    }));
    localStorage.setItem('@suino-dashpro:integrados', JSON.stringify([
      { id: 'int-1', empresaId: 'test-empresa', name: 'Lote Teste', alojamentoDate: '2023-01-01', status: 'Ativo' }
    ]));
    localStorage.setItem('@suino-dashpro:visits', JSON.stringify([
      { id: 'v1', integradoId: 'int-1', date: '2023-01-10', idade: 10, volumeTotalCargas: 1000, animaisAlojados: 100, animaisMortos: 2, descartesPeriodo: 1, consumoAcumuladoReal: 10, tipoLote: 'Misto', pesoAloj: 20, tratamentos: [{ id: 't1', produto: 'Prod A', motivo: 'M', doseMgKg: 1, duracaoDias: 5 }], avaliacao_tecnica: { granja: { limpeza_baias: 2 } } }
    ]));
  });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  try {
    await new Promise(r => setTimeout(r, 2000));
    const navs = await page.$$("::-p-text(Integrados)");
    if (navs.length > 0) {
      await navs[0].click();
      await new Promise(r => setTimeout(r, 2000));
      const elements2 = await page.$$("::-p-text(Relatório)");
      if (elements2.length > 0) {
        await elements2[0].click();
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch(e) {
    console.error('Error clicking:', e);
  }

  await browser.close();
})();
