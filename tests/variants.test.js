const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../miniprogram/lib/learning');
const variants=require('../miniprogram/lib/variants');
const families=[['lesson',L.course.lessons,L.lessonQuestions],['drill',L.drillPacks,L.drillQuestions],['foundation',L.foundations,L.foundationQuestions],['noun',L.nounLessons,L.nounQuestions]];
test('264 个原知识点均有不同题干或选项的平行题，稳定 ID 和原材料不变',()=>{
 let count=0;
 for(const [kind,items,get] of families)for(const item of items){
  const before=JSON.stringify(item),a=get(item.id,0),b=get(item.id,1);
  assert.equal(a.length,b.length);
  for(let i=0;i<a.length;i++){
   const q=b[i];count++;assert.equal(a[i].id,q.id);
   assert.notEqual(JSON.stringify([a[i].prompt,a[i].options]),JSON.stringify([q.prompt,q.options]),q.id);
   if(q.options){assert.equal(new Set(q.options).size,q.options.length,q.id);const correct=typeof q.answer==='number'?q.options[q.answer]:q.answers?.[0]||q.answer;assert(q.options.includes(correct),q.id);}
   if(kind==='drill'&&i===3){assert.notEqual(q.reading,item.reading);assert(q.reading.length>30);}
  }
  assert.equal(JSON.stringify(item),before);
 }
 assert.equal(count,264);assert.deepEqual([0,1,2,3].map(variants.practiceForm),[0,1,0,1]);
});
test('全路线两套题评分并往返备份；错项保留对应题组，旧备份默认原题',()=>{
 const state=L.emptyState();
 for(const lesson of L.course.lessons){
  for(const w of L.course.curriculumWords.filter(w=>w.unitId===lesson.unitId).slice(0,6))L.review(state,w.id,'remember');
  for(const form of [0,1]){
   const questions=L.lessonQuestions(lesson.id,form);assert.equal(L.gradeLesson(state,lesson.id,questions.map(q=>q.answer),L.dateKey(),form).score,100);
  }
 }
 const q=L.lessonQuestions('g1',1);L.gradeLesson(state,'g1',q.map(x=>(x.answer+1)%3),L.dateKey(),1);
 const restored=L.restore(JSON.parse(JSON.stringify(state)));
 assert.equal(L.mistakes(restored).find(x=>x.id==='g1q1').prompt,q[0].prompt);
 assert.equal(restored.lessons.g1.bestScore,100);
 for(const pack of L.drillPacks)for(const form of [0,1])assert.equal(L.gradeDrill(state,pack.id,L.drillQuestions(pack.id,form).map(q=>q.answers[0]),form).score,100);
 for(const f of L.foundations)for(const form of [0,1])assert.equal(L.gradeFoundation(state,f.id,L.foundationQuestions(f.id,form).map(q=>q.answer),form).score,100);
 for(const n of L.nounLessons)for(const form of [0,1])assert.equal(L.gradeNoun(state,n.id,L.nounQuestions(n.id,form).map(q=>q.answer),form).score,100);
 assert.deepEqual(L.restore(JSON.parse(JSON.stringify(state))),state);
 const before=JSON.stringify(state);assert.throws(()=>L.gradeDrill(state,'a1-place',['a','b','c','d'],3));assert.equal(JSON.stringify(state),before);
});
test('集中订正更换题目与短文，按实际题组评分，不抬高原成绩或打卡',()=>{
 const state=L.emptyState();L.gradeDrill(state,'a1-place',['错','错','错','错']);const before=JSON.stringify([state.drills,state.days]);
 const queue=L.drillReviewQueue(state);assert.equal(queue.length,4);
 for(const q of queue){assert.equal(q.form,1);assert(L.reviewDrillMistake(state,q.id,q.answers[0],q.form).correct);}
 assert.deepEqual(state.drillMistakes,{});assert.equal(JSON.stringify([state.drills,state.days]),before);
 const original=L.drillQuestions('a1-place',0)[3],alternate=L.nextDrillReviewQuestion({...original,packId:'a1-place',position:3});
 assert.notEqual(original.reading,alternate.reading);assert.equal(L.nextDrillReviewQuestion(alternate).reading,original.reading);
 L.gradeDrill(state,'a1-place',['错','错','错','错'],1);assert.equal(L.drillWrongQuestions(L.restore(state))[3].reading,alternate.reading);
});
test('词义重试替换同组干扰项，保留首答与打卡规则',()=>{
 for(const {id} of L.course.words){
  const first=L.wordQuestion(id,'meaning',()=>.4),next=L.wordQuestion(id,'meaning',()=>.4,first.options);
  assert.notDeepEqual([...first.options].sort(),[...next.options].sort());assert.equal(new Set(next.options).size,4);assert(next.options.includes(L.findWord(id).meaning));
 }
});
