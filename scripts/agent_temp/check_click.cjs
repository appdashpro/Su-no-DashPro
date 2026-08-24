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
  
  try {
    await new Promise(r => setTimeout(r, 1000));
    // Login if needed or just navigate? The app uses local storage, maybe we need to set state to logged in.
    // Wait, in previous tests I saw the Integrados tab, so maybe it's accessible.
    const navs = await page.$$("::-p-text(Integrados)");
    if (navs.length > 0) {
      await navs[0].click();
      await new Promise(r => setTimeout(r, 1000));
      const elements2 = await page.$$("::-p-text(Relatório)");
      if (elements2.length > 0) {
        console.log('Clicking report button on integrados page...');
        await elements2[0].click();
        await new Promise(r => setTimeout(r, 1000));
      }
    } else {
      console.log('Integrados tab not found');
    }
  } catch(e) {
    console.error('Error clicking:', e);
  }

  await browser.close();
})();
