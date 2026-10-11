const course=require('./course');
const stages=[{id:'A1',start:1,end:12,newWords:5,minutes:20,focus:'问候、身份、位置、喜好与日常计划',output:'用 3–5 句介绍自己或描述身边事物'},{id:'A2',start:13,end:28,newWords:8,minutes:25,focus:'出行、购物、过去经历、请求与约定',output:'写 50–80 词情景短文，并做 1 分钟口头复述'},{id:'B1',start:29,end:48,newWords:10,minutes:30,focus:'叙述经历、解释理由、建议与意见',output:'写 100–150 词短文，并说 2 分钟观点或经历'},{id:'review',level:'B1',start:49,end:52,newWords:0,minutes:30,focus:'跨阶段复用、补弱项与整合听说读写',output:'完成一份学习档案，准备四项技能的外部评估'}];
const rhythm=[['第 1 天','旧词复习 + 学一条语法规则，读例句'],['第 2 天','复习 + 新词，在短句中练性别和冠词'],['第 3 天','复习 + 语法题，解释一道错题'],['第 4 天','听适合本阶段的材料，先听大意再看文字'],['第 5 天','围绕本周主题说几句，再写一段并改写'],['第 6 天','复用前几周的词，完成一次综合表达'],['第 7 天','不强求新词：回顾、补练或休息，做周自检']];
const skills=[{id:'words',label:'复习本周词汇，能在例句中理解'},{id:'grammar',label:'完成配套语法练习，并解释错题'},{id:'listen',label:'听一段适合本阶段材料，记录要点'},{id:'speak',label:'用西语完成本周口头任务，可录音回听'},{id:'write',label:'完成本周书面表达，并至少修订一次'}];
const weeks=Array.from({length:52},(_,i)=>{
 const number=i+1,stage=stages.find(s=>number>=s.start&&number<=s.end),level=stage.level||stage.id;
 const units=course.units.filter(u=>u.levelCode===level),position=Math.min(7,Math.floor((number-stage.start)*8/(stage.end-stage.start+1))),unit=units[position];
 const isReview=stage.id==='review';
 return {number,stage:stage.id,level,dayStart:i*7+1,dayEnd:(i+1)*7,unitId:unit.id,lessonId:course.lessons.find(l=>l.unitId===unit.id).id,taskId:course.tasks.find(t=>t.unitId===unit.id).id,title:isReview?['回顾生活与过去经历','复用词汇解释理由与建议','整合听说读写学习档案','复盘并安排下一阶段'][number-49]:unit.title,focus:isReview?stage.focus:course.lessons.find(l=>l.unitId===unit.id).title,output:stage.output,minutes:stage.minutes,newWords:stage.newWords,foundationIds:number===1?['sounds','stress']:number===2?['gender','agreement']:[],listening:'用你已有的、本阶段有文字稿的分级音频：第一遍听大意，第二遍记人物与事件，第三遍对照文字并跟读。本版本尚未内置分级听力。',sourceIds:['cefr-levels','pcic-functions','pcic-grammar','pcic-functions-b','pcic-grammar-b']};
});
module.exports={stages,weeks,rhythm,skills,finalDay:'第 365 天：整理学习档案，对照 B1 can-do 描述复盘；由教师或合适的考试评估听说读写，不凭打卡天数认定等级。'};
