const C = require('./course');
const Y = require('./year-plan');
const packs = require('./drills');
function weekGuide(number) {
  if (!Number.isInteger(number) || number < 1 || number > 52) throw new Error('请选择第 1–52 周');
  const w = Y.weeks[number - 1], unit = C.units.find(u => u.id === w.unitId), lesson = C.lessons.find(l => l.id === w.lessonId), task = C.tasks.find(t => t.id === w.taskId);
  const words = C.curriculumWords.filter(word => word.unitId === unit.id).slice(0, 5).map(word => word.spanish).join(' · ');
  const matches = packs.filter(p => p.lessonIds.includes(lesson.id));
  const pack = matches.find(p => p.lessonIds.length === 1 && p.level === w.level) || matches.find(p => p.level === w.level) || matches[0];
  const spoken = w.level === 'A1' ? '先说 3–5 句' : w.level === 'A2' ? '尝试说 1 分钟' : '尝试说 2 分钟';
  const review = w.stage === 'review';
  return [
    { day:1,title:'复习本周的词，先找薄弱处',steps:[`本周例词：${words}。先回忆自己已练过的 3–5 个词，再看词卡核对。`,review?'综合复盘周少学新词，优先整理 A1–B1 常错词。':'例词可预览；真正的新词仍从已经开放的范围学习，不把建议数量当作已学数量。'],target:{kind:'session',id:'',label:'练实际开放的词卡'} },
    { day:2,title:'理解一条规则，读出短句',steps:[`${lesson.title}：${lesson.rules[0]}`,`对照例句：${lesson.examples[0][0]} / ${lesson.examples[0][1]}。再换一个人物或物品，读出自己的句子。`],target:{kind:'lesson',id:lesson.id,label:'打开本周语法课'} },
    { day:3,title:'做四题，解释为什么',steps:[`课程开放后完成 ${lesson.title} 的四题；先想清楚语境，避免只认熟悉词形。`,`本课题例：${lesson.questions[0].prompt}。答后用中文解释自己的选择，错题订正后再读整句。`],target:{kind:'lesson',id:lesson.id,label:'做本周语法练习'} },
    { day:4,title:'短阅读与自有听力',steps:[`阅读“${pack.title}”的小短文，借助词语提示找人物、时间、事件与理由，不急着看答案。`,'如果已有适合本阶段、配文字稿的音频，可先听大意再核对文字。没有音频时先完成阅读，听力自检暂不勾选。'],target:{kind:'drill',id:pack.id,label:'打开配套短阅读'} },
    { day:5,title:'围绕本周主题开口',steps:[`目标：${unit.goal} ${spoken}，表达自己的经历或使用明确的虚构场景。`,'可用自己的录音工具回听：检查意思是否清楚、是否停顿太多，再说第二遍。本站不自动评价发音。'],target:{kind:'expression',id:task.id,label:'查看本周表达题目'} },
    { day:6,title:'写下来，至少改一次',steps:[`按“${task.title}”写自己的内容，复用目标词与旧词；本任务形式目标至少 ${task.minimumWords} 词、${task.minimumSentences} 句。`,'先保存草稿，再按自查问题改一处；形式检查不能判断语法或交际质量，尽量请同伴或教师反馈。'],target:{kind:'expression',id:task.id,label:'写本周表达'} },
    { day:7,title:'回顾、补练或休息',steps:[review?'整理一份跨阶段学习档案：短文、修订前后文字与需要反馈的问题。':'回忆本周三个确实用过的词和一个仍容易出错的结构；可选择休息，不强求补满新词。','做过哪些听说读写练习，就勾选哪些周自检。未做的保留空白，下周先补薄弱处。'],target:{kind:'review',id:'',label:'查看待订正项'} }
  ];
}
module.exports = { weekGuide };
