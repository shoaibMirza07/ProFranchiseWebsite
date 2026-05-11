const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  
  await page.goto('http://localhost:3000/en/portfolio/metro-shawarma', { waitUntil: 'networkidle2' });
  
  const minReqText = await page.evaluate(() => {
    return document.body.innerText.includes('Minimum Requirements');
  });
  
  console.log('Is Minimum Requirements visible in text?', minReqText);
  
  await browser.close();
})();
