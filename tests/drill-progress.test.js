const {test}=require('node:test');const assert=require('node:assert/strict');const L=require('../miniprogram/lib/learning');
test('补充练习进度从零开始，每级六包，下一步来自真实前置关系',()=>{
  const s=L.emptyState(),p=L.practiceSummary(s);assert.equal(p.total,24);assert.equal(p.passed,0);assert.equal(p.drafts,0);assert.equal(p.next.id,'a1-place');assert.ok(p.levels.every(l=>l.total===6));
  assert.equal(p.levels[0].available,1);assert.equal(p.levels[1].available,0);
});
test('规则题、错项、表达自查和每日任务分别统计，不写回学习记录',()=>{
  const s=L.emptyState(),pack=L.drillPacks[0],a=pack.questions.map(q=>q.answers[0]);a[1]='bad';L.gradeDrill(s,pack.id,a);L.saveDrillDraft(s,pack.id,'Soy estudiante.');L.setDrillChecks(s,pack.id,[0,1,2]);L.startJourney(s,'2026-10-01');for(const id of ['recall','focus','output'])L.setMonthTask(s,1,id,true,'2026-10-01');
  const before=structuredClone(s),p=L.practiceSummary(s);assert.equal(p.passed,1);assert.equal(p.wrong,1);assert.equal(p.drafts,1);assert.equal(p.selfChecked,1);assert.equal(p.monthCompleted,1);assert.equal(p.next.id,'a1-greetings');assert.equal(p.levels[0].available,3);assert.deepEqual(s,before);assert.deepEqual(s.days,{});assert.equal(L.summary(s).learned,0);
});
test('旧核心备份显示三包达标，新增分支不丢旧进度，全部完成后建议回顾',()=>{
  const s=L.emptyState();for(const p of L.drillPacks.filter(p=>p.branch==='core'))L.gradeDrill(s,p.id,p.questions.map(q=>q.answers[0]));
  let report=L.practiceSummary(L.restore(JSON.parse(JSON.stringify(s))));assert.ok(report.levels.every(l=>l.passed===3));assert.equal(report.next.id,'a1-greetings');
  for(const p of L.drillPacks.filter(p=>p.branch==='extension'))L.gradeDrill(s,p.id,p.questions.map(q=>q.answers[0]));report=L.practiceSummary(s);assert.equal(report.passed,24);assert.equal(report.next,null);
});
