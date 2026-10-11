const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const TODAY = '2026-10-11';
const pass = (state, id = 'g1', day = TODAY) => L.gradeLesson(state, id, L.course.lessons.find(l => l.id === id).questions.map(q => q.answer), day);

test('320 词、32 课、128 题的 ID、来源和单元引用完整', () => {
  const { curriculumWords:words, lessons, units, sources } = L.course;
  assert.equal(words.length, 320); assert.equal(lessons.length, 32); assert.equal(lessons.flatMap(l=>l.questions).length, 128);
  for (const collection of [words, lessons, units, sources]) assert.equal(new Set(collection.map(x=>x.id)).size, collection.length);
  const sourceIds = new Set(sources.map(s=>s.id));
  for (const row of [...words,...lessons,...units]) for (const id of row.sourceIds) assert.ok(sourceIds.has(id));
  for (const word of words) assert.equal(new URL(word.dictionaryUrl).protocol,'https:');
  for (const unit of units) { assert.equal(words.filter(w=>w.unitId===unit.id).length,10); assert.equal(lessons.filter(l=>l.unitId===unit.id).length,1); }
  for (const lesson of lessons) for (const q of lesson.questions) { assert.ok(q.explanation); assert.ok(q.answer>=0&&q.answer<q.options.length); assert.equal(new Set(q.options).size,q.options.length); }
  for (const source of sources) { assert.equal(new URL(source.url).protocol,'https:'); assert.ok(['verified','dataset'].includes(source.status)); assert.ok(source.verifiedAt); }
});
test('入门只解锁第一个单元，直接访问后续复习和练习被拒绝', () => {
  const s=L.emptyState(); assert.equal(L.isUnlocked(s,'u1'),true); assert.equal(L.isUnlocked(s,'u2'),false);
  assert.ok(L.queue(s,TODAY).every(w=>w.unitId==='u1'));
  assert.throws(()=>L.review(s,'w11','easy',TODAY)); assert.throws(()=>pass(s,'g2'));
  assert.throws(()=>L.review(s,'w1','invented',TODAY));
});
test('词汇达到 6 个与语法通过共同解锁，只有一种进度不能解锁', () => {
  const s=L.emptyState(); for(let i=1;i<=6;i++) L.review(s,`w${i}`,'remember',TODAY);
  assert.equal(L.isUnlocked(s,'u2'),false); pass(s); assert.equal(L.isUnlocked(s,'u2'),true); assert.equal(L.currentUnit(s).id,'u2');
  const other=L.emptyState(); pass(other); for(let i=1;i<=5;i++) L.review(other,`w${i}`,'remember',TODAY); assert.equal(L.isUnlocked(other,'u2'),false);
});
test('间隔复习按反馈安排，到期词优先，重复点击不扩大当天间隔', () => {
  const s=L.emptyState(); L.review(s,'w1','remember',TODAY); assert.equal(s.reviews.w1.due,'2026-10-12');
  L.review(s,'w1','easy',TODAY); assert.equal(s.reviews.w1.interval,1);
  L.review(s,'w2','easy',TODAY); assert.equal(s.reviews.w2.due,'2026-10-14');
  L.review(s,'w3','again',TODAY); assert.equal(s.reviews.w3.due,TODAY); assert.equal(L.queue(s,TODAY)[0].id,'w3');
  L.review(s,'w1','remember','2026-10-12'); assert.equal(s.reviews.w1.interval,2); assert.equal(s.reviews.w1.due,'2026-10-14');
});
test('只有不同词计数；词汇与达标语法共同触发真实打卡', () => {
  const s=L.emptyState(); for(let i=0;i<6;i++)L.review(s,'w1','remember',TODAY);
  assert.equal(L.summary(s,TODAY).day.words.length,1); pass(s); assert.equal(L.summary(s,TODAY).checkedIn,false);
  for(let i=2;i<=5;i++)L.review(s,`w${i}`,'remember',TODAY);
  assert.equal(L.summary(s,TODAY).checkedIn,true); assert.equal(L.summary(s,TODAY).checkins,1);
  pass(s); assert.equal(s.days[TODAY].grammar.length,1);
});
test('语法必须完整作答，75% 达标；错题记录可在重练后订正', () => {
  const s=L.emptyState(), lesson=L.course.lessons[0]; const answers=lesson.questions.map(q=>q.answer);
  assert.throws(()=>L.gradeLesson(s,'g1',[1],TODAY)); assert.throws(()=>L.gradeLesson(s,'g1',[null,1,1,2],TODAY));
  answers[0]=(answers[0]+1)%3; answers[1]=(answers[1]+1)%3;
  let result=L.gradeLesson(s,'g1',answers,TODAY); assert.equal(result.score,50); assert.equal(result.passed,false); assert.equal(L.summary(s,TODAY).day.grammar.length,0); assert.equal(L.mistakes(s).length,2);
  answers[1]=lesson.questions[1].answer; result=L.gradeLesson(s,'g1',answers,TODAY); assert.equal(result.score,75); assert.equal(result.passed,true); assert.equal(L.mistakes(s).length,1);
  pass(s); assert.equal(L.mistakes(s).length,0); assert.equal(s.lessons.g1.bestScore,100);
});
test('今日目标开始后固定，修改目标不会给今天制造打卡', () => {
  const s=L.emptyState(); L.review(s,'w1','remember',TODAY); L.setGoal(s,3);
  assert.equal(L.summary(s,TODAY).day.goal,5); assert.equal(L.summary(s,'2026-10-12').day.goal,3);
  L.review(s,'w1','remember','2026-10-12'); assert.equal(s.days['2026-10-12'].goal,3);
});
test('跨月、跨年与闰日使用本地日历；中断一天后连续打卡归零', () => {
  assert.equal(L.addDays('2026-12-31',1),'2027-01-01'); assert.equal(L.addDays('2024-02-28',1),'2024-02-29');
  const s=L.emptyState(); const completed={goal:3,words:['w1','w2','w3'],grammar:['g1']};
  s.days['2026-10-09']=structuredClone(completed); s.days['2026-10-10']=structuredClone(completed);
  assert.equal(L.streak(s,TODAY),2); assert.equal(L.streak(s,'2026-10-12'),0);
  s.days[TODAY]=structuredClone(completed); assert.equal(L.streak(s,TODAY),3);
});
test('课程全学完且没有到期词时仍可巩固，完成下一天词汇目标', () => {
  const s=L.emptyState(); for(const lesson of L.course.lessons){ for(const w of L.course.words.filter(w=>w.unitId===lesson.unitId))L.review(s,w.id,'easy',TODAY); pass(s,lesson.id); }
  assert.equal(L.summary(s,TODAY).grammarPassed,32); const next='2026-10-12';
  const q=L.queue(s,next); assert.equal(q.length,5); for(const w of q)L.review(s,w.id,'remember',next); pass(s,'g8',next); assert.equal(L.summary(s,next).checkedIn,true);
});
test('损坏的存储恢复时只保留有效字段，不根据伪造的 checkedIn 标记打卡', () => {
  assert.deepEqual(L.restore(null),L.emptyState()); const raw=L.emptyState(); raw.reviews.unknown={}; raw.reviews.w1={interval:-1,due:TODAY}; raw.days[TODAY]={goal:5,words:['unknown','w1','w1'],grammar:[],checkedIn:true};
  const restored=L.restore(raw); assert.equal(Object.keys(restored.reviews).length,0); assert.deepEqual(restored.days[TODAY].words,['w1']); assert.equal(L.summary(restored,TODAY).checkedIn,false);
});

