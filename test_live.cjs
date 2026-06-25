const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('https://antoniobenitoh-web.github.io/App-Horarios/', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 4000));
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("Live HTML Length:", bodyHTML.length);
  
  await browser.close();
})();
