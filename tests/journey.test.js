const {test}=require('node:test');
const assert=require('node:assert/strict');
const L=require('../miniprogram/lib/learning');
const TODAY='2026-10-11';
const answers=id=>L.foundations.find(f=>f.id===id).questions.map(q=>q.answer);
test('四步入门有 16 道原创题与参考引用，覆盖重音、阴阳性及例外',()=>{
 assert.equal(L.foundations.length,4);assert.equal(L.foundations.flatMap(f=>f.questions).length,16);
 const ids=new Set(L.course.sources.map(s=>s.id));for(const f of L.foundations){assert.ok(f.rules.length>=3&&f.examples.length>=4&&f.practice);for(const r of f.references)assert.ok(ids.has(r.sourceId));for(const q of f.questions){assert.equal(new Set(q.options).size,3);assert.ok(q.explanation);assert.ok(q.answer>=0&&q.answer<3);}}
 const gender=L.foundations.find(f=>f.id==='gender');assert.ok(gender.rules.join(' ').includes('el día'));assert.ok(gender.rules.join(' ').includes('la mano'));assert.ok(gender.rules.join(' ').includes('el agua fría'));
});
test('基础测验完整作答、75% 达标与保留最佳分，不给每日打卡或课程解锁',()=>{
 const s=L.emptyState(),a=answers('gender');assert.throws(()=>L.gradeFoundation(s,'gender',[0]));assert.throws(()=>L.gradeFoundation(s,'unknown',a));
 a[0]=(a[0]+1)%3;let r=L.gradeFoundation(s,'gender',a);assert.equal(r.score,75);assert.equal(r.passed,true);assert.equal(L.foundationProgress(s).find(f=>f.id==='gender').passed,true);
 L.gradeFoundation(s,'gender',[0,0,0,0]);assert.equal(s.foundations.gender.bestScore,75);assert.equal(s.foundations.gender.attempts,2);
 assert.equal(L.isUnlocked(s,'u2'),false);assert.equal(L.summary(s,TODAY).checkedIn,false);assert.deepEqual(s.days,{});
 assert.deepEqual(L.restore(JSON.parse(JSON.stringify(s))).foundations,s.foundations);
});
test('一年计划覆盖 52 周及 A1-A2-B1 24 个单元，建议不解锁课程',()=>{
 const weeks=L.yearPlan.weeks;assert.equal(weeks.length,52);assert.deepEqual(weeks.map(w=>w.number),Array.from({length:52},(_,i)=>i+1));
 assert.deepEqual(L.yearPlan.stages.map(s=>[s.id,s.start,s.end]),[['A1',1,12],['A2',13,28],['B1',29,48],['review',49,52]]);
 assert.equal(new Set(weeks.slice(0,48).map(w=>w.unitId)).size,24);assert.ok(weeks.every(w=>w.level!=='B2'));
 for(const w of weeks){assert.ok(L.course.units.some(u=>u.id===w.unitId));assert.ok(L.course.lessons.some(l=>l.id===w.lessonId));assert.ok(L.course.tasks.some(t=>t.id===w.taskId));for(const id of w.sourceIds)assert.ok(L.course.sources.some(s=>s.id===id));}
 const s=L.emptyState();L.startJourney(s,'2025-10-12');assert.equal(L.yearSummary(s,TODAY).day,365);assert.equal(L.yearSummary(s,TODAY).weekNumber,52);assert.equal(L.yearSummary(s,TODAY).reviewDay,true);assert.equal(L.isUnlocked(s,'u17'),false);assert.equal(L.summary(s,TODAY).learned,0);
});
test('日历按本地日期递进，跨周、跨年与闰日保持一致，重复开始不重置',()=>{
 const s=L.emptyState();assert.equal(L.yearSummary(s,TODAY).started,false);L.startJourney(s,'2024-02-28');L.startJourney(s,TODAY);assert.equal(s.journey.startDate,'2024-02-28');
 assert.equal(L.yearSummary(s,'2024-02-29').day,2);assert.equal(L.yearSummary(s,'2024-03-05').weekNumber,1);assert.equal(L.yearSummary(s,'2024-03-06').weekNumber,2);
 const y=L.emptyState();L.startJourney(y,'2026-12-30');assert.equal(L.yearSummary(y,'2027-01-01').day,3);
 const future=L.emptyState();L.startJourney(future,'2027-01-01');assert.equal(L.yearSummary(future,TODAY).day,0);assert.throws(()=>L.setWeekSkill(future,1,'words',true,TODAY));
 assert.throws(()=>L.startJourney(L.emptyState(),'2026-02-30'));assert.throws(()=>L.yearSummary(s,'invalid'));
});
test('五项周自检可反选，未来周不能提前填写，备份保留并不计语言能力',()=>{
 const s=L.emptyState();assert.throws(()=>L.setWeekSkill(s,1,'words',true,TODAY));L.startJourney(s,TODAY);
 assert.throws(()=>L.setWeekSkill(s,2,'words',true,TODAY));assert.throws(()=>L.setWeekSkill(s,1,'fake',true,TODAY));
 for(const skill of L.yearPlan.skills)L.setWeekSkill(s,1,skill.id,true,TODAY);
 assert.equal(L.yearSummary(s,TODAY).completedWeeks,1);assert.equal(L.summary(s,TODAY).checkedIn,false);
 L.setWeekSkill(s,1,'speak',false,TODAY);assert.equal(L.yearSummary(s,TODAY).completedWeeks,0);
 const restored=L.restore(JSON.parse(JSON.stringify(s)));assert.deepEqual(restored.journey,s.journey);assert.equal(L.yearSummary(restored,TODAY).day,1);
});
test('旧备份兼容；无效日期、记录、未知技能与伪造未来周被过滤',()=>{
 const old=L.emptyState();delete old.foundations;delete old.journey;assert.deepEqual(L.restore(old),L.emptyState());
 const raw=L.emptyState();raw.foundations={sounds:{bestScore:200,attempts:1},gender:{bestScore:75,attempts:1},unknown:{bestScore:100,attempts:1}};
 raw.journey={startDate:TODAY,weekChecks:{1:{date:TODAY,skills:['words','words','fake']},2:{date:TODAY,skills:['words']},53:{date:TODAY,skills:['words']},3:{date:'2026-02-30',skills:['words']}}};
 const s=L.restore(raw);assert.deepEqual(Object.keys(s.foundations),['gender']);assert.deepEqual(s.journey.weekChecks,{'1':{date:TODAY,skills:['words']}});
 raw.journey.startDate='2026-02-30';assert.deepEqual(L.restore(raw).journey,L.emptyJourney());
});