test('A1→B2 分阶段解锁，阶段各有 80 词；词义答错不能推进记忆确认',()=>{
 const s=L.emptyState();for(const w of L.course.words.slice(0,6))L.practiceWord(s,w.id,'错误','meaning',TODAY);pass(s);
 assert.equal(L.unitProgress(s,'u1').learned,6);assert.equal(L.unitProgress(s,'u1').ready,0);assert.equal(L.isUnlocked(s,'u2'),false);
 for(const unit of L.course.units){
   assert.equal(L.isUnlocked(s,unit.id),true);
   const before=L.course.units.findIndex(u=>u.id===unit.id)+1;
   if(before<L.course.units.length)assert.equal(L.isUnlocked(s,L.course.units[before].id),false);
   for(const w of L.course.words.filter(w=>w.unitId===unit.id).slice(0,6))L.review(s,w.id,'remember',TODAY);
   pass(s,L.course.lessons.find(l=>l.unitId===unit.id).id);
 }
 assert.deepEqual(L.levelProgress(s).map(l=>[l.id,l.total,l.unitTotal,l.completed]),[['A1',80,8,8],['A2',80,8,8],['B1',80,8,8],['B2',80,8,8]]);
 assert.equal(L.expressionUnlocked(s,'final'),true);
 L.review(s,'w1','again',L.addDays(TODAY,1));assert.equal(L.isUnlocked(s,'u25'),true);assert.equal(L.expressionUnlocked(s,'final'),true);
});
test('词义选项不泄漏答案且不重复，答错不计打卡，订正后移出错词本',()=>{
 const s=L.emptyState(),q=L.wordQuestion('w1','meaning',()=>0);
 assert.equal(q.answer,undefined);assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);
 assert.equal(L.practiceWord(s,'w1','错误','meaning',TODAY).correct,false);
 assert.equal(s.days[TODAY].words.length,0);assert.equal(L.wrongWords(s).length,1);
 assert.equal(L.practiceWord(s,'w1','你好','meaning',TODAY).correct,true);
 assert.equal(s.days[TODAY].words.length,1);assert.equal(L.wrongWords(s).length,0);
 assert.deepEqual(L.restore(s).wordPractice.w1,{attempts:2,correct:1,lastPracticed:TODAY});
 assert.throws(()=>L.practiceWord(s,'w81','街区','meaning',TODAY));
});
test('拼写保留重音、ñ，支持 NFC 和性别词形，不能用去重音取巧',()=>{
 const s=L.emptyState();
 assert.equal(L.practiceWord(s,'w2','adios','spelling',TODAY).accentHint,true);
 assert.equal(s.days[TODAY].words.length,0);
 assert.equal(L.practiceWord(s,'w2',' ADIÓS ','spelling',TODAY).correct,true);
 for(const w of L.course.words.slice(0,6))L.review(s,w.id,'remember',TODAY);pass(s);
 assert.equal(L.practiceWord(s,'w17','espanol','spelling',TODAY).correct,false);
 assert.equal(L.practiceWord(s,'w17','española','spelling',TODAY).correct,true);
 assert.equal(L.wordQuestion('w17','spelling').hint.includes('首字母 e'),true);
});
test('表达任务具备各阶段目标与复习词，参考范文满足公开的形式要求',()=>{
 const tasks=L.course.tasks.filter(t=>!t.bank); assert.equal(tasks.length,33);
 for(const task of tasks){
   assert.ok(task.prompt&&task.outline.length&&task.model);
   for(const t of [...task.targets,...(task.recycled?[task.recycled]:[])])assert.ok(L.course.words.some(w=>w.id===t.wordId));
   assert.equal(L.evaluateExpression(task.id,task.model).complete,true,task.id);
   if(task.id!=='e1'&&!task.final)assert.ok(task.recycled);
 }
 const final=L.course.tasks.find(t=>t.final);
 assert.deepEqual([...new Set(final.targets.map(t=>L.course.words.find(w=>w.id===t.wordId).level))],['A1','A2','B1','B2']);
});
test('输出检查按完整词匹配，不承诺语法评分；草稿、提交与备份兼容',()=>{
 const s=L.emptyState(), task=L.course.tasks[0];
 assert.equal(L.evaluateExpression('e1','holanda gracias por favor').targets[0].used,false);
 assert.equal(L.evaluateExpression('e1','hola, gracias, por favor.').complete,false);
 L.saveExpression(s,'e1',task.model,false,TODAY);assert.equal(s.expressions.e1.attempts,0);assert.equal(L.levelProgress(s)[0].expressions,0);
 L.saveExpression(s,'e1',task.model,true,TODAY);assert.equal(L.levelProgress(s)[0].expressions,1);
 assert.equal(L.summary(s,TODAY).checkedIn,false);assert.equal(Object.keys(s.reviews).length,0);
 assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))).expressions,s.expressions);
 L.saveExpression(s,'e1','Hola, Ana.',false,TODAY);assert.equal(s.expressions.e1.submittedText,task.model);assert.equal(L.levelProgress(s)[0].expressions,1);
 assert.throws(()=>L.saveExpression(s,'e9','Hola.',true,TODAY));assert.throws(()=>L.saveExpression(s,'final','Hola.',true,TODAY));
 assert.throws(()=>L.evaluateExpression('e1','a'.repeat(6001)));
 const raw={...s,expressions:{...s.expressions,unknown:{text:'bad',attempts:1,updated:TODAY},e2:{text:'bad',attempts:-1,updated:TODAY}}};
 assert.equal(L.restore(raw).expressions.unknown,undefined);assert.equal(L.restore(raw).expressions.e2,undefined);
 const old=L.emptyState();delete old.expressions;delete old.wordPractice;delete old.wordMistakes;assert.deepEqual(L.restore(old),L.emptyState());
});
test('综合任务要求跨级词汇、连接语和多段文本',()=>{
 const task=L.course.tasks.find(t=>t.final);
 let r=L.evaluateExpression('final',task.model);assert.equal(r.complete,true);
 r=L.evaluateExpression('final',task.model.replace(/\n\n/g,' '));assert.equal(r.complete,false);assert.ok(r.checks.some(c=>c.label.includes('段')&&!c.passed));
 r=L.evaluateExpression('final',task.model.replace(/evaluación/g,'comprobación'));assert.equal(r.complete,false);assert.ok(r.targets.some(t=>t.label==='evaluación'&&!t.used));
});
