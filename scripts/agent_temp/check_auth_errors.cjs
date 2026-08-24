const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  page.on('pageerror', error => console.log('PAGE UNCAUGHT ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  // Set auth local storage
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
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
