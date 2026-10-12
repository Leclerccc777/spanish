const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../miniprogram/lib/learning');
(async () => {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  const browser = await chromium.launch({ executablePath });
  try {
  const output = path.resolve(__dirname, '../docs/screenshots');
  fs.mkdirSync(output, { recursive: true });
  const requested = new Set(process.argv.slice(2));
  for (const [name, width, height] of [['today-desktop',1440,1000],['today-mobile',390,844],['grammar-b2-mobile',390,844],['expression-mobile',390,844],['bank-desktop',1440,1000],['bank-mobile',390,844],['foundations-mobile',390,844],['year-mobile',390,844],['nouns-desktop',1440,1000],['nouns-mobile',390,844],['noun-quiz-mobile',390,844],['drills-desktop',1440,1000],['drills-mobile',390,844],['drills-b2-mobile',390,844],['drill-reading-mobile',390,844],['drill-review-mobile',390,844],['drill-draft-mobile',390,844],['month-mobile',390,844],['month-desktop',1440,1000]]) {
    if (requested.size && !requested.has(name)) continue;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, timezoneId: 'Asia/Shanghai' });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    if(name==='grammar-b2-mobile'){await page.goto('http://127.0.0.1:4173/#grammar');await page.getByRole('button',{name:'B2',exact:true}).click();}
    if(name.startsWith('bank-')){await page.goto('http://127.0.0.1:4173/#bank');await page.getByRole('button',{name:'全部',exact:true}).click();}
    if(name==='foundations-mobile')await page.goto('http://127.0.0.1:4173/#foundations');
    if(name==='year-mobile')await page.goto('http://127.0.0.1:4173/#year');
    if(name.startsWith('month-'))await page.goto('http://127.0.0.1:4173/#first-month');
    if(name.startsWith('nouns-'))await page.goto('http://127.0.0.1:4173/#nouns');
    if(name.startsWith('drills-')){
      await page.goto('http://127.0.0.1:4173/#drills');
      if(name==='drills-b2-mobile')await page.getByRole('button',{name:'B2',exact:true}).click();
    }
    if(name==='drill-reading-mobile')await page.goto('http://127.0.0.1:4173/#drill/a1-place');
    if(name==='drill-review-mobile'){
      const pack=L.drillPacks[0];await page.goto('http://127.0.0.1:4173/#drill/'+pack.id);await page.getByRole('button',{name:'开始四步练习'}).click();
      for(const [i,q] of pack.questions.entries()){
        if(q.kind==='choice')await page.locator('[data-action="drill-answer"]').filter({hasText:q.answers[0]}).click();
        else{await page.fill('#drill-answer',i===1?'esta':q.answers[0]);await page.getByRole('button',{name:'检查答案',exact:true}).click();}
        await page.getByRole('button',{name:i===3?'保存并查看结果':'下一步'}).click();
      }
      await page.goto('http://127.0.0.1:4173/#drill-review');await page.getByRole('button',{name:'开始集中订正'}).click();
    }
    if(name==='drill-draft-mobile'){
      await page.goto('http://127.0.0.1:4173/#drill/a1-place');await page.fill('#drill-draft','Soy estudiante.');await page.getByRole('button',{name:'保存表达草稿'}).click();
      await page.fill('#drill-draft','Soy estudiante. En mi casa hay una mesa. Mi libro está en la mesa.');await page.getByRole('button',{name:'保存表达草稿'}).click();
      await page.locator('#drill-draft').scrollIntoViewIfNeeded();
    }
    if(name==='noun-quiz-mobile'){
      await page.goto('http://127.0.0.1:4173/#noun/w24');
      await page.getByRole('button',{name:'开始三步练习'}).click();
      await page.getByRole('button',{name:'el',exact:true}).click();
      await page.getByRole('button',{name:'下一步'}).click();
      await page.fill('#noun-answer','fría');
      await page.getByRole('button',{name:'检查答案'}).click();
    }
    if(name==='expression-mobile')await page.goto('http://127.0.0.1:4173/#expression/e1');
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: !name.startsWith('bank-') });
    await page.close();
  }
  console.log('Saved learning preview screenshots (practice previews use empty or unsaved records).');
  } finally { await browser.close(); }
})().catch(error=> { console.error(error); process.exitCode=1; });
