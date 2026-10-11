const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const L=require('../miniprogram/lib/learning');
const C=L.course, TODAY='2026-10-11';
const record=()=>({interval:3,due:'2026-10-14',lastReviewed:TODAY,repetitions:1,confirmed:true});
function fixture(){const s=L.emptyState();for(const w of C.words)s.reviews[w.id]=record();for(const l of C.lessons)s.lessons[l.id]={bestScore:100,attempts:1};return s;}

test('6500 个去重条目含至少 6000 个单词，原始变位不充当词元',()=>{
 const rows=C.lexicon.catalogue;
 assert.equal(rows.length,6500);assert.equal(new Set(rows.map(w=>C.lexicon.canonicalKey(w.spanish))).size,6500);
 assert.ok(rows.filter(w=>/^[a-záéíóúüñ]+$/.test(C.lexicon.canonicalKey(w.spanish))).length>=6000);
 assert.equal(new Set(C.words.map(w=>w.id)).size,C.words.length);
 assert.deepEqual(L.bankProgress(L.emptyState()).map(l=>[l.id,l.total,l.cumulative]),[['A1',800,800],['A2',1500,2300],['B1',2000,4300],['B2',2200,6500]]);
 for(const w of C.lexicon.imported){
  assert.equal(w.id,'v-'+crypto.createHash('sha256').update(w.spanish).digest('hex').slice(0,12));
  assert.ok(/[\u4e00-\u9fff]/.test(w.meaning));assert.ok(w.definition);assert.ok(w.frequency>0);assert.ok(w.verification.sourceLine>0);
  assert.equal(w.verification.status,'imported');assert.equal(w.example,'');assert.equal(w.translation,'');
  assert.equal(w.surfaceForms[0],w.spanish);assert.ok(w.sourceIds.every(id=>C.sources.some(s=>s.id===id)));
  assert.equal(new URL(w.sourceUrl).hostname,'en.wiktionary.org');
 }
 const report=require('../docs/lexicon-build.json');
 assert.equal(report.sha256,crypto.createHash('sha256').update(fs.readFileSync('miniprogram/data/lexicon/entries.js')).digest('hex'));
 for(let i=1;i<C.lexicon.imported.length;i++)assert.ok(C.lexicon.imported[i-1].frequency>=C.lexicon.imported[i].frequency);
});
test('下一词库阶段同时要求 80% 确认与前阶段全部课程，遗忘不反锁',()=>{
 const s=L.emptyState(),a1=C.lexicon.catalogue.filter(w=>w.level==='A1');
 for(const w of a1.slice(0,640))s.reviews[w.id]=record();
 assert.equal(L.bankProgress(s)[1].unlocked,false);
 for(const l of C.lessons.filter(l=>C.units.find(u=>u.id===l.unitId).levelCode==='A1')){
  s.lessons[l.id]={bestScore:100,attempts:1};for(const w of C.curriculumWords.filter(w=>w.unitId===l.unitId))s.reviews[w.id]=record();
 }
 assert.equal(L.bankProgress(s)[1].unlocked,true);assert.equal(L.bankProgress(s)[2].unlocked,false);
 L.review(s,a1[0].id,'again','2026-10-12');assert.equal(L.bankProgress(s)[1].unlocked,true);
 const onlyLessons=fixture();for(const w of C.lexicon.imported)delete onlyLessons.reviews[w.id];
 assert.equal(L.bankProgress(onlyLessons)[1].unlocked,false);
 const locked=C.lexicon.imported.find(w=>w.level==='B2');assert.throws(()=>L.review(s,locked.id,'easy',TODAY));
 assert.throws(()=>L.saveExpression(s,locked.packId,'Hola mundo.',true,TODAY));assert.deepEqual(L.packQueue(s,locked.packId),[]);
});
test('每日词库范围与词包训练支持最后的 B2 词，备份完整恢复',()=>{
 const s=fixture(),last=C.lexicon.imported.at(-1);L.setTrack(s,'bank');
 assert.ok(L.bankProgress(s).every(l=>l.unlocked));
 const pack=L.packQueue(s,last.packId,TODAY,20);assert.ok(pack.some(w=>w.id===last.id));
 L.practiceWord(s,last.id,'错误','spelling',TODAY);assert.equal(s.days[TODAY].words.length,0);
 assert.ok(L.wrongWords(s).some(w=>w.id===last.id));
 assert.equal(L.practiceWord(s,last.id,last.spanish,'spelling',TODAY).correct,true);
 assert.equal(s.days[TODAY].words.length,1);assert.equal(L.wrongWords(s).length,0);
 const restored=L.restore(JSON.parse(JSON.stringify(s)));assert.equal(restored.track,'bank');assert.deepEqual(restored.wordPractice[last.id],s.wordPractice[last.id]);
 assert.equal(L.summary(restored,TODAY).learned,6500);assert.equal(L.summary(restored,TODAY).wordTotal,6500);
 restored.reviews[last.id].due=TODAY;assert.ok(L.queue(restored,TODAY).some(w=>w.id===last.id));
 assert.throws(()=>L.setTrack(s,'unknown'));delete restored.track;assert.equal(L.restore(restored).track,'course');
});
test('310 词包无漏词，1237 表达组覆盖全部新增词并复用旧词',()=>{
 const ids=C.lexicon.packs.flatMap(p=>p.wordIds);assert.equal(ids.length,6183);assert.equal(new Set(ids).size,6183);
 assert.ok(C.lexicon.packs.every(p=>p.wordIds.length>0&&p.wordIds.length<=20));
 const tasks=C.tasks.filter(t=>t.bank);assert.equal(tasks.length,1237);
 assert.equal(new Set(tasks.flatMap(t=>t.targets.map(w=>w.wordId))).size,6183);
 for(const t of tasks){assert.ok(t.targets.length>0&&t.targets.length<=5);assert.ok(t.recycled);assert.equal(t.modelKind,'scaffold');assert.equal(L.evaluateExpression(t.id,t.model).complete,false);}
 const first=tasks[0],s=L.emptyState();L.saveExpression(s,first.id,'Soy una persona. Vivo en mi casa.',false,TODAY);
 assert.equal(s.expressions[first.id].attempts,0);assert.equal(Object.keys(s.reviews).length,0);
 assert.deepEqual(L.restore(s).expressions,s.expressions);
 const nextGroup=tasks.find(t=>t.packId===first.packId&&t.groupNumber===2);assert.notEqual(nextGroup.targets[0].wordId,first.targets[0].wordId);
});
test('同一词在不同课内语境中出现只算一个已学词和每日目标',()=>{
 const s=fixture(),members=C.curriculumWords.filter(w=>w.canonicalId!==w.id);
 assert.equal(members.length,3);
 const w=members[0];s.days[TODAY]={goal:5,words:[],grammar:[]};
 L.review(s,w.canonicalId,'remember',TODAY);L.review(s,w.id,'remember',TODAY);assert.equal(s.days[TODAY].words.length,1);
 const raw=L.emptyState();raw.days[TODAY]={goal:5,words:[w.canonicalId,w.id],grammar:[]};assert.equal(L.restore(raw).days[TODAY].words.length,1);
 const q=L.wordQuestion(C.lexicon.imported[0].id);assert.equal(new Set(q.options).size,4);assert.equal(q.answer,undefined);
});
