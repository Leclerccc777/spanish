// 原创受控练习；复用既有课程依据，新增材料待教师审稿。
// 等级是本站教学顺序，不是官方逐题定级。
const course = require('./course');
const coaching = require('./drill-coaching');
const choice = (prompt, options, answer, explanation) => ({ kind: 'choice', prompt, options, answers: [options[answer]], explanation });
const text = (prompt, answers, explanation) => ({ kind: 'text', prompt, answers: Array.isArray(answers) ? answers : [answers], explanation });
const packs = [
  {
    id: 'a1-place', level: 'A1', title: '我是谁，东西在哪里', lessonIds: ['g2', 'g4', 'g8'],
    goal: '区分身份、特定事物的位置和某处有某物。', recycled: ['el libro', 'la mesa', 'la casa'],
    rules: [
      "介绍“我是谁”，用 ser：Soy estudiante.（我是学生。）先把 soy 和自己的身份连起来说。",
      "说“这本书在哪里”，用 estar：El libro está en la mesa.（这本书在桌上。）多个物品则用 están。",
      "第一次告诉别人“这里有……”，用 hay：Hay un libro / dos libros.（有一本书 / 两本书。）数量变了，hay 不变。不要只靠“永久或临时”选择 ser / estar。"
    ],
    examples: [['Soy estudiante. Estoy en casa.', '我是学生。我在家。'], ['Hay dos libros. Los libros están en la mesa.', '有两本书。这两本书在桌上。']],
    reading: 'Soy estudiante y estoy en casa. Hay una mesa en mi habitación. Mi libro está en la mesa.',
    glossary: 'habitación：房间；mi：我的；en：在……里面或上面。',
    questions: [
      choice('介绍自己的身份：Yo ___ estudiante.', ['estoy', 'soy', 'hay'], 1, '身份用 ser，yo 对应 soy。'),
      text('只填动词：El libro ___ en la mesa.（这本书在桌上）', 'está', '特定物品的位置用 estar；el libro 是单数，写 está，保留重音。'),
      text('只改动词，写出整句：Hay dos libros. Los libros hay en la mesa.', 'Hay dos libros. Los libros están en la mesa.', '先用 hay 介绍两本书，再用 están 说明这些特定书的位置。'),
      choice('根据短文，哪句话符合事实？', ['El libro está en la mesa.', 'El libro está en la escuela.', 'No hay una mesa.'], 0, '短文最后一句明确说明书在桌上。')
    ],
    output: { prompt: '用 3 句介绍自己和身边的一个物品：身份、某处有什么、物品的位置。可替换地点与物品。', starters: ['Soy…', 'En mi… hay…', 'El / La… está…'], rubric: ['身份是否使用 ser？', '是否区分 hay 的新信息与 estar 的具体位置？', '是否保留冠词与 está 的重音？'], model: 'Soy estudiante. En mi casa hay una mesa. Mi libro está en la mesa.' }
  },
  {
    id: 'a1-routine', level: 'A1', title: '把每天的动作说出来', lessonIds: ['g5', 'g6'],
    goal: '按人称改变规则现在时，并把几个动作串起来。', recycled: ['estudiante', 'casa', 'libro'],
    rules: [
      "说“我做”，先练 yo estudio / como / vivo（我学习 / 吃 / 住）；说“我们做”，换成 estudiamos / comemos / vivimos。先看做事的人，再换结尾。",
      "Estudio español. 就能表示“我学习西语”，不必每次都加 yo；动词本身已经提示是谁在做。",
      "想说“不做”，把 no 放在变过形式的动词前：No trabajo hoy.（我今天不工作。）"
    ],
    examples: [['Estudio español y leo en casa.', '我学习西语并在家阅读。'], ['Vivimos aquí. No trabajamos hoy.', '我们住在这里。我们今天不工作。']],
    reading: 'Ana vive en una ciudad pequeña. Estudia español por la mañana. Por la tarde trabaja. No trabaja los domingos.',
    glossary: 'por la mañana / tarde：在早上 / 下午；los domingos：每逢周日。',
    questions: [
      choice('Yo ___ español cada día.', ['estudia', 'estudiamos', 'estudio'], 2, 'yo 对应 estudio。'),
      text('只填 vivir 的现在时：Nosotros ___ en una casa pequeña.', 'vivimos', 'nosotros 对应 vivimos。'),
      text('只改主语和动词的配合，写出整句：Yo estudia español y trabaja en casa.', 'Yo estudio español y trabajo en casa.', '两个动作都由 yo 做，分别用 estudio 和 trabajo。'),
      choice('根据短文，Ana 什么时候不工作？', ['Los domingos.', 'Por la tarde todos los días.', 'Por la mañana y por la tarde.'], 0, '短文明确说 No trabaja los domingos。')
    ],
    output: { prompt: '写 3 句真实的日常安排，包括一个否定句。复用 casa 或 libro。', starters: ['Cada día estudio…', 'Vivo / Trabajo…', 'No…'], rubric: ['所有动词是否与我或我们配合？', 'no 是否放在变位动词前？', '是否写了自己的真实安排？'], model: 'Cada día estudio español. Leo un libro en casa. No trabajo los domingos.' }
  },
  {
    id: 'a1-likes', level: 'A1', title: '喜欢一个东西，也喜欢做事情', lessonIds: ['g7'],
    goal: '区分 gusta / gustan，并给出简单理由。', recycled: ['estudiar', 'leer', 'libro'],
    rules: [
      "喜欢一个东西，用 me gusta：Me gusta el café. 喜欢做一件事，也用 me gusta：Me gusta leer.（我喜欢阅读。）leer 保持动词原形。",
      "喜欢多个东西，用 me gustan：Me gustan los libros.（我喜欢书。）先看喜欢的东西是否为复数，再决定要不要加 n。",
      "想告诉别人为什么喜欢，用 porque 接理由：Me gusta leer porque aprendo.（我喜欢阅读，因为能学到东西。）"
    ],
    examples: [['Me gusta estudiar español.', '我喜欢学习西语。'], ['Me gustan las manzanas.', '我喜欢苹果。']],
    reading: 'A Luis le gusta el café. También le gustan las manzanas. Le gusta leer en casa porque aprende palabras nuevas.',
    glossary: 'también：也；aprende：学到；palabras nuevas：新词。',
    questions: [
      choice('Me ___ los libros.', ['gusta', 'gustan', 'gusto'], 1, 'los libros 是复数主语，用 gustan。'),
      text('只填 gustar 的对应形式：Me ___ estudiar español.', 'gusta', '不定式 estudiar 作主语时，本结构用 gusta。'),
      text('只改动词，写出整句：Me gustan el café y me gusta las manzanas.', 'Me gusta el café y me gustan las manzanas.', 'el café 为单数用 gusta；las manzanas 为复数用 gustan。'),
      choice('根据短文，Luis 为什么喜欢在家阅读？', ['Porque aprende palabras nuevas.', 'Porque no le gusta el café.', 'Porque trabaja en una escuela.'], 0, '理由由 porque 引出：他能学到新词。')
    ],
    output: { prompt: '写 3 句：一种喜欢的东西、几种喜欢的东西、一个喜欢做的动作，并用 porque 给一个理由。', starters: ['Me gusta…', 'Me gustan…', 'Me gusta… porque…'], rubric: ['gusta / gustan 是否按喜好事物配合？', '是否把动作写成不定式？', '理由是否与自己的喜好相关？'], model: 'Me gusta el café. Me gustan los libros. Me gusta leer porque aprendo español.' }
  },
  {
    id: 'a2-weekend', level: 'A2', title: '昨天发生了什么', lessonIds: ['g14'],
    goal: '用明确过去时间与顺序词叙述已结束的活动。', recycled: ['leer', 'gustar', 'ciudad'],
    rules: [
      "说昨天已经结束的一次活动，可以用简单过去时：Ayer visité un museo.（昨天我参观了博物馆。）先交代时间，再说活动。",
      "“我去了”和“我看了”要记特殊形式 fui 和 vi；换成别的人做，也要换动词。",
      "用 primero（先）、después（然后）、al final（最后）帮助别人跟上事情的顺序。这一包先把事件讲清楚。"
    ],
    examples: [['Ayer visité un museo. Después comí en casa.', '昨天我参观了博物馆。之后在家吃饭。'], ['Ana compró una entrada.', '安娜买了一张入场券。']],
    reading: 'El sábado visité a una amiga. Primero comimos en su casa. Después fuimos al cine y vimos una película. Al final volví a casa.',
    glossary: 'cine：电影院；comimos / fuimos / vimos：我们吃了 / 去了 / 看了；volví：我回去了。',
    questions: [
      choice('Ayer yo ___ una película.（ver）', ['veo', 'vi', 'ver'], 1, '明确已结束的过去活动，用 vi。'),
      text('只填 comprar 的过去式：Ayer Ana ___ una entrada.', 'compró', 'Ana 是第三人称单数，过去式 compró 的重音不可漏。'),
      text('只改动词，写出整句：Ayer yo visito un museo y como en casa.', 'Ayer yo visité un museo y comí en casa.', '题目要求过去叙述，两个动作均为已结束事件：visité、comí。'),
      choice('根据短文，去电影院之前做了什么？', ['Comimos en casa de una amiga.', 'Volví a casa.', 'Vimos una película.'], 0, 'Primero 表示先吃饭，Después 才去电影院。')
    ],
    output: { prompt: '用 4 句写昨天或上周末的活动，注明时间，并使用 primero / después / al final 中至少两个。', starters: ['Ayer / El sábado…', 'Primero…', 'Después…', 'Al final…'], rubric: ['是否明确已结束的过去时间？', '动词是否按人称和过去时配合？', '顺序词是否与事件顺序一致？'], model: 'Ayer visité a una amiga. Primero comimos en su casa. Después vimos una película. Al final volví a casa.' }
  },
  {
    id: 'a2-shopping', level: 'A2', title: '在商店完成一次请求', lessonIds: ['g13', 'g16'],
    goal: '指称物品、提出请求，并用宾语代词避免重复。', recycled: ['café', 'pequeño', 'gustar'],
    rules: [
      "指一件衬衫，说 esta camisa；指几件，说 estas camisas。camisa 是阴性，指示词也要配合单复数。",
      "已经说过衬衫，再说“我买它”可用 La compro；买几件则用 Las compro。la / las 代替刚提到的衬衫。",
      "请求帮助可以说 ¿Puedes ayudarme, por favor?（你能帮我一下吗？）Puedes 后用动词原形；说话时也留意语气和场合。"
    ],
    examples: [['¿Puedes ayudarme, por favor?', '你能帮我一下吗？'], ['Estas camisas son pequeñas. Las compro.', '这些衬衫是小号的。我买下它们。']],
    reading: 'Ana está en una tienda. Le gusta una camisa, pero esta talla es pequeña. Pregunta: «¿Puedes ayudarme, por favor? Necesito una talla más grande».',
    glossary: 'talla：尺码；más grande：更大的；pregunta：她问。',
    questions: [
      choice('___ camisas son baratas.', ['Este', 'Estas', 'Esta'], 1, 'camisas 是阴性复数，指示词用 estas。'),
      text('只填代词：Me gusta esta camisa. ___ compro.', 'La', 'la 指代阴性单数 camisa。'),
      text('只改 ayudar 的形式，写出整句：¿Puedes ayudas a Ana, por favor?', '¿Puedes ayudar a Ana, por favor?', 'poder 后接不定式 ayudar，而非 ayudas。'),
      choice('根据短文，Ana 请求店员帮助的原因是什么？', ['Necesita una talla más grande.', 'La tienda está cerrada.', 'Quiere comprar café.'], 0, '她觉得当前尺码小，需要更大的尺码。')
    ],
    output: { prompt: '写一个 4 句购物对话：说明想买的物品、提出礼貌请求、询问或说明尺码、确认选择。', starters: ['Me gusta esta…', '¿Puedes…, por favor?', 'Necesito…', 'La / Lo…'], rubric: ['指示词与物品性数是否一致？', 'poder 后是否使用不定式？', '对话是否真的完成一个请求？'], model: 'Me gusta esta camisa. ¿Puedes ayudarme, por favor? Necesito una talla más grande. Esta talla está bien; la compro.' }
  },
  {
    id: 'a2-plans', level: 'A2', title: '比较两个安排，再做选择', lessonIds: ['g8', 'g9', 'g15'],
    goal: '比较地点，根据现实条件商量计划。', recycled: ['casa', 'ciudad', 'pequeño'],
    rules: [
      "比较“更小”，用 más pequeño que；比较“一样小”，用 tan pequeño como。把两组词一起记，别只背 más 或 tan。",
      "说接下来的安排，用 ir a 加动词原形：Vamos a visitar un museo.（我们打算参观博物馆。）",
      "给计划加一个可能的条件：Si llueve, vamos al museo.（如果下雨，我们就去博物馆。）这里 si 后用现在时；下雨还只是条件。"
    ],
    examples: [['Este museo es más pequeño que el otro.', '这座博物馆比另一座小。'], ['Si hace sol, podemos ir a la playa.', '如果晴天，我们可以去海滩。']],
    reading: 'Mañana vamos a visitar la ciudad. Si hace sol, vamos a la playa. Si llueve, vamos al museo. El museo está más cerca del hotel que la playa.',
    glossary: 'llueve：下雨；más cerca：更近；hotel：酒店；playa：海滩。',
    questions: [
      choice('Esta casa es tan pequeña ___ la otra.', ['que', 'como', 'de'], 1, '同等比较用 tan…como。'),
      text('只填 ir 的现在时：Nosotros ___ a visitar un museo.', 'vamos', 'nosotros 对应 vamos，后接 a + 不定式 visitar。'),
      text('只改动词，写出整句：Si llueve, podemos visitamos el museo.', 'Si llueve, podemos visitar el museo.', 'podemos 后接不定式 visitar；本句使用现实条件的现在时。'),
      choice('根据短文，如果下雨，计划是什么？', ['Ir al museo.', 'Ir a la playa.', 'Volver a otra ciudad.'], 0, 'Si llueve 的条件对应去博物馆，并未断言明天一定下雨。')
    ],
    output: { prompt: '用 4 句安排一个周末：比较两个地点，做一个计划，并给好天气与坏天气各一个选择。', starters: ['… es más… que…', 'Vamos a…', 'Si hace sol,…', 'Si llueve,…'], rubric: ['比较结构是否完整？', '计划是否使用 a + 不定式？', '天气条件与选择是否对应？'], model: 'El museo está más cerca que la playa. Vamos a visitar la ciudad. Si hace sol, vamos a la playa. Si llueve, podemos visitar el museo.' }
  },
  {
    id: 'b1-story', level: 'B1', title: '用背景衬托一次变化', lessonIds: ['g17'],
    goal: '把过去习惯、正在进行的背景和一次发生的事件连接起来。', recycled: ['ciudad', 'estudiar', 'ayer'],
    rules: [
      "交代过去的生活、习惯或当时的背景，常用未完成过去时：De niña vivía aquí.（小时候她住在这里。）",
      "讲一次发生并结束的事件，用简单过去时推进故事：Me mudé.（我搬了家。）选择时看叙述作用，不只看持续多久。",
      "把背景和事件接起来：Estudiaba cuando sonó el teléfono.（我正在学习时，电话响了。）学习是背景，铃响是发生的事件。"
    ],
    examples: [['De niño vivía en una ciudad pequeña.', '小时候我住在一座小城市。'], ['Estudiaba cuando sonó el teléfono.', '我正在学习时，电话响了。']],
    reading: 'Cuando era pequeña, Ana vivía en una ciudad tranquila. Leía cada tarde. Un día se mudó a Madrid. La primera noche estudiaba cuando sonó el teléfono: era su amiga.',
    glossary: 'se mudó：她搬了家；sonó：响了；cada tarde：每天下午。',
    questions: [
      choice('小时候每天的习惯：De niño ___ cada tarde.', ['leí', 'leía', 'leo'], 1, '重复的过去习惯用 leía。'),
      text('只填 sonar 的过去式：Estudiaba cuando ___ el teléfono.（突然响了一次）', 'sonó', '背景用 estudiaba，一次打断事件用 sonó。'),
      text('把动词改成过去习惯，写出整句：De niña Ana vive en una ciudad y lee cada tarde.', 'De niña Ana vivía en una ciudad y leía cada tarde.', '本句描述童年背景和重复习惯，用 vivía、leía。'),
      choice('根据短文，Ana 搬家后第一晚的事件是什么？', ['Sonó el teléfono mientras estudiaba.', 'Volvió a su ciudad.', 'Dejó de leer para siempre.'], 0, '电话响了是一次事件，学习是当时正在进行的背景。')
    ],
    output: { prompt: '用 5 句写一段小经历：过去背景、一个习惯、一次变化、事件与感受。可写虚构人物。', starters: ['Cuando era…', 'Cada día…', 'Un día…', '… cuando…', 'Al final…'], rubric: ['是否按背景 / 事件选择时态？', '人物和时间是否清楚？', '变化是否有具体事件支撑？'], model: 'Cuando era pequeño, vivía en una ciudad tranquila. Leía cada tarde. Un día me mudé a Madrid. Estudiaba cuando sonó el teléfono. Era una amiga y me sentí contento.' }
  },
  {
    id: 'b1-advice', level: 'B1', title: '针对困难给出建议', lessonIds: ['g18', 'g21'],
    goal: '说明学习困难，向别人提出建议并交代目的。', recycled: ['leer', 'estudiar', 'porque'],
    rules: [
      "给另一个人建议，说 Te aconsejo que estudies.（我建议你学习。）提出建议的是我，去学习的是你，que 后用虚拟式。",
      "同一个人说自己的目的，用 para 加动词原形：Estudio para aprender. 若目的涉及另一个人，用 para que：Hablo despacio para que me entiendas.（我慢慢说，好让你听懂。）",
      "先练“你”的几个形式：estudies、leas、entiendas。用它们分别说学习、阅读和听懂的建议或目的。"
    ],
    examples: [['Te aconsejo que leas en voz alta.', '我建议你出声朗读。'], ['Hablo despacio para que me entiendas.', '我慢慢说，好让你听懂我。']],
    reading: 'Luis quiere mejorar su pronunciación. Ana le aconseja que lea en voz alta cada día. También habla despacio para que Luis la entienda. Luis repasa para recordar palabras.',
    glossary: 'en voz alta：出声地；despacio：慢慢地；repasa：复习；la entienda：听懂她。',
    questions: [
      choice('向你提出建议：Te aconsejo que ___ cada día.', ['estudias', 'estudies', 'estudiar'], 1, '另一主语的建议从句，本题用现在虚拟式 estudies。'),
      text('只填 entender 的形式：Hablo despacio para que tú me ___.', 'entiendas', 'para que 引出另一主语的目的，本题使用 entiendas。'),
      text('只改目的结构，写出整句：Estudio para que aprender español.', 'Estudio para aprender español.', '学习和学会都是同一主语的动作，用 para + 不定式。题目中的 para que 要改为 para。'),
      choice('根据短文，谁通过复习记住词？', ['Luis.', 'Ana solamente.', 'Una profesora nueva.'], 0, '最后一句说 Luis repasa para recordar palabras。')
    ],
    output: { prompt: '用 5 句给一位同学建议：说明困难，给两个具体办法，交代目的并表达鼓励。', starters: ['Tienes dificultad para…', 'Te aconsejo que…', 'También puedes…', '… para…', 'Espero que…'], rubric: ['建议是否回应实际困难？', 'que 从句是否与主语和语气配合？', '是否区分 para / para que？'], model: 'Tienes dificultad para recordar palabras. Te aconsejo que las uses en frases. También puedes leer en voz alta. Repasa cada día para mejorar. Espero que tengas más confianza.' }
  },
  {
    id: 'b1-opinion', level: 'B1', title: '把观点与信息来源分开', lessonIds: ['g20', 'g22'],
    goal: '提出看法、注明信息来源，并用理由支持观点。', recycled: ['porque', 'aprender', 'libro'],
    rules: [
      "直接说自己的肯定判断：Creo que es útil.（我觉得它有用。）典型地否定这个判断：No creo que sea útil.（我不觉得它有用。）",
      "用 según 标明信息来自谁：Según Ana,…（据安娜说，……）。再想一想，来源给了什么依据，不要只因为有人说过就下结论。",
      "先用 porque 说明理由，再用 pero 补充限制。这一包练常见肯定与否定判断；引用或强调等语境也会影响实际语气。"
    ],
    examples: [['Creo que este curso es útil porque practicamos.', '我认为这门课有用，因为我们练习。'], ['No creo que sea suficiente.', '我认为那还不够。']],
    reading: 'Según la profesora, leer ayuda a aprender palabras. Ana cree que es útil, pero no cree que sea suficiente. También necesita practicar conversaciones. Su opinión se basa en su experiencia.',
    glossary: 'suficiente：足够的；se basa en：基于；conversaciones：对话。',
    questions: [
      choice('典型肯定判断：Creo que este curso ___ útil.', ['sea', 'es', 'ser'], 1, '本题说话者作出肯定判断，用直陈式 es。'),
      text('只填 ser 的形式：No creo que este libro ___ suficiente.（否定该判断）', 'sea', '本题典型否定判断用虚拟式 sea，不是机械地所有 no 后都用虚拟式。'),
      text('只改动词，写出整句：Creo que el curso ser útil porque practicamos.', 'Creo que el curso es útil porque practicamos.', '本题作肯定断言，从句需变位的 es，而不是不定式 ser。'),
      choice('根据短文，Ana 对阅读的态度是什么？', ['Es útil, pero también necesita conversar.', 'Es inútil y no quiere leer.', 'Es suficiente para todos.'], 0, '她认可阅读的作用，同时明确需要对话练习。')
    ],
    output: { prompt: '用 5 句表达一种学习方法的优点与限制：注明一个真实来源或自己的经历，提出观点、理由和补充办法。', starters: ['Según… / En mi experiencia,…', 'Creo que…', 'Porque…', 'No creo que…', 'También…'], rubric: ['是否清楚区分来源与自己的判断？', '肯定与否定判断是否配合语境？', '是否同时写了优点与限制？'], model: 'En mi experiencia, leer ayuda. Creo que es útil porque aprendo palabras. No creo que sea suficiente. También necesito hablar. Por eso practico conversaciones con una amiga.' }
  },
  {
    id: 'b2-concession', level: 'B2', title: '承认限制，再说明立场', lessonIds: ['g27', 'g31', 'g32'],
    goal: '区分事实让步与假设让步，组织理由与限制。', recycled: ['creo que', 'porque', 'experiencia'],
    rules: [
      "承认费用这个事实，再说仍然支持：Aunque cuesta dinero, lo apoyo. 把费用设为未确定的可能性：Aunque cueste dinero, lo apoyaré. 先区分说话者的立场。",
      "已经真实存在的信息，也可能因双方已知或话语立场而用虚拟式。因此这里练的是两种明确语境，不把“真实 / 假设”当作所有情况的唯一标准。",
      "用 sin embargo 提出限制，用 por lo tanto 得出结论。写完后检查：前面的理由真的能支持这个结论吗？"
    ],
    examples: [['Aunque cuesta dinero, apoyo el proyecto.（我断言确实有费用）', '尽管有费用，我支持这个项目。'], ['Aunque cueste dinero, lo apoyaré.（即使需要费用）', '即使需要费用，我也将支持。']],
    reading: 'El proyecto cuesta dinero y requiere tiempo. Aunque cuesta dinero, Marta lo apoya porque ayuda al barrio. Sin embargo, propone empezar con una prueba pequeña. Por lo tanto, recomienda evaluar los resultados antes de ampliarlo.',
    glossary: 'requiere：需要；prueba：试行；ampliarlo：扩大它；evaluar：评估。',
    questions: [
      choice('把费用作为未确定的假设：“即使需要费用”：Aunque ___ dinero, lo apoyaré.', ['cuesta', 'cueste', 'costar'], 1, '题目明确把费用当作假设，用现在虚拟式 cueste。'),
      text('只填 costar 的现在时：Aunque ___ dinero, lo apoyo.（说话者断言费用是已知事实）', 'cuesta', '在本题指定的事实断言语境中，用直陈式 cuesta；不能推广成所有真实情况只能用直陈式。'),
      text('把整句改成“费用尚未确定，即使需要也支持”，保留未来的主句：Aunque costar dinero, lo apoyaré.', 'Aunque cueste dinero, lo apoyaré.', '假设让步从句用 cueste，主句未来式 apoyaré 保持不变。'),
      choice('根据短文，Marta 为什么建议先小范围试行？', ['Para evaluar resultados antes de ampliar el proyecto.', 'Porque rechaza cualquier gasto.', 'Porque ya se conocen todos los resultados.'], 0, '最后一句明确在扩大之前评估结果；支持项目不代表忽略限制。')
    ],
    output: { prompt: '写 6–8 句支持或反对一个学习项目的小评论：立场、两条理由、一项限制、应对办法和结论。', starters: ['Apoyo / No apoyo…', 'En primer lugar,…', 'Además,…', 'Aunque…', 'Sin embargo,…', 'Por lo tanto,…'], rubric: ['让步语气是否符合所设语境？', '转折与结论是否有清楚关系？', '是否回应一个具体限制，而非只罗列连接词？'], model: 'Apoyo el proyecto de lectura. En primer lugar, ayuda a aprender palabras. Además, permite compartir experiencias. Aunque cuesta dinero, ofrece materiales útiles. Sin embargo, necesitamos evaluar los resultados. Por lo tanto, propongo una prueba pequeña antes de ampliarlo.' }
  },
  {
    id: 'b2-hypothesis', level: 'B2', title: '讨论一个尚未实现的方案', lessonIds: ['g26', 'g19'],
    goal: '用假设条件说明方案、结果与取舍。', recycled: ['estudiar', 'aconsejar', 'proyecto'],
    rules: [
      "设想不现实或较难实现的现在、将来条件：Si tuviera más tiempo, estudiaría más.（如果有更多时间，我会多学一些。）si 后用未完成过去虚拟式，结果用条件式。",
      "tuviera 和 tuviese 都可以表示这里的假设；结果部分可用 estudiaría、haríamos。先把条件与结果作为一整句练。",
      "在这一类假设中，不把条件式放进 si 从句。对比现实中可能的条件：Si tengo tiempo, estudio.（如果有时间，我就学习。）"
    ],
    examples: [['Si tuviera más tiempo, estudiaría cada día.', '如果我有更多时间，我会每天学习。'], ['Si hubiera más recursos, haríamos un curso gratuito.', '如果有更多资源，我们会办免费课程。']],
    reading: 'El equipo no tiene suficiente dinero. Si tuviera más recursos, ofrecería clases gratuitas. Con el presupuesto actual, solo puede organizar un grupo pequeño. Por eso propone empezar con diez participantes y revisar el plan después.',
    glossary: 'recursos：资源；presupuesto：预算；ofrecería：会提供；participantes：参与者。',
    questions: [
      choice('本题较难实现的假设：Si ___ más tiempo, estudiaría más.', ['tendría', 'tuviera', 'tengo'], 1, '与 estudiaría 搭配的假设条件用 tuviera。'),
      text('只填 tener 的未完成过去虚拟式：Si yo ___ más tiempo, leería más.', ['tuviera', 'tuviese'], 'tuviera 和 tuviese 均可，重音和其他词形不能任意替换。'),
      text('只改 si 从句的动词，写出整句：Si tendría tiempo, estudiaría español.', ['Si tuviera tiempo, estudiaría español.', 'Si tuviese tiempo, estudiaría español.'], '该假设 si 从句用未完成过去虚拟式，主句保留条件式 estudiaría。'),
      choice('根据短文，团队在现有预算下准备怎么做？', ['Empezar con un grupo pequeño y revisar el plan.', 'Ofrecer clases gratuitas a toda la ciudad.', 'Afirmar que ya tiene más recursos.'], 0, '虚拟的资源增加不是现实事实；当前方案是小组试行并复查。')
    ],
    output: { prompt: '写 6–8 句比较理想方案与可执行方案：当前限制、两种假设结果、现实选择及评估方式。', starters: ['Ahora…', 'Si tuviera / tuviese…', 'Podría…', 'Sin embargo,…', 'Con los recursos actuales,…', 'Evaluaría…'], rubric: ['si 从句与条件式主句是否配合？', '是否区分假设结果与当前事实？', '现实方案与限制是否对应？'], model: 'Ahora tengo poco tiempo. Si tuviera más tiempo, estudiaría una hora cada día. Podría leer y conversar más. Sin embargo, trabajo por la tarde. Con el tiempo actual, puedo practicar veinte minutos. Evaluaría mi progreso al final de cada semana.' }
  },
  {
    id: 'b2-report', level: 'B2', title: '转述信息，并核对时间参照', lessonIds: ['g29', 'g31'],
    goal: '区分原话、转述时间与自己的判断。', recycled: ['según', 'creo que', 'ayer'],
    rules: [
      "从过去的说话时间看将来的计划，可说 Dijo que vendría.（他 / 她说会来。）先确定时间关系，不把所有转述都机械地改成过去时。",
      "周一原话中的 mañana 是周二；周三转述时，用 al día siguiente（次日）保留这个参照。先标出具体日期，再选时间词。",
      "“她说会提交”只说明一个计划。若不知道是否完成，加上 No sabemos si…，把转述、事实和未知事项分清。"
    ],
    examples: [['El lunes Ana dijo: «Vendré mañana».', '周一安娜说：“我明天来。”'], ['El miércoles: Ana dijo el lunes que vendría al día siguiente.', '周三转述：安娜周一说她次日会来。']],
    reading: 'El lunes Ana anunció: «Presentaré el informe mañana». El miércoles Luis escribió que Ana había anunciado que presentaría el informe al día siguiente. Luis aclaró que no sabía si lo había presentado.',
    glossary: 'anunció：宣布；había anunciado：此前宣布过；aclaró：澄清；informe：报告。',
    questions: [
      choice('周三转述周一的未来计划：Ana dijo el lunes que ___ el martes.', ['vendrá', 'vendría', 'venir'], 1, '本题按过去的参照报告未来计划，使用条件式 vendría。'),
      text('只填 presentar 的条件式：Ana anunció que ___ el informe al día siguiente.', 'presentaría', 'presentaría 表示从过去看未来；保留 í。'),
      text('周三转述周一原话 «Vendré mañana»；只改转述中的时间词，写出整句：Ana dijo el lunes que vendría mañana.', 'Ana dijo el lunes que vendría al día siguiente.', '周一的 mañana 是周二，周三转述时不能误指周四；用 al día siguiente 明确参照。'),
      choice('根据短文，能确认报告已经提交了吗？', ['No; Luis no sabía si se había presentado.', 'Sí; anunciar un plan prueba su cumplimiento.', 'Sí; mañana siempre significa el jueves.'], 0, 'Luis 明确说不清楚是否已提交；计划的转述不是完成证据。')
    ],
    output: { prompt: '写 6–8 句简短信息摘要：标明谁在何时说了什么，注明你的转述日期，区分计划、已核实事实和未知事项。可使用虚构场景。', starters: ['El lunes… dijo: «…».', 'El miércoles,…', 'Según…', 'Había anunciado que…', 'No sabemos si…', 'Por lo tanto,…'], rubric: ['原话与转述的时间参照是否一致？', '是否区分说过 / 计划 / 已完成？', '结论是否保留必要的不确定性？'], model: 'El lunes Ana dijo: «Presentaré el informe mañana». El miércoles Luis habló del anuncio. Según Luis, Ana había anunciado que presentaría el informe al día siguiente. Ese día era el martes. No sabemos si lo presentó. Por lo tanto, necesitamos confirmar el resultado antes de publicar la noticia.' }
  }
];
packs.push(...require('./drill-extension')({ choice, text }));
const levelNumbers = {};
const labels = ['1 · 辨析', '2 · 填空', '3 · 纠错', '4 · 短阅读'];
const practice = require('./drill-practice');
const path = require('./drill-path');
const articles = require('./drill-articles');
module.exports = packs.map((p, i) => ({
  ...p, ...practice[p.id],
  studyOrder: path.order.indexOf(p.id) + 1, readingGuide: path.reading[p.id], levelGuide: path.levels[p.level], article: articles[p.id] || null,
  meaning: coaching[p.id].meaning, approach: coaching[p.id].approach, transfer: coaching[p.id].transfer,
  number: i + 1, levelNumber: levelNumbers[p.level] = (levelNumbers[p.level] || 0) + 1, branch: i < 12 ? 'core' : 'extension', previousId: p.previousId || (i ? packs[i - 1].id : null),
  references: p.lessonIds.flatMap(id => course.lessons.find(l => l.id === id).references),
  questions: p.questions.map((q, j) => ({ ...q, hint: coaching[p.id].hints[j], id: `${p.id}-q${j + 1}`, title: labels[j] }))
}));
