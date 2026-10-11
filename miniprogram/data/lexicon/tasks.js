module.exports = ({packs,catalogue,levels}) => {
  const byId=new Map(catalogue.map(w=>[w.id,w]));
  const frames={
    A1:['Soy… y… .','En mi casa hay… .','Me gusta… porque… .'],
    A2:['Ayer… . Después… .','Quiero… porque… .','Mañana voy a… .'],
    B1:['Cuando… , … .','Creo que… porque… .','Por eso, … . Sin embargo, … .'],
    B2:['Por un lado, … . Por otro lado, … .','Aunque… , … .','Por lo tanto, propongo… . En definitiva, … .']
  };
  const contexts={A1:['介绍自己和自己的家','向朋友介绍一天的生活','描述附近的街道或商店'],A2:['邀请朋友参加周末活动','叙述一次出行或购物经历','说明你的学习安排与原因'],B1:['描述遇到的问题及解决过程','讲述一次经历并解释收获','向朋友提出建议并说明理由'],B2:['讨论学习或工作的一个选择','提出改善社区生活的方案','比较两种方案，承认局限并给出结论']};
  const min={A1:[8,2],A2:[25,3],B1:[45,4],B2:[65,5]};
  const connectors={A1:[],A2:['y','porque','pero','después'],B1:['porque','por eso','aunque','sin embargo','además','después'],B2:['por un lado','por otro lado','aunque','sin embargo','por lo tanto','en definitiva']};
  const target=w=>({wordId:w.id,label:w.spanish,meaning:w.meaning,forms:w.surfaceForms||w.spanish.split(' / ')});
  return packs.flatMap((pack,i)=>{
    const words=pack.wordIds.map(id=>byId.get(id));
    const previous=packs[i-1]&&packs[i-1].level===pack.level?byId.get(packs[i-1].wordIds[0]):catalogue.find(w=>w.level===pack.level&&!w.bank);
    const groupCount=Math.ceil(words.length/5);
    return Array.from({length:groupCount},(_,group)=>({id:group===0?pack.id:`${pack.id}-${group+1}`,packId:pack.id,groupNumber:group+1,groupCount,bank:true,level:pack.level,unitId:null,title:`${pack.level} 词包 ${pack.number} · 表达 ${group+1}/${groupCount}`,prompt:`情景建议：${contexts[pack.level][(pack.number-1)%3]}。把本组目标词和复习词放进有意义的句子；也可自选适合这些词的场景。先查清词义与用法，再写自己的经历。`,targets:words.slice(group*5,(group+1)*5).map(target),recycled:target(previous),minimumWords:min[pack.level][0],minimumSentences:min[pack.level][1],connectors:connectors[pack.level],outline:['明确人物、时间、地点或要解决的问题。','用目标词写短句，再用连接语建立顺序、因果或对照。','将前面学过的词加入同一情景；核对冠词、词性和动词变位。'],model:frames[pack.level].join('\n'),modelKind:'scaffold',rubric:['这里提供待填写的句型框架，不能当作已经完成的范文。','中文辅助释义需结合英文原义、官方词典和实际语境核对。','自动检查只覆盖公开列出的词形和形式要求，不判断语法或语义。'],sourceIds:['cefr','wiktionary-mirror']}));
  });
};
