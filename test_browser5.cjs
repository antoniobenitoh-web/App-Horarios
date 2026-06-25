const puppeteer = require('puppeteer');
const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: 'dist' });
});

server.listen(3000, async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 4000));
  
  await page.type('input[type="text"]', 'tony');
  await page.type('input[type="password"]', '1234');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log(bodyHTML);
  
  await browser.close();
  server.close();
});
