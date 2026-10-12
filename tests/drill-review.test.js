const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const answers = p => p.questions.map(q => q.answers[0]);
test('集中订正按等级抽取实际错项，最多 12 项，订正不抬高整包分数', () => {
  const s=L.emptyState();for(const p of L.drillPacks){const a=answers(p);a[1]='wrong';L.gradeDrill(s,p.id,a);}
  assert.equal(L.drillWrongQuestions(s).length,24);assert.equal(L.drillReviewQueue(s).length,12);assert.equal(L.drillWrongQuestions(s,'B2').length,6);
  const before=structuredClone(s.drills),q=L.drillReviewQueue(s)[0];assert.equal(L.reviewDrillMistake(s,q.id,'wrong').correct,false);
  assert.equal(L.reviewDrillMistake(s,q.id,q.answers[0]).correct,true);assert.equal(s.drillMistakes[q.id],undefined);
  assert.deepEqual(s.drills,before);assert.deepEqual(s.days,{});assert.equal(L.reviewDrillMistake(s,q.id,'wrong').alreadyCleared,true);assert.equal(s.drillMistakes[q.id],undefined);
});
test('订正不绕过未达标完整包，尚未开放的伪造错项不能复习', () => {
  const s=L.emptyState(),p=L.drillPacks[0],a=answers(p);a[0]='wrong';a[1]='wrong';L.gradeDrill(s,p.id,a);
  for(const q of L.drillReviewQueue(s))L.reviewDrillMistake(s,q.id,q.answers[0]);
  assert.equal(s.drills[p.id].bestScore,50);assert.equal(L.drillUnlocked(s,'a1-routine'),false);
  s.drillMistakes['b2-report-q2']={answer:'bad'};assert.equal(L.drillReviewQueue(s).length,0);
  assert.throws(()=>L.reviewDrillMistake(s,'b2-report-q2','presentaría'));assert.throws(()=>L.drillWrongQuestions(s,'C2'));
});
test('订正保存的错项与备份往返一致，空答案不会修改记录', () => {
  const s=L.emptyState(),p=L.drillPacks[0],a=answers(p);a[1]='bad';L.gradeDrill(s,p.id,a);const before=structuredClone(s);
  assert.throws(()=>L.reviewDrillMistake(s,p.questions[1].id,' '));assert.deepEqual(s,before);
  L.reviewDrillMistake(s,p.questions[1].id,'esta');assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))),s);
});
test('表达修改只保留上一保存版本，恢复可逆，重复保存不增加版本', () => {
  const s=L.emptyState(),id='a1-place';L.saveDrillDraft(s,id,'Soy estudiante.');L.saveDrillDraft(s,id,'Estoy en casa.');
  assert.equal(s.drillDrafts[id].revisions,2);assert.equal(s.drillDrafts[id].previousText,'Soy estudiante.');
  L.saveDrillDraft(s,id,'Estoy en casa.');assert.equal(s.drillDrafts[id].revisions,2);
  L.revertDrillDraft(s,id);assert.equal(s.drillDrafts[id].text,'Soy estudiante.');assert.equal(s.drillDrafts[id].previousText,'Estoy en casa.');
  L.revertDrillDraft(s,id);assert.equal(s.drillDrafts[id].text,'Estoy en casa.');assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))),s);
});
test('表达自查是独立手工记录，文字改变后清空，稀疏 / 无效项拒绝', () => {
  const s=L.emptyState(),id='a1-place';L.saveDrillDraft(s,id,'Soy estudiante.');L.setDrillChecks(s,id,[2,0,0]);assert.deepEqual(s.drillDrafts[id].checks,[0,2]);
  assert.throws(()=>L.setDrillChecks(s,id,new Array(3)));assert.throws(()=>L.setDrillChecks(s,id,[3]));
  L.saveDrillDraft(s,id,'Soy profesora.');assert.deepEqual(s.drillDrafts[id].checks,[]);assert.deepEqual(s.drills,{});assert.deepEqual(s.days,{});
  L.saveDrillDraft(s,id,' ');assert.throws(()=>L.setDrillChecks(s,id,[0]));
});
test('旧文本草稿升级不丢字，历史 / 自查无效字段过滤且大小有界', () => {
  const raw=L.emptyState();raw.drillDrafts['a1-place']={text:'Soy estudiante.',checks:[0,0,9,'1'],revisions:-1,previousText:'x'.repeat(3001)};
  const s=L.restore(raw),d=s.drillDrafts['a1-place'];assert.equal(d.text,'Soy estudiante.');assert.equal(d.revisions,1);assert.deepEqual(d.checks,[0]);assert.equal(d.previousText,undefined);
  assert.throws(()=>L.revertDrillDraft(s,'a1-place'));
});
