const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
let count = 0;
function walk(folder) {
  for(const entry of fs.readdirSync(folder,{withFileTypes:true})) {
    const file=path.join(folder,entry.name);
    if(entry.isDirectory())walk(file);
    else if(file.endsWith('.js')){const result=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);count++;}
    else if(file.endsWith('.json')){JSON.parse(fs.readFileSync(file,'utf8'));count++;}
  }
}
for(const folder of ['miniprogram','web','scripts','tests'])walk(path.join(root,folder));
const app=JSON.parse(fs.readFileSync(path.join(root,'miniprogram/app.json'),'utf8'));
const pages=[...app.pages,...(app.subPackages||[]).flatMap(pack=>pack.pages.map(page=>pack.root+'/'+page))];
for(const page of pages)for(const suffix of ['.js','.wxml'])if(!fs.existsSync(path.join(root,'miniprogram',page+suffix)))throw new Error(`Missing page ${page+suffix}`);
for(const tab of app.tabBar.list)if(!app.pages.includes(tab.pagePath))throw new Error(`Missing tab ${tab.pagePath}`);
console.log(`Checked ${count} JS/JSON files and ${pages.length} mini program page registrations. WeChat compilation must be checked in developer tools.`);
