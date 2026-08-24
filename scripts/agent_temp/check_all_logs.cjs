const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    localStorage.setItem('dashpro_user', JSON.stringify({
      id: 'test-user',
      name: 'Test User',
      email: 'test@test.com',
      role: 'técnico',
      empresaId: 'test-empresa'
    }));
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
