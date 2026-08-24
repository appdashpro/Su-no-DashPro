const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  try {
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'scripts/agent_temp/screenshot1.png' });
    const navs = await page.$$("::-p-text(Integrados)");
    if (navs.length > 0) {
      await navs[0].click();
      await new Promise(r => setTimeout(r, 2000));
      await page.screenshot({ path: 'scripts/agent_temp/screenshot2.png' });
      const elements2 = await page.$$("::-p-text(Relatório)");
      if (elements2.length > 0) {
        console.log('Clicking report button on integrados page...');
        await elements2[0].click();
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'scripts/agent_temp/screenshot3.png' });
      } else {
        console.log('Report button not found.');
      }
    }
  } catch(e) {
    console.error('Error clicking:', e);
  }

  await browser.close();
})();
