const {test}=require('node:test');const assert=require('node:assert/strict');const L=require('../miniprogram/lib/learning');
test('52 周各有七天具体指南，词汇、规则、题目与入口随本周课程变化',()=>{
  for(let n=1;n<=52;n++){
    const days=L.weekGuide(n),w=L.yearPlan.weeks[n-1],lesson=L.course.lessons.find(l=>l.id===w.lessonId);assert.equal(days.length,7);assert.equal(days[1].target.id,w.lessonId);assert.ok(days[1].steps[0].includes(lesson.rules[0]));assert.ok(days[2].steps[1].includes(lesson.questions[0].prompt));assert.equal(days[5].target.id,w.taskId);
    for(const [i,d] of days.entries()){assert.equal(d.day,i+1);assert.equal(d.steps.length,2);assert.ok(d.steps.every(s=>s.length>20));if(d.target.kind==='drill')assert.ok(L.drillPacks.some(p=>p.id===d.target.id));}
  }
  assert.notDeepEqual(L.weekGuide(1),L.weekGuide(29));assert.throws(()=>L.weekGuide(0));assert.throws(()=>L.weekGuide(53));
});
test('复盘周少新词，缺少音频不包装成听力完成',()=>{
  assert.ok(L.weekGuide(49)[0].steps[1].includes('少学新词'));assert.ok(L.weekGuide(29)[3].steps[1].includes('听力自检暂不勾选'));
});

test('每周阅读到词组、个人对话和迁移均对应真实材料，复盘接入长文章', () => {
  for (let week=1; week<=52; week++) {
    const days=L.weekGuide(week), p=L.drillPacks.find(p=>p.id===days[3].target.id);
    assert.equal(days[4].target.id,p.id);
    assert.ok(days[3].steps[0].includes(p.words[0][0]));
    assert.ok(days[4].steps[0].includes(p.dialogue.personalize));
    assert.ok(days[4].steps[1].includes(p.newScene.prompt));
    assert.ok(days[4].steps[1].includes(p.newScene.check));
    if(week>=49) assert.ok(days[3].steps[0].includes(p.article.title));
  }
});
