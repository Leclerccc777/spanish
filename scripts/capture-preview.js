const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const browser = await chromium.launch({ executablePath });
  const output = path.resolve(__dirname, '../docs/screenshots');
  fs.mkdirSync(output, { recursive: true });
  for (const [name, width, height] of [['today-desktop',1440,1000],['today-mobile',390,844],['grammar-b2-mobile',390,844],['expression-mobile',390,844],['bank-desktop',1440,1000],['bank-mobile',390,844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    if(name==='grammar-b2-mobile'){await page.goto('http://127.0.0.1:4173/#grammar');await page.getByRole('button',{name:'B2',exact:true}).click();}
    if(name.startsWith('bank-')){await page.goto('http://127.0.0.1:4173/#bank');await page.getByRole('button',{name:'全部',exact:true}).click();}
    if(name==='expression-mobile')await page.goto('http://127.0.0.1:4173/#expression/e1');
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: !name.startsWith('bank-') });
    await page.close();
  }
  await browser.close();
  console.log('Saved fresh-start, B2 preview, expression and 6500-word bank screenshots.');
})().catch(error=> { console.error(error); process.exitCode=1; });
