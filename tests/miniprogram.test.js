const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const L = require('../miniprogram/lib/learning');
function runtime() {
  let saved=null, clipboard=''; const messages=[]; const routes=[];
  const wx={getStorageSync(){return structuredClone(saved);},setStorageSync(key,value){saved=structuredClone(value);},showToast(x){messages.push(x.title);},navigateTo(x){routes.push(x.url);},redirectTo(x){routes.push(x.url);},switchTab(x){routes.push(x.url);},setClipboardData(x){clipboard=x.data;if(x.success)x.success();},getClipboardData(x){x.success({data:clipboard});},showModal(x){x.success({confirm:true});}};
  function loadPage(name) {
    let page; const file=path.resolve(__dirname,`../miniprogram/pages/${name}/index.js`);
    const storageModule={exports:{}};
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname,'../miniprogram/lib/storage.js'),'utf8'),{require(){return L;},wx,module:storageModule});
    const storage=storageModule.exports;
    vm.runInNewContext(fs.readFileSync(file,'utf8'),{require(id){return id.endsWith('learning')?L:storage;},Page(value){page=value;},wx,Set,Date,Number,Array},{filename:file});
    page.data=structuredClone(page.data||{});page.setData=function(value){Object.assign(this.data,value);}; return page;
  }
  return {loadPage,wx,messages,routes,get state(){return L.restore(saved);}};
}
test('原生页面串联：翻词卡、失败重排、语法练习、自动打卡与页面重载',()=>{
  const r=runtime(); const session=r.loadPage('session'); session.onLoad(); assert.equal(session.data.word.id,'w1');
  session.reveal();session.rate({currentTarget:{dataset:{rating:'again'}}});assert.equal(session.items.length,6);
  while(!session.data.done){session.reveal();session.rate({currentTarget:{dataset:{rating:'remember'}}});}
  assert.equal(session.data.summary.day.words.length,5);assert.equal(session.data.summary.checkedIn,false);
  const lesson=r.loadPage('lesson');lesson.onLoad({id:'g1'});lesson.begin();
  for(const q of L.course.lessons[0].questions){lesson.choose({currentTarget:{dataset:{index:q.answer}}});lesson.next();}
  assert.equal(lesson.data.result.passed,true);assert.equal(lesson.data.summary.checkedIn,true);
  const today=r.loadPage('today');today.onShow();assert.equal(today.data.streak,1);assert.equal(today.data.learned,5);
  const progress=r.loadPage('progress');progress.onShow();assert.equal(progress.data.calendar.length,14);assert.equal(progress.data.checkins,1);
});
test('原生语法页拒绝直接打开尚未解锁的单元',()=>{const r=runtime();const lesson=r.loadPage('lesson');lesson.onLoad({id:'g8'});assert.equal(lesson.data.unavailable,true);lesson.begin();assert.equal(lesson.data.phase,'read');});
test('原生搜索与单元筛选提供空结果，后续单元只可预览',()=>{const r=runtime();const page=r.loadPage('vocabulary');page.onShow();assert.equal(page.data.count,320);page.search({detail:{value:'不存在的词'}});assert.equal(page.data.count,0);page.search({detail:{value:''}});page.filter({detail:{value:'2'}});assert.equal(page.data.count,10);assert.ok(page.data.words.every(w=>w.locked));});
test('原生备份往返恢复进度，取消与无效备份保留当前数据',()=>{
  const r=runtime(); const s=L.emptyState(); L.review(s,'w1','remember');r.wx.setStorageSync('',s);
  const progress=r.loadPage('progress');progress.onShow();progress.exportData();
  r.wx.setStorageSync('',L.emptyState());progress.importData();assert.equal(L.summary(r.state).learned,1);
  r.wx.setStorageSync('',L.emptyState());r.wx.showModal=x=>x.success({confirm:false});progress.importData();assert.equal(L.summary(r.state).learned,0);
  r.wx.setClipboardData({data:'this is not JSON'});progress.importData();assert.equal(L.summary(r.state).learned,0);assert.ok(r.messages.some(m=>m.includes('不是受支持')));
});
test('原生写入失败不前进词卡，也不显示已保存进度',()=>{
  const r=runtime();const session=r.loadPage('session');session.onLoad();session.reveal();
  r.wx.setStorageSync=()=>{throw new Error('quota exceeded');};session.rate({currentTarget:{dataset:{rating:'remember'}}});
  assert.equal(session.data.word.id,'w1');assert.equal(L.summary(r.state).learned,0);assert.ok(r.messages.some(m=>m.includes('未保存')));
});
test('原生词汇测验答错只重排一次，订正不抬高首答正确率',()=>{
 const r=runtime(),p=r.loadPage('wordquiz');p.onLoad({});p.begin();
 p.answer('错误');assert.equal(r.state.days[L.dateKey()].words.length,0);p.next();
 while(p.data.phase==='quiz'){const w=p.words[p.index];p.answer(w.meaning);p.next();}
 assert.equal(p.data.score,80);assert.equal(p.words.length,6);assert.equal(r.state.days[L.dateKey()].words.length,5);assert.equal(L.wrongWords(r.state).length,0);
 const empty=r.loadPage('wordquiz');empty.onLoad({wrong:'1'});empty.begin();assert.equal(empty.data.phase,'empty');
});
test('原生输出任务存草稿、提交、重载；锁定与写入失败不产生已保存反馈',()=>{
 const r=runtime(),p=r.loadPage('expression'),task=L.course.tasks[0];p.onLoad({id:'e1'});
 p.input({detail:{value:task.model}});p.save();assert.equal(r.state.expressions.e1.attempts,0);
 p.submit();assert.equal(p.data.result.complete,true);p.model();assert.equal(p.data.showModel,true);
 const reload=r.loadPage('expression');reload.onLoad({id:'e1'});assert.equal(reload.data.text,task.model);assert.equal(reload.data.result.complete,true);
 const locked=r.loadPage('expression');locked.onLoad({id:'final'});assert.equal(locked.data.locked,true);locked.submit();assert.equal(r.state.expressions.final,undefined);
 reload.input({detail:{value:'Hola, Ana.'}});r.wx.setStorageSync=()=>{throw new Error('quota');};reload.submit();assert.equal(reload.data.result,null);assert.equal(r.state.expressions.e1.text,task.model);
});
test('原生分级导航显示后续主题并提供输出题目预览',()=>{
 const r=runtime(),p=r.loadPage('grammar');p.onShow();assert.equal(p.data.units.length,8);
 p.select({currentTarget:{dataset:{level:'B2'}}});assert.ok(p.data.units.every(u=>u.levelCode==='B2'&&u.locked));
 p.expression({currentTarget:{dataset:{id:'e25'}}});assert.equal(r.routes.at(-1),'/pages/expression/index?id=e25');
});
