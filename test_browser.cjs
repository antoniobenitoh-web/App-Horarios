const puppeteer = require('puppeteer');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(3000, async () => {
  console.log('Running at http://localhost:3000');
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:3000');
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // Evaluate innerHTML
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log("Body HTML length:", bodyHTML.length);
  
  await browser.close();
  server.close();
});
