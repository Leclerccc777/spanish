const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const answers = p => p.questions.map(q => q.answers[0]);

test('A1–B2 每级六包，辨析/填空/纠错/阅读与个性表达完整且有依据', () => {
  assert.equal(L.drillPacks.length, 24);
  assert.equal(L.drillPacks.flatMap(p=>p.questions).length, 96);
  assert.equal(new Set(L.drillPacks.flatMap(p=>p.questions).map(q=>q.id)).size, 96);
  for(const level of ['A1','A2','B1','B2'])assert.equal(L.drillPacks.filter(p=>p.level===level).length,6);
  for(const [i,p] of L.drillPacks.entries()){
    if(p.branch==='core')assert.equal(p.previousId,i?L.drillPacks[i-1].id:null);else assert.ok(L.drillPacks.some(d=>d.id===p.previousId));
    assert.deepEqual(p.questions.map(q=>q.kind),['choice','text','text','choice']);
    assert.ok(p.reading.length>60&&p.glossary&&p.output.model&&p.output.rubric.length>=3);
    for(const id of p.lessonIds)assert.ok(L.course.lessons.some(l=>l.id===id));
    for(const r of p.references)assert.ok(L.course.sources.some(s=>s.id===r.sourceId));
    for(const q of p.questions){assert.ok(q.explanation);assert.ok(q.answers.length);if(q.options){assert.equal(new Set(q.options).size,3);assert.ok(q.options.includes(q.answers[0]));}}
  }
});
test('整条路线必须按实际作答递进，75% 解锁下一包，不改变主课程与词汇打卡', () => {
  const s=L.emptyState(),before=L.summary(s);
  assert.equal(L.drillUnlocked(s,L.drillPacks[0].id),true);
  assert.equal(L.drillUnlocked(s,L.drillPacks[3].id),false);
  assert.throws(()=>L.gradeDrill(s,L.drillPacks[3].id,answers(L.drillPacks[3])));
  for(const [i,p] of L.drillPacks.entries()){
    assert.equal(L.drillUnlocked(s,p.id),true);
    const a=answers(p);a[1]='错误';const result=L.gradeDrill(s,p.id,a);
    assert.equal(result.score,75);assert.equal(result.passed,true);
    assert.equal(L.drillProgress(s).find(d=>d.id===p.id).mistakes.length,1);
    if(i<23)assert.equal(L.drillUnlocked(s,L.drillPacks[i+1].id),true);
  }
  assert.deepEqual(L.summary(s),before);assert.deepEqual(s.days,{});assert.deepEqual(s.reviews,{});assert.equal(L.isUnlocked(s,'u2'),false);
});
test('不达标需巩固，订正清除错项，之后退步不锁回已开的练习', () => {
  const s=L.emptyState(),p=L.drillPacks[0];const a=answers(p);a[0]='wrong';a[1]='wrong';
  assert.equal(L.gradeDrill(s,p.id,a).score,50);assert.equal(L.drillUnlocked(s,L.drillPacks[1].id),false);
  L.gradeDrill(s,p.id,answers(p));assert.deepEqual(s.drillMistakes,{});assert.equal(s.drills[p.id].bestScore,100);
  L.gradeDrill(s,p.id,a);assert.equal(s.drills[p.id].bestScore,100);assert.equal(L.drillUnlocked(s,L.drillPacks[1].id),true);
  const before=structuredClone(s);assert.throws(()=>L.gradeDrill(s,p.id,new Array(4)));assert.throws(()=>L.gradeDrill(s,p.id,['soy']));assert.deepEqual(s,before);
});
test('受控输入保留重音与 ñ，接受公开的 -ra/-se 变体，拒绝错语境与改写', () => {
  assert.equal(L.evaluateDrillAnswer('a1-place',1,' esta\u0301. ').correct,true);
  assert.equal(L.evaluateDrillAnswer('a1-place',1,'esta').correct,false);
  assert.equal(L.evaluateDrillAnswer('a2-weekend',1,'compro').correct,false);
  assert.equal(L.evaluateDrillAnswer('b2-hypothesis',1,'tuviese').correct,true);
  assert.equal(L.evaluateDrillAnswer('b2-hypothesis',2,'Si tuviese tiempo, estudiaría español.').correct,true);
  assert.equal(L.evaluateDrillAnswer('b2-hypothesis',1,'tendría').correct,false);
  assert.equal(L.evaluateDrillAnswer('b2-concession',0,'cuesta').correct,false);
  assert.equal(L.evaluateDrillAnswer('b2-report',1,'presentaria').correct,false);
  assert.throws(()=>L.evaluateDrillAnswer('a1-place',1,''));
  assert.equal(L.evaluateDrillAnswer('a1-greetings',2,'Cómo estás?').correct,false);
  assert.equal(L.evaluateDrillAnswer('a1-greetings',2,'¿Cómo estás?').correct,true);
});
test('新增巩固分支覆盖所有 32 课，旧 12 包备份保持开放状态', () => {
  const s=L.emptyState(),core=L.drillPacks.filter(p=>p.branch==='core');
  assert.equal(core.length,12);assert.equal(new Set(L.drillPacks.flatMap(p=>p.lessonIds)).size,32);
  for(const p of core)L.gradeDrill(s,p.id,answers(p));
  const restored=L.restore(JSON.parse(JSON.stringify(s)));
  for(const p of core)assert.equal(L.drillUnlocked(restored,p.id),true);
  assert.equal(L.drillUnlocked(restored,'b2-specific'),true);
  assert.equal(L.drillUnlocked(restored,'b2-passive'),false);
  assert.equal(L.nextDrillPack(restored,'b2-report').id,'b2-specific');
  assert.equal(L.nextDrillPack(restored,'a1-place').id,'a1-greetings');
  assert.equal(L.drillPacks.filter(p=>p.level==='A2').map(p=>p.levelNumber).join(','),'1,2,3,4,5,6');
});
test('表达草稿独立保存，预览不允许写入，范文不自动产生能力记录', () => {
  const s=L.emptyState(),p=L.drillPacks[0];L.saveDrillDraft(s,p.id,p.output.model);
  assert.equal(s.drillDrafts[p.id].text,p.output.model);assert.equal(L.drillUnlocked(s,L.drillPacks[1].id),false);
  assert.deepEqual(s.drills,{});assert.deepEqual(s.days,{});
  assert.throws(()=>L.saveDrillDraft(s,L.drillPacks[3].id,'abc'));
  assert.throws(()=>L.saveDrillDraft(s,p.id,'x'.repeat(3001)));
  L.saveDrillDraft(s,p.id,'');assert.equal(s.drillDrafts[p.id].text,'');
});
test('旧备份兼容，完整路线备份往返及未知 ID/无效字段过滤', () => {
  const s=L.emptyState();delete s.drills;delete s.drillMistakes;delete s.drillDrafts;
  const old=L.restore(s);assert.deepEqual(old.drills,{});assert.deepEqual(old.drillDrafts,{});
  for(const p of L.drillPacks){L.gradeDrill(old,p.id,answers(p));L.saveDrillDraft(old,p.id,p.output.model);}
  assert.deepEqual(L.restore(JSON.parse(JSON.stringify(old))),old);
  old.drills.bad={bestScore:100,attempts:1};old.drills['a1-place']={bestScore:101,attempts:1};old.drillDrafts.bad={text:'x'};old.drillMistakes.bad={answer:'x'};
  const clean=L.restore(old);assert.equal(clean.drills.bad,undefined);assert.equal(clean.drills['a1-place'],undefined);assert.equal(clean.drillDrafts.bad,undefined);assert.equal(L.drillUnlocked(clean,'b2-report'),false);
});
