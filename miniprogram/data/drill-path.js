// Presentation order only: stable IDs, prerequisites and saved scores stay intact.
const order = [
  'a1-place', 'a1-greetings', 'a1-agreement', 'a1-routine', 'a1-questions', 'a1-likes',
  'a2-weekend', 'a2-shopping', 'a2-plans', 'a2-routine', 'a2-help', 'a2-travel',
  'b1-story', 'b1-advice', 'b1-opinion', 'b1-relative', 'b1-wishes', 'b1-anterior',
  'b2-concession', 'b2-hypothesis', 'b2-report', 'b2-specific', 'b2-passive', 'b2-evaluation'
];
const levels = {
  A1: { title: '读懂身边的短句', preparation: '先认识元音和重音，把 el / la 与名词一起读；不熟悉时先回四步入门。', strategy: '先找谁、在哪里、做什么。遇到生词先借助已认识的词猜意思，再看词组提示。', milestone: '读完一段生活介绍，找出人物、地点和时间，再换成自己的信息说三句。' },
  A2: { title: '把事件连成一段', preparation: '能用现在时介绍自己、说喜好并问简单问题后，再练过去活动和出行安排。', strategy: '圈出时间词，再按先后顺序连起事件；分清已经做的事和还没做的事。', milestone: '读懂一封出行邮件，说明发生了什么、有什么问题、下一步怎么做。' },
  B1: { title: '读懂多段生活文章', preparation: '先能讲清过去活动、日常安排和求助，再加入背景、建议及不同人的观点。', strategy: '每段先用一句中文概括，再找原因、转折和结果。用原文说明判断，不必逐词翻译。', milestone: '读一篇多段经历文章，说出主旨、变化及依据，再用自己的话概括并回应。' },
  B2: { title: '比较观点与证据', preparation: '能连贯叙述并区分事实和个人看法后，再讨论假设、信息来源与方案限制。', strategy: '标出谁提出什么观点、凭什么、还有什么未知。留意假设或计划是否真的发生。', milestone: '读一篇项目评论，区分证据和推断，提出有条件的建议。' }
};
// Question, exact source evidence, interpretation: optional support, never a score.
const reading = {
  'a1-place': ['房间里有什么？书在哪里？', 'Hay una mesa en mi habitación. Mi libro está en la mesa.', 'hay 先介绍一张桌子；está 再说明已知的书在哪里。不要把两句话都理解成“有”。'],
  'a1-greetings': ['顾客先说了什么，提出请求后怎么道谢？', 'Dice: «Buenos días. Un café, por favor». Después dice «Gracias».', '先打招呼并提出请求，再道谢；por favor 是请求时的礼貌用语。'],
  'a1-agreement': ['哪些东西不止一个？它们大小一样吗？', 'Los libros son pequeños. Cerca de la mesa hay dos sillas. Las sillas son grandes.', 'libros 和 sillas 都不止一个；书小、椅子大。先找所说的东西，再看形容词。'],
  'a1-routine': ['Ana 什么时候学习，什么时候不工作？', 'Estudia español por la mañana. Por la tarde trabaja. No trabaja los domingos.', '上午学习，下午工作，星期日不工作；no 只否定它后面的工作。'],
  'a1-questions': ['Luis 今天为什么不工作？他在读什么？', 'Hoy no trabaja porque es domingo. Ana pregunta: «¿Qué lees?». Luis responde: «Leo un libro de español».', 'porque 后解释原因；问题里的 lees 是问你，回答里的 leo 是说我。'],
  'a1-likes': ['Luis 为什么喜欢在家读书？', 'Le gusta leer en casa porque aprende palabras nuevas.', 'porque 引出理由。先说喜欢做什么，再补为什么，而不是把全部喜好列一遍。'],
  'a2-weekend': ['看电影之前和之后分别做了什么？', 'Primero comimos en su casa. Después fuimos al cine y vimos una película. Al final volví a casa.', 'primero、después、al final 串起吃饭、看电影、回家；comimos 是我们，volví 是我。'],
  'a2-shopping': ['Ana 不满意的是衣服本身，还是尺码？', 'Le gusta una camisa, pero esta talla es pequeña.', '她喜欢这件衬衫，pero 后才是问题：尺码小。换大一号不等于不喜欢衣服。'],
  'a2-plans': ['他们一定会去海滩吗？', 'Si hace sol, vamos a la playa. Si llueve, vamos al museo.', '两项安排都有天气条件，不能把有条件的计划读成确定事实。'],
  'a2-routine': ['洗澡和准备早餐，哪件事在前？', 'Después de ducharse, prepara el desayuno.', 'después de 后面的洗澡先发生，准备早餐在后；句子顺序不等于事件顺序。'],
  'a2-help': ['Luis 打电话想办什么事？接电话的人先问什么？', 'Llama al centro de salud para pedir una cita. Dice que necesita hablar con una médica. La persona que atiende le pregunta su nombre.', 'para 表示打电话的目的；询问姓名是安排预约的一步，不是已经看完医生。'],
  'a2-travel': ['出发前还有什么没准备好？', 'Todavía no han preparado las maletas. Van a salir mañana.', 'todavía no 表示还没有；明天出发是计划。不要把订房、买票都误当作未完成。'],
  'b1-story': ['电话响起时，Ana 正在做什么？', 'La primera noche estudiaba cuando sonó el teléfono: era su amiga.', 'estudiaba 是当时的背景，sonó 是发生的事件；最后说明打来电话的是朋友。'],
  'b1-advice': ['Ana 的建议和她自己采取的帮助有什么不同？', 'Ana le aconseja que lea en voz alta cada día. También habla despacio para que Luis la entienda.', '大声读是让 Luis 做的；慢慢说是 Ana 自己做的，目的是让 Luis 听懂她。'],
  'b1-opinion': ['Ana 否定阅读的作用了吗？', 'Ana cree que es útil, pero no cree que sea suficiente.', '她认为阅读有用，却不认为只阅读就足够。转折限制的是充分性，并没有否定用处。'],
  'b1-relative': ['哪一个地方提供下午的课程，哪一个地方有大图书馆？', 'Marta estudia en una escuela que ofrece cursos por la tarde. La profesora que la ayuda prepara ejercicios claros. La ciudad donde vive Marta tiene una biblioteca grande.', 'que ofrece 补充学校的信息；donde vive 补充城市的信息。看清修饰对象，不能混成同一地点。'],
  'b1-wishes': ['一起学习与五点到达，分别是谁的愿望？', 'Espero que podamos estudiar juntas. Yo espero llegar a la biblioteca a las cinco', 'podamos 包含说话者和朋友；llegar 的主语沿用 yo。愿望不等于已经实现。'],
  'b1-anterior': ['Luis 到站前，什么已经发生了？', 'Cuando Luis llegó a la estación, el tren ya había salido. Había comprado el billete el día anterior.', '火车已走，车票也在前一天买好；先找 llegó 这个参照点，再排更早的事。'],
  'b2-concession': ['Marta 支持项目时保留了什么条件？', 'Sin embargo, propone empezar con una prueba pequeña. Por lo tanto, recomienda evaluar los resultados antes de ampliarlo.', '她主张先小规模试行、评估后再扩大；支持并不意味着马上全面铺开。'],
  'b2-hypothesis': ['免费课程是现有安排还是理想方案？', 'Si tuviera más recursos, ofrecería clases gratuitas. Con el presupuesto actual, solo puede organizar un grupo pequeño.', '免费课程建立在更多资源的假设上；现有预算只够小组活动，两者要分开。'],
  'b2-report': ['转述了计划以后，是否就能确认事情完成？', 'Luis aclaró que no sabía si lo había presentado.', '不能。no sabía si 明确保留未知；lo 指报告，不能用宣布计划来证明提交结果。'],
  'b2-specific': ['谁已经找到课程，谁仍在寻找？', 'Marta ya conoce un curso que ofrece prácticas. Su hermano todavía busca uno que tenga horario nocturno.', 'ya conoce 说明已知课程；todavía busca 表示仍在寻找，要求符合条件不代表已经存在。'],
  'b2-passive': ['这份报告交代了什么，又没有交代什么？', 'El documento explica el método, pero no incluye los nombres de los participantes.', '交代方法，没有公开参与者姓名。隐去姓名并不能单凭这一点推断没有访谈。'],
  'b2-evaluation': ['为什么建议先从小空间开始？', 'El proyecto requiere dinero; sin embargo, puede empezar con un espacio pequeño.', '先承认资金需求，再给出缩小规模的办法；办法回应限制，而不只是加一个转折词。']
};
module.exports = { order, levels, reading };
