// 每单元一项原创输出任务，复用前一单元词汇。自动反馈仅检查可见的形式指标。
module.exports = ({units,words,levels}) => {
  const initial = [
    ['第一次见面','和 Ana 打招呼，请一杯咖啡，然后道谢。',[0,2,3],'Hola, Ana. Un café, por favor. Gracias por tu ayuda.'],
    ['自我介绍','告诉新朋友你的名字、学生身份和家庭情况。',[0,1,4],'Mi nombre es Ana. Soy estudiante. Mi familia vive en China. Hola, ¿cómo estás?'],
    ['介绍我的家','向朋友介绍家里的书和桌子。',[0,1,2],'Mi casa es pequeña. Tengo un libro en la mesa. Soy estudiante y leo cada día.'],
    ['我在这里','告诉朋友你在学校附近，并描述位置。',[0,7,9],'Estoy aquí. La escuela está cerca de mi casa. Estoy bien, gracias.'],
    ['每天学一点','说自己每天怎样学习、读书和写作。',[1,6,7],'Estudio español cada día. Leo un libro y escribo una carta. La escuela está cerca.'],
    ['向朋友提问','询问学什么、住哪里，并回答学习西语的原因。',[0,2,9],'¿Qué estudias? ¿Dónde vives? Estudio español porque me gusta leer.'],
    ['邀请朋友吃饭','介绍两种食品并表达喜好。',[0,1,2],null],
    ['商量明天出行','描述一条街道与两处设施，并安排下一步活动。',[0,1,2],null]
  ];
  const outlines = {
    A1:['先说人物或地点。','写两三句简短信息，可以用 y / porque 连接。','尽量使用课上学过的变位和冠词。'],
    A2:['交代场景、时间和人物。','说明需求或发生的事情。','补充理由或下一步计划，复用一个旧词。'],
    B1:['介绍经历或问题背景。','按时间或因果顺序展开，给出具体例子。','解释自己的感受、理由或建议，联系旧词。'],
    B2:['明确自己的立场或方案。','给出理由和一个例子。','承认反方观点或局限，再提出回应。','用结论或下一步措施收束，联系前一主题。']
  };
  const connectors={A1:[],A2:['y','porque','después','pero'],B1:['porque','por eso','sin embargo','aunque','además','después'],B2:['por un lado','por otro lado','sin embargo','por lo tanto','aunque','en definitiva','a pesar de']};
  const minimums={A1:[8,2],A2:[25,3],B1:[45,4],B2:[65,5]};
  const target = (w,forms) => ({wordId:w.id,label:w.spanish,meaning:w.meaning,forms:forms||w.spanish.split(' / ')});
  const tasks=units.map((unit,i)=>{
    const ws=words.filter(w=>w.unitId===unit.id), level=unit.levelCode;
    const old=i?words.filter(w=>w.unitId===units[i-1].id)[0]:null;
    const spec=initial[i];
    const chosen=spec?spec[2].map(n=>ws[n]):ws.slice(0,3);
    const forms={estudiar:['estudiar','estudio'],leer:['leer','leo'],escribir:['escribir','escribo'],hablar:['hablar','hablo'],gustar:['gustar','gusta','gustan'],residuo:['residuo','residuos'],emisión:['emisión','emisiones']};
    const targets=chosen.map(w=>target(w,forms[w.spanish]));
    // 初始 A1 的跨单元复用已在手写范文中安排；其余任务加入前单元首词。
    const recycled=old?target(old,forms[old.spanish]):null;
    let model=spec&&spec[3]||chosen.map(w=>w.example).join(' ');
    if(level==='A2') model+=' Creo que es importante explicar bien lo que necesito. Por eso hablo con una amiga y preparo un plan sencillo para mañana.';
    if(level==='B1') model+=' Esta situación me hizo pensar en lo que puedo mejorar. Primero hablé con una amiga y después busqué más información. Creo que conviene explicar los motivos con ejemplos concretos, porque cada persona puede tener una experiencia diferente. Mi objetivo es aprender de lo ocurrido.';
    if(level==='B2') model+=' Por un lado, esta cuestión afecta a nuestra vida cotidiana y merece una respuesta clara. Por otro lado, cada decisión tiene costes y consecuencias que debemos comparar. Sin embargo, no basta con presentar una opinión sin ejemplos. Propongo escuchar a las personas afectadas y comprobar los resultados antes de ampliar el plan. En definitiva, necesitamos una solución viable y una evaluación transparente.';
    const bridges = [null, "Hola, Ana, gracias por escucharme.", "Mi nombre es Ana y esta es mi casa.", "Leo un libro mientras espero a mi amiga.", "Estoy aquí para practicar español.", "Hablo español con mis amigos.", "¿Qué quieres comer hoy?", "Me gusta caminar por esta calle.", "La calle tiene poco tráfico.", "Mi barrio está cerca de la escuela.", "Por la mañana voy a pedir una cita.", "Tengo que cuidar mi salud durante el viaje.", "Después de hacer una reserva, compré la camisa.", "El precio de la entrada era bueno.", "Este fin de semana saldré si hace sol.", "Si hace buen tiempo, podemos estudiar fuera.", "El curso al que asistía me ayudó a organizar mi tiempo.", "Desde mi infancia he tenido interés por el aprendizaje.", "Puedo explicar mi aprendizaje y mis capacidades al buscar empleo.", "La noticia trata de un nuevo programa de empleo.", "Esta noticia me animó a cuidar más el medio ambiente.", "Una aplicación puede mostrar consejos sobre el medio ambiente.", "Quiero que esta relación se base en la confianza, por eso no comparto mi contraseña.", "La buena relación entre el personal y los viajeros ayudó a resolver el problema.", "El retraso en recibir apoyo puede limitar el acceso a la educación.", "La igualdad de oportunidades también debería orientar la inversión.", "El presupuesto debe incluir medidas para reducir emisiones.", "La sostenibilidad requiere investigación y resultados fiables.", "Conviene comprobar qué investigación apoya cada noticia.", "Un sesgo puede dificultar la comprensión de otras culturas.", "Podemos construir un argumento a favor de proteger el patrimonio.", "Cada argumento debe explicar por qué la propuesta es útil."];
    if (recycled) model += " " + bridges[i];
    return {id:`e${i+1}`,unitId:unit.id,level,title:spec?spec[0]:`${unit.title} · 表达挑战`,prompt:spec?spec[1]:`${unit.goal} 围绕“${unit.title}”写一段有具体情景或例子的文字，加入前一单元的复习词。`,targets,recycled,minimumWords:minimums[level][0],minimumSentences:minimums[level][1],connectors:connectors[level],outline:outlines[level],model,rubric:['词汇放在有意义的句子中，注意性数与动词变位。','句子围绕同一个情景展开，避免仅罗列词语。','对照范文自查后，用自己的经历重写；自动检查不能判断语法或观点质量。'],sourceIds:['cefr',level==='A1'||level==='A2'?'pcic-functions':'pcic-functions-b']};
  });
  const find=spanish=>words.find(w=>w.spanish===spanish);
  const finalTargets=['ciudad','curso','objetivo','medio ambiente','propuesta','evaluación'].map(s=>target(find(s)));
  tasks.push({id:'final',unitId:units[units.length-1].id,level:'B2',final:true,title:'综合任务：给城市写一份学习提案',prompt:'为你的城市设计一个西语学习与环保交流活动。用 A1–B2 的词汇写出背景、目标、具体安排、可能的困难和评估办法。建议 120–180 词，至少两段。',targets:finalTargets,recycled:null,minimumWords:100,minimumSentences:6,minimumParagraphs:2,connectors:connectors.B2,outline:['第一段：交代城市、学习需求、课程与目标。','第二段：活动如何联系环保，谁参与，怎样执行。','第三段（可选）：费用或时间的困难、回应与评估办法。'],rubric:['同一文本内复用 A1、A2、B1、B2 的目标词。','明确立场，给具体例子，承认局限并提出可执行的安排。','先独立完成，再对照范文；请教师评价连贯性和语言准确性。'],sourceIds:['cefr','pcic-functions-b'],model:'En mi ciudad hay muchas personas que quieren aprender español, pero no todas pueden asistir a una escuela. Propongo un curso gratuito en la biblioteca. El objetivo es practicar el idioma y hablar del medio ambiente con vecinos de diferentes edades. Cada semana leeríamos un texto breve y prepararíamos una conversación sobre una acción cotidiana, como ahorrar agua o reutilizar bolsas.\n\nPor un lado, esta propuesta permitiría aprender vocabulario en situaciones reales. Por otro lado, necesitaríamos voluntarios y un horario accesible. Aunque el presupuesto sea limitado, podríamos empezar con un grupo pequeño. La evaluación incluiría una presentación y una conversación al final del curso. En definitiva, no bastaría con memorizar palabras: habría que utilizarlas para explicar ideas y escuchar a los demás.'});
  return tasks;
};
