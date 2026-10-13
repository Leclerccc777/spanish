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
    vm.runInNewContext(fs.readFileSync(file,'utf8'),{require(id){if (id.endsWith('learning')) return L; if (id.endsWith('storage')) return storage; return require(path.resolve(path.dirname(file), id));},Page(value){page=value;},wx,Set,Date,Number,Array},{filename:file});
    page.data=structuredClone(page.data||{});page.setData=function(value){Object.assign(this.data,value);}; return page;
  }
  return {loadPage,wx,messages,routes,get state(){return L.restore(saved);}};
}
test('原生名词选冠词、输入配合、完整句、错项重练与刷新保存', () => {
  const r=runtime(), p=r.loadPage('nouns'); p.onLoad(); assert.equal(p.data.lessons.length,8);
  p.open({currentTarget:{dataset:{id:'w24'}}}); assert.equal(p.data.lesson.gender,'阴性'); p.begin();
  p.choose({currentTarget:{dataset:{answer:'la'}}}); assert.equal(p.data.feedback.correct,false); p.next();
  p.input({detail:{value:'frío'}}); p.submit(); p.next();
  p.input({detail:{value:'El agua está fría.'}}); p.submit(); p.next();
  assert.equal(p.data.result.score,33); assert.equal(L.nounProgress(r.state).find(n=>n.id==='w24').mistakes.length,2);
  const reload=r.loadPage('nouns'); reload.onLoad(); assert.equal(reload.data.lessons.find(n=>n.id==='w24').bestScore,33);
  reload.open({currentTarget:{dataset:{id:'w24'}}});reload.begin();
  for (const q of reload.lesson.questions) {reload.answer(q.answer); reload.next();}
  assert.equal(reload.data.result.score,100); assert.deepEqual(r.state.nounMistakes,{}); assert.deepEqual(r.state.days,{});
  assert.equal(L.summary(r.state).learned,0);
  const today=r.loadPage('today'); today.nouns();assert.equal(r.routes.at(-1),'/pages/nouns/index');
});
test('原生两类练习的提示默认收起，输入保留，翻题重置且不写成绩', () => {
  for (const [name, id, answer] of [['nouns', 'w24', 'el'], ['drills', 'a1-place', 'soy']]) {
    const r = runtime(), p = r.loadPage(name);
    p.onLoad({ id }); p.begin();
    assert.equal(p.data.showHint, false);
    p.input({ detail: { value: '正在思考' } });
    p.hint(); assert.equal(p.data.showHint, true);
    assert.equal(p.data.input, '正在思考');
    assert.ok(p.data.question.hint);
    assert.deepEqual(r.state, L.emptyState());
    p.answer(answer); p.hint();
    assert.equal(p.data.feedback.correct, true);
    p.next(); assert.equal(p.data.showHint, false);
    assert.equal(p.data.input, '');
    assert.deepEqual(r.state, L.emptyState());
  }
});
test('原生订正提示不清除错项或提高原包分数', () => {
  const r = runtime(), state = L.emptyState(), pack = L.drillPacks[0];
  const answers = pack.questions.map(q => q.answers[0]); answers[1] = 'esta';
  L.gradeDrill(state, pack.id, answers); r.wx.setStorageSync('', state);
  const p = r.loadPage('drillreview'); p.onLoad(); p.begin(); p.hint();
  assert.equal(p.data.showHint, true);
  assert.deepEqual(r.state, state);
  p.input({ detail: { value: 'esta' } }); p.submit();
  assert.match(p.data.feedback.attention, /重音/);
  p.next(); assert.equal(p.data.showHint, false);
  assert.equal(r.state.drills[pack.id].bestScore, 75);
});
test('原生短文大意默认收起，预览不开放练习，读后答题不显示翻译', () => {
  const r = runtime(), p = r.loadPage('drills');
  p.onLoad({ id: 'b2-report' }); assert.equal(p.data.showMeaning, false);
  p.meaning(); assert.equal(p.data.showMeaning, true);
  assert.ok(p.data.pack.meaning); p.begin(); assert.equal(p.data.phase, 'read');
  p.open({ currentTarget: { dataset: { id: 'a1-place' } } });
  assert.equal(p.data.showMeaning, false); p.meaning(); p.begin();
  assert.equal(p.data.phase, 'quiz');
  p.meaning(); assert.equal(p.data.phase, 'quiz');
  assert.deepEqual(r.state, L.emptyState());
});
test('原生 A1–B2 递进包真实作答至 B2，保存草稿和错项，不产生主课程进度', () => {
  const r=runtime(),p=r.loadPage('drills');p.onLoad();assert.equal(p.data.packs.length,6);
  p.select({currentTarget:{dataset:{level:'B2'}}});p.open({currentTarget:{dataset:{id:'b2-report'}}});assert.equal(p.data.unlocked,false);p.begin();assert.equal(p.data.phase,'read');
  for(const pack of L.drillPacks){
    p.open({currentTarget:{dataset:{id:pack.id}}});assert.equal(p.data.unlocked,true);p.begin();
    for(const [i,q] of pack.questions.entries()){
      if(q.kind==='choice')p.choose({currentTarget:{dataset:{answer:q.answers[0]}}});
      else{p.input({detail:{value:i===1?'wrong':q.answers[0]}});p.submit();}
      p.next();
    }
    assert.equal(p.data.result.score,75);assert.equal(p.data.phase,'result');p.next();assert.equal(r.state.drills[pack.id].attempts,1);
    p.output();p.draft({detail:{value:pack.output.model}});p.save();p.model();assert.equal(p.data.showModel,true);
  }
  assert.equal(Object.keys(r.state.drills).length,24);assert.equal(Object.keys(r.state.drillMistakes).length,24);assert.deepEqual(r.state.days,{});assert.deepEqual(r.state.lessons,{});
  const reload=r.loadPage('drills');reload.onLoad({id:'b2-report'});assert.equal(reload.data.text,L.drillPacks[11].output.model);assert.equal(reload.data.saved,true);
  reload.begin();for(const q of reload.pack.questions){reload.answer(q.answers[0]);reload.next();}
  assert.equal(r.state.drillMistakes['b2-report-q2'],undefined);assert.equal(r.state.drills['b2-report'].bestScore,100);
});
test('原生递进包保存失败保留最终提交和未保存草稿，恢复后重试', () => {
  const r=runtime(),p=r.loadPage('drills');p.onLoad({id:'a1-place'});p.begin();p.submit();assert.equal(p.data.feedback,null);
  for(const q of p.pack.questions.slice(0,3)){p.answer(q.answers[0]);p.next();}p.answer(p.pack.questions[3].answers[0]);
  const save=r.wx.setStorageSync;r.wx.setStorageSync=()=>{throw new Error('quota');};p.next();assert.equal(p.data.phase,'quiz');assert.deepEqual(r.state.drills,{});
  r.wx.setStorageSync=save;p.next();assert.equal(p.data.phase,'result');assert.equal(r.state.drills['a1-place'].attempts,1);
  p.output();p.draft({detail:{value:'Soy estudiante.'}});r.wx.setStorageSync=()=>{throw new Error('quota');};p.save();assert.equal(p.data.dirty,true);assert.equal(p.data.saved,false);p.model();assert.equal(p.data.showModel,false);
  r.wx.setStorageSync=save;p.save();assert.equal(p.data.dirty,false);assert.equal(r.state.drillDrafts['a1-place'].text,'Soy estudiante.');
});
test('原生递进预览不能保存草稿；首页与语法页入口可达', () => {
  const r=runtime(),p=r.loadPage('drills');p.onLoad({id:'a2-weekend'});p.draft({detail:{value:'preview'}});p.save();assert.deepEqual(r.state.drillDrafts,{});
  p.previous();assert.equal(p.data.pack.id,'a1-likes');assert.equal(p.data.unlocked,false);
  const today=r.loadPage('today');today.drills();assert.equal(r.routes.at(-1),'/pages/drills/index');
  const grammar=r.loadPage('grammar');grammar.drills();assert.equal(r.routes.at(-1),'/pages/drills/index');
});
test('原生集中订正限次重排，首次正确率保持原值，包成绩不变', () => {
  const r=runtime(),s=L.emptyState(),pack=L.drillPacks[0],a=pack.questions.map(q=>q.answers[0]);a[1]='bad';L.gradeDrill(s,pack.id,a);r.wx.setStorageSync('',s);
  const p=r.loadPage('drillreview');p.onLoad();assert.equal(p.data.count,1);p.begin();p.input({detail:{value:'esta'}});p.submit();p.next();assert.equal(p.items.length,2);
  p.input({detail:{value:'está'}});p.submit();p.next();assert.equal(p.data.score,0);assert.equal(p.data.count,0);assert.equal(r.state.drills[pack.id].bestScore,75);assert.deepEqual(r.state.days,{});
  p.next();assert.equal(p.data.score,0);p.setup();p.begin();assert.equal(p.data.phase,'empty');
});
test('原生集中订正写入失败不显示已订正，恢复后重试', () => {
  const r=runtime(),s=L.emptyState(),pack=L.drillPacks[0],a=pack.questions.map(q=>q.answers[0]);a[1]='bad';L.gradeDrill(s,pack.id,a);r.wx.setStorageSync('',s);
  const p=r.loadPage('drillreview');p.onLoad();p.begin();p.input({detail:{value:'está'}});const save=r.wx.setStorageSync;r.wx.setStorageSync=()=>{throw new Error('quota');};p.submit();
  assert.equal(p.data.feedback,null);assert.equal(L.drillWrongQuestions(r.state).length,1);r.wx.setStorageSync=save;p.submit();assert.equal(p.data.feedback.correct,true);assert.equal(L.drillWrongQuestions(r.state).length,0);
});
test('原生表达自查、修订恢复和保存失败保留文字与旧版本', () => {
  const r=runtime(),p=r.loadPage('drills');p.onLoad({id:'a1-place'});p.draft({detail:{value:'Soy estudiante.'}});p.save();p.checks({detail:{value:['0','2']}});assert.deepEqual(r.state.drillDrafts['a1-place'].checks,[0,2]);
  p.draft({detail:{value:'Estoy en casa.'}});p.resetDraft();assert.equal(p.data.text,'Soy estudiante.');assert.equal(p.data.rubricRows[0].checked,true);
  p.draft({detail:{value:'Estoy en casa.'}});p.save();assert.equal(p.data.revisions,2);assert.deepEqual(r.state.drillDrafts['a1-place'].checks,[]);
  const save=r.wx.setStorageSync;r.wx.setStorageSync=()=>{throw new Error('quota');};p.revertDraft();assert.equal(p.data.text,'Estoy en casa.');assert.equal(r.state.drillDrafts['a1-place'].revisions,2);
  r.wx.setStorageSync=save;p.revertDraft();assert.equal(p.data.text,'Soy estudiante.');assert.equal(p.data.revisions,3);
  const reload=r.loadPage('drills');reload.onLoad({id:'a1-place'});assert.equal(reload.data.hasPrevious,true);assert.equal(reload.data.text,'Soy estudiante.');
});
test('原生前四周开始、每日勾选、未来预览与年度入口',()=>{
  const r=runtime(),p=r.loadPage('firstmonth');p.onLoad();assert.equal(p.data.canCheck,false);p.start();assert.equal(p.data.canCheck,true);
  p.check({currentTarget:{dataset:{id:'focus'}}});assert.equal(r.state.monthChecks[1].tasks[0],'focus');
  p.select({detail:{value:10}});assert.equal(p.data.canCheck,false);p.check({currentTarget:{dataset:{id:'focus'}}});assert.equal(r.state.monthChecks[11],undefined);
  p.current();assert.equal(p.data.selectedDay,1);p.target();assert.equal(r.routes.at(-1),'/pages/foundations/index?id=sounds');
  const year=r.loadPage('year');year.month();assert.equal(r.routes.at(-1),'/pages/firstmonth/index');
  const reload=r.loadPage('firstmonth');reload.onLoad();assert.equal(reload.data.tasks.find(t=>t.id==='focus').checked,true);assert.deepEqual(r.state.days,{});
});
test('原生每日任务写入失败保持未勾选，锁定课程不会因任务日开放',()=>{
  const r=runtime(),p=r.loadPage('firstmonth');p.onLoad();p.start();const save=r.wx.setStorageSync;r.wx.setStorageSync=()=>{throw new Error('quota');};p.check({currentTarget:{dataset:{id:'output'}}});assert.equal(p.data.tasks[2].checked,false);
  r.wx.setStorageSync=save;p.check({currentTarget:{dataset:{id:'output'}}});assert.equal(p.data.tasks[2].checked,true);
  p.select({detail:{value:14}});p.target();assert.equal(r.routes.length,0);assert.ok(r.messages.some(m=>m.includes('课程的词汇')));
});
test('原生首页建议优先订正，进度页按等级显示并可进入指定等级',()=>{
  const r=runtime(),s=L.emptyState(),pack=L.drillPacks[0],a=pack.questions.map(q=>q.answers[0]);a[1]='wrong';L.gradeDrill(s,pack.id,a);r.wx.setStorageSync('',s);
  const today=r.loadPage('today');today.onShow();assert.equal(today.data.practice.wrong,1);today.continuePractice();assert.equal(r.routes.at(-1),'/pages/drillreview/index');
  const progress=r.loadPage('progress');progress.onShow();assert.equal(progress.data.practice.levels[0].passed,1);assert.equal(progress.data.practice.passed,1);progress.drills({currentTarget:{dataset:{level:'B2'}}});assert.equal(r.routes.at(-1),'/pages/drills/index?level=B2');
  const drills=r.loadPage('drills');drills.onLoad({level:'B2'});assert.equal(drills.data.level,'B2');assert.equal(drills.data.packs.length,6);
});
test('原生周指南随周次改变，课程前置保持，短阅读可预览',()=>{
  const r=runtime(),p=r.loadPage('year');p.onShow();assert.equal(p.data.guideDays.length,7);const first=p.data.guideDays[1].steps[0];
  p.move({currentTarget:{dataset:{step:28}}});assert.equal(p.data.selectedWeek,29);assert.notEqual(p.data.guideDays[1].steps[0],first);
  const lesson=p.data.guideDays[1].target;p.guide({currentTarget:{dataset:{kind:lesson.kind,id:lesson.id}}});assert.equal(r.routes.length,0);
  const reading=p.data.guideDays[3].target;p.guide({currentTarget:{dataset:{kind:reading.kind,id:reading.id}}});assert.equal(r.routes.at(-1),'/pages/drills/index?id='+reading.id);
});
test('原生名词写入失败保留最终提交入口，重试只保存一次', () => {
  const r=runtime(),p=r.loadPage('nouns');p.onLoad({id:'w18'});p.begin();
  p.submit();assert.equal(p.data.feedback,null);assert.ok(r.messages.some(m=>m.includes('请先填写')));
  for(const q of p.lesson.questions.slice(0,2)){p.answer(q.answer);p.next();}
  p.answer(p.lesson.questions[2].answer);
  const save=r.wx.setStorageSync;r.wx.setStorageSync=()=>{throw new Error('quota');};p.next();
  assert.equal(p.data.phase,'quiz');assert.equal(p.data.input,'Los países son pequeños.');assert.deepEqual(r.state.nounPractice,{});
  r.wx.setStorageSync=save;p.next();assert.equal(p.data.phase,'result');p.next();assert.equal(r.state.nounPractice.w18.attempts,1);
});
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
test('原生读取失败不写临时空记录，也不导出空备份，读取恢复后保留旧进度',()=>{
  const r=runtime(),s=L.emptyState();L.review(s,'w1','remember');r.wx.setStorageSync('',s);r.wx.setClipboardData({data:'keep-me'});
  const read=r.wx.getStorageSync,write=r.wx.setStorageSync;let writes=0,clips=0;r.wx.getStorageSync=()=>{throw new Error('read failed');};r.wx.setStorageSync=(k,v)=>{writes++;write(k,v);};r.wx.setClipboardData=()=>{clips++;};
  const p=r.loadPage('session');p.onLoad();p.reveal();p.rate({currentTarget:{dataset:{rating:'remember'}}});assert.equal(writes,0);assert.equal(p.data.word.id,'w1');assert.deepEqual(r.state,s);
  const progress=r.loadPage('progress');progress.onShow();assert.equal(progress.data.readFailed,true);progress.exportData();assert.equal(clips,0);
  r.wx.getStorageSync=read;p.rate({currentTarget:{dataset:{rating:'remember'}}});assert.equal(writes,1);assert.equal(L.summary(r.state).learned,1);assert.equal(r.state.reviews.w1.interval,s.reviews.w1.interval);assert.equal(r.state.reviews.w1.repetitions,s.reviews.w1.repetitions+1);
});
test('原生不覆盖未知版本，显式导入兼容备份后正常保存',()=>{
  const r=runtime(),raw={version:2,reviews:{future:'opaque'},days:{},lessons:{}};r.wx.setStorageSync('',raw);const write=r.wx.setStorageSync;let writes=0;r.wx.setStorageSync=(k,v)=>{writes++;write(k,v);};
  const p=r.loadPage('foundations');p.onLoad();p.open({currentTarget:{dataset:{id:'sounds'}}});p.begin();for(const q of p.lesson.questions){p.choose({currentTarget:{dataset:{index:q.answer}}});p.next();}
  assert.equal(writes,0);assert.deepEqual(r.wx.getStorageSync(''),raw);assert.equal(p.data.phase,'quiz');
  const s=L.emptyState();L.review(s,'w1','remember');r.wx.setClipboardData({data:JSON.stringify(s)});const progress=r.loadPage('progress');progress.importData();assert.equal(writes,1);assert.equal(L.summary(r.state).learned,1);
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
test('原生扩展词库分页、阶段预览、训练范围持久化与词包学习',()=>{
 const r=runtime(),p=r.loadPage('bank');p.onShow();assert.equal(p.data.count,800);assert.equal(p.data.words.length,30);assert.equal(p.data.packs.length,6);
 p.select({currentTarget:{dataset:{level:''}}});assert.equal(p.data.count,6500);p.paginate({currentTarget:{dataset:{step:1}}});assert.equal(p.data.page,1);
 p.search({detail:{value:'不会出现的中文'}});assert.equal(p.data.count,0);assert.equal(p.data.page,0);
 p.search({detail:{value:''}});p.select({currentTarget:{dataset:{level:'B2'}}});assert.ok(p.data.packs.every(pack=>pack.locked));
 const locked=p.data.packs[0];p.study({currentTarget:{dataset:{id:locked.id,locked:true}}});assert.equal(r.routes.length,0);
 p.select({currentTarget:{dataset:{level:'A1'}}});p.activate();assert.equal(r.state.track,'bank');
 const reload=r.loadPage('bank');reload.onShow();assert.equal(reload.data.track,'bank');
 const pack=L.course.lexicon.packs[0],session=r.loadPage('session');session.onLoad({pack:pack.id});assert.equal(session.data.word.id,pack.wordIds[0]);assert.ok(session.data.word.definition);
 session.reveal();session.rate({currentTarget:{dataset:{rating:'remember'}}});assert.equal(r.state.reviews[pack.wordIds[0]].confirmed,true);
 const quiz=r.loadPage('wordquiz');quiz.onLoad({pack:pack.id});quiz.begin();assert.ok(quiz.words.every(w=>w.packId===pack.id));
 const expression=r.loadPage('expression');expression.onLoad({id:pack.id});assert.equal(expression.data.siblings.length,4);
 expression.input({detail:{value:'Mi casa es bonita. Soy una persona.'}});expression.save();expression.group({currentTarget:{dataset:{id:pack.id+'-2'}}});assert.equal(expression.data.task.groupNumber,2);
 expression.group({currentTarget:{dataset:{id:pack.id}}});assert.equal(expression.data.text,'Mi casa es bonita. Soy una persona.');
 const blockedSession=r.loadPage('session');blockedSession.onLoad({pack:locked.id});assert.equal(blockedSession.data.unavailable,true);
 r.wx.setStorageSync=()=>{throw new Error('quota');};p.course();assert.equal(r.state.track,'bank');
});
test('原生四步入门达标保存并能复习，不生成打卡，写入失败停留提交入口',()=>{
 const r=runtime(),p=r.loadPage('foundations');p.onLoad();assert.equal(p.data.lessons.length,4);
 p.open({currentTarget:{dataset:{id:'gender'}}});assert.equal(p.data.phase,'read');assert.ok(p.data.references.some(x=>x.id==='dpd-el'));
 p.begin();for(const q of L.foundations.find(f=>f.id==='gender').questions){p.choose({currentTarget:{dataset:{index:q.answer}}});p.next();}
 assert.equal(p.data.result.score,100);assert.equal(r.state.foundations.gender.bestScore,100);assert.equal(L.summary(r.state).checkedIn,false);
 const reload=r.loadPage('foundations');reload.onLoad();assert.equal(reload.data.lessons.find(f=>f.id==='gender').passed,true);
 p.begin();const questions=L.foundations.find(f=>f.id==='gender').questions;
 for(const q of questions.slice(0,3)){p.choose({currentTarget:{dataset:{index:q.answer}}});p.next();}p.choose({currentTarget:{dataset:{index:questions[3].answer}}});
 r.wx.setStorageSync=()=>{throw new Error('quota');};p.next();assert.equal(p.data.phase,'quiz');assert.equal(p.data.result,null);assert.equal(r.state.foundations.gender.attempts,1);
});
test('原生一年计划开始、周自检、未来周预览与跨页重载',()=>{
 const r=runtime(),p=r.loadPage('year');p.onShow();assert.equal(p.data.summary.started,false);assert.equal(p.data.canCheck,false);
 p.start();assert.equal(p.data.summary.day,1);assert.equal(p.data.canCheck,true);p.check({currentTarget:{dataset:{id:'words'}}});assert.equal(r.state.journey.weekChecks[1].skills[0],'words');
 p.move({currentTarget:{dataset:{step:12}}});assert.equal(p.data.week.level,'A2');assert.equal(p.data.canCheck,false);p.check({currentTarget:{dataset:{id:'grammar'}}});assert.equal(r.state.journey.weekChecks[13],undefined);
 p.lesson();assert.equal(r.routes.length,0);assert.ok(r.messages.some(m=>m.includes('实际进度')));
 const reload=r.loadPage('year');reload.onShow();assert.equal(reload.data.summary.day,1);assert.equal(reload.data.skills.find(s=>s.id==='words').checked,true);
 reload.check({currentTarget:{dataset:{id:'words'}}});assert.equal(r.state.journey.weekChecks[1].skills.length,0);
 r.wx.setStorageSync=()=>{throw new Error('quota');};reload.check({currentTarget:{dataset:{id:'write'}}});assert.equal(reload.data.skills.find(s=>s.id==='write').checked,false);
});
