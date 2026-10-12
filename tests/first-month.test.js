const {test}=require('node:test');const assert=require('node:assert/strict');const L=require('../miniprogram/lib/learning');
test('前四周有 28 天 / 84 项小任务，所有微课、题包和课程入口可追溯',()=>{
  assert.equal(L.firstMonthDays.length,28);assert.equal(L.firstMonthDays.flatMap(d=>d.tasks).length,84);
  for(const [i,d] of L.firstMonthDays.entries()){
    assert.equal(d.day,i+1);assert.equal(d.week,Math.floor(i/7)+1);assert.deepEqual(d.tasks.map(t=>t.id),['recall','focus','output']);assert.ok(d.tasks.every(t=>t.text.length>10));
    const t=d.target;
    if(t.kind==='foundation')assert.ok(L.foundations.some(f=>f.id===t.id));
    else if(t.kind==='drill')assert.ok(L.drillPacks.some(p=>p.id===t.id));
    else if(t.kind==='lesson')assert.ok(L.course.lessons.some(l=>l.id===t.id));
    else if(t.kind==='nouns')assert.ok(L.nounLessons.some(n=>n.id===t.id));
    else if(t.kind==='expression')assert.ok(L.course.tasks.some(e=>e.id===t.id));
    else assert.equal(t.kind,'review');
  }
});
test('每日任务沿用年度开始日，未来可预览但不能提前记录；跨闰日递进',()=>{
  const s=L.emptyState();assert.equal(L.firstMonthSummary(s,'2024-02-28').canCheck,false);L.startJourney(s,'2024-02-28');
  assert.equal(L.firstMonthSummary(s,'2024-02-29').suggestedDay,2);assert.equal(L.firstMonthSummary(s,'2024-03-01').suggestedDay,3);
  assert.throws(()=>L.setMonthTask(s,4,'focus',true,'2024-03-01'));assert.throws(()=>L.setMonthTask(s,0,'focus',true,'2024-03-01'));
  assert.equal(L.firstMonthSummary(s,'2024-04-01').suggestedDay,28);L.startJourney(s,'2024-04-01');assert.equal(s.journey.startDate,'2024-02-28');
});
test('三个手工任务可反选，只记实际勾选日期，不改变成绩、打卡和词量',()=>{
  const s=L.emptyState();L.startJourney(s,'2026-10-01');const before=L.summary(s,'2026-10-03');
  for(const id of ['recall','focus','output'])L.setMonthTask(s,1,id,true,'2026-10-03');
  assert.equal(L.firstMonthSummary(s,'2026-10-03').completedDays,1);assert.equal(s.monthChecks[1].date,'2026-10-03');
  L.setMonthTask(s,1,'output',false,'2026-10-03');assert.equal(L.firstMonthSummary(s,'2026-10-03').completedDays,0);assert.deepEqual(L.summary(s,'2026-10-03'),before);assert.equal(L.isUnlocked(s,'u2'),false);
});
test('旧备份补空，日期、未来任务与非法 ID 过滤，有效记录往返',()=>{
  const old=L.emptyState();delete old.monthChecks;assert.deepEqual(L.restore(old).monthChecks,{});L.startJourney(old,'2026-10-01');
  old.monthChecks={1:{date:'2026-10-01',tasks:['recall','recall','bad']},2:{date:'2026-10-01',tasks:['focus']},29:{date:'2026-10-30',tasks:['focus']},3:{date:'2026-02-30',tasks:['focus']}};
  const s=L.restore(old);assert.deepEqual(s.monthChecks,{'1':{date:'2026-10-01',tasks:['recall']}});assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))),s);
});
