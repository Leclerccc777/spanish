const nouns = require('./noun-practice');
const variants = {};
for (const n of nouns) {
  const water=n.id==='w24', feminine=n.gender==='阴性';
  const adjective=water?'limpia':n.id==='w25'?'ricos':feminine?'bonitas':'bonitos';
  const subject=water?'El agua':n.plural[0].toUpperCase()+n.plural.slice(1);
  const verb=water?'está':'son';
  const frame=`${subject} ${verb} ___`;
  variants[`${n.id}-article`]={prompt:`选择紧接单数名词 ${n.noun} 的正确冠词搭配。`, options:['el','la','los','las'].map(a=>`${a} ${n.noun}`), answer:n.singular, hint:'选项现在包含名词；仍判断同一个名词的单数定冠词。', explanation:`${n.singular} 是本题正确搭配。${water?'agua 仍为阴性。':''}`};
  variants[`${n.id}-adjective`]={prompt:`${frame}。把 ${water?'limpio（干净的）':n.id==='w25'?'rico（好喝的）':'bonito（漂亮的）'} 改成配合主语的词形，只填空格。`,answer:adjective,hint:'意思换了，性数配合规则不变；注意主语。',explanation:`${subject} 是${water?'阴性单数':feminine?'阴性复数':'阳性复数'}，形容词用 ${adjective}。`};
  variants[`${n.id}-sentence`]={prompt:`写出整句：${frame}.（${water?'水是干净的':n.id==='w25'?'这几杯咖啡很好喝':n.meaning+'是漂亮的，按所给主语描述多个'}）`,answer:`${subject} ${verb} ${adjective}.`,hint:'写完整框架，并让新形容词与主语配合。',explanation:`完整句：${subject} ${verb} ${adjective}.`};
}
module.exports=variants;
