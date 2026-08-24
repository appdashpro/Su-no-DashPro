const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`));
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
  await browser.close();
})();
