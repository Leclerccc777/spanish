// 阅读中的词组先按本句解释；对话留出自己的回答，不另建评分或记录。
module.exports = {
  'a1-place': {
    words: [['estudiante', '学生', '说身份时不必加 un / una：Soy estudiante。'], ['en mi habitación', '在我的房间里', 'en 引出地点；mi 是“我的”，habitación 是阴性名词。'], ['en la mesa', '在桌子上', '这里的 en 表示“在……上”；具体位置要结合物品理解。']],
    dialogue: { scene: '新朋友想认识你，也想知道你在哪里学习。', turns: ['朋友：¿Eres estudiante?', '你：Soy…（换成自己的身份）', '朋友：¿Dónde está tu libro?'], personalize: '回答书的位置，再补一句那里有什么。没有书时，可换成 teléfono（手机）。' },
    newScene: { prompt: '换到办公室：介绍身份，说办公室里有什么，再指出手机在哪里。先说给别人听，再写下三句。', check: '听者能分清你的身份、新出现的物品和已提到物品的位置吗？' }
  },
  'a1-routine': {
    words: [['una ciudad pequeña', '一座小城市', 'ciudad 是阴性；pequeña 跟着它用阴性单数。'], ['por la mañana', '在上午', '作为整组时间短语记；por la tarde 是“在下午”。'], ['los domingos', '每逢周日', '这里的复数表示反复的安排，不是只说某一个周日。']],
    dialogue: { scene: '朋友问你的学习与工作安排。', turns: ['朋友：¿Estudias español por la mañana?', '你：Estudio…（换成自己的时间）', '朋友：¿Trabajas los domingos?'], personalize: '用真实安排回答，至少加一个 no 开头的否定句；没有工作时换成 estudiar。' },
    newScene: { prompt: '换到周末学习小组，用“我们”说一项活动，再说今天不做什么。可从 Estudiamos… / No trabajamos… 开始。', check: '从“我”换成“我们”后，两个动词的结尾都跟着变了吗？' }
  },
  'a1-likes': {
    words: [['le gusta', '他喜欢', '本段的 le 指 Luis；换成自己就从 me gusta 开始。'], ['leer en casa', '在家阅读', 'leer 是“阅读”这个动作，在 gusta 后保持原形。'], ['palabras nuevas', '新词', 'palabra 是阴性，复数时形容词也写 nuevas。']],
    dialogue: { scene: '你和同学交换喜好，寻找一起做的事。', turns: ['同学：¿Te gusta el café?', '你：Me gusta… / No me gusta…', '同学：¿Qué te gusta hacer en casa?'], personalize: '换成自己的饮品与活动，用 porque 说出自己的理由。' },
    newScene: { prompt: '换到图书馆：推荐喜欢的几本书，再说喜欢做的一件事。可用 Me gustan los libros… 和 Me gusta leer… 起步。', check: '多个东西用 gustan；一个动作仍用 gusta。理由是在说自己的喜好吗？' }
  },
  'a2-weekend': {
    words: [['visité a una amiga', '我看望了一位朋友', 'visité 是“我看望过”；a 在这里引出作为对象的人。'], ['fuimos al cine', '我们去了电影院', 'fuimos 在本句是 ir 的过去式；al 是 a + el 合成的。'], ['volví a casa', '我回了家', 'volví 的重音落在最后；a casa 作为“回家”的去向一起记。']],
    dialogue: { scene: '周一，同事问你周末去了哪里。', turns: ['同事：¿Qué hiciste el sábado?', '你：Primero…（说自己做过的一件事）', '同事：¿Y después?'], personalize: '补上之后的活动和最后去了哪里；没外出也可以说在家做过的事。' },
    newScene: { prompt: '换成一次已经结束的学习活动：说何时学习、先做什么、后来做什么。用自己的活动替换影院和聚餐。', check: '时间是否已经结束？顺序词能让别人听懂三件事的先后吗？' }
  },
  'a2-shopping': {
    words: [['esta talla', '这个尺码', 'talla 是阴性；esta 指眼前的这个，不是“这些”。'], ['ayudarme', '帮助我', 'ayudar 是原形，后面的 me 指请求帮助的人；Puedes 后不再变位。'], ['más grande', '大一点的', '这里在比较尺码；需要完整比较时可以再用 que 引出比较对象。']],
    dialogue: { scene: '在商店试衣，店员先问你需要什么。', turns: ['店员：¿Qué necesitas?', '你：Necesito una talla…（说自己的需要）', '店员：¿Te gusta esta camisa?'], personalize: '回答是否喜欢，再用 ¿Puedes…? 提一个具体请求；可把 camisa 换成 camiseta（T 恤，阴性）。' },
    newScene: { prompt: '换成买一本书：libro 是阳性。指清选择，请对方帮忙，最后用 lo 再提这本书。', check: '从 camisa 换成 libro 后，esta / la 是否相应换成 este / lo？请求是否说清要对方做什么？' }
  },
  'a2-plans': {
    words: [['hace sol', '天气晴朗', '谈天气时把 hace sol 作为一组记，不按“我们”改变 hace。'], ['llueve', '下雨', '本句用它描述可能出现的天气，si 是“如果”。'], ['más cerca del hotel', '离酒店更近', 'cerca de 表示离某处近；del 是 de + el。']],
    dialogue: { scene: '朋友与你商量明天出门的安排。', turns: ['朋友：¿Qué vamos a hacer mañana?', '你：Vamos a…（说计划）', '朋友：¿Y si llueve?'], personalize: '准备晴天和下雨两个选择，再比较哪个地方更近。' },
    newScene: { prompt: '换成在家学习：如果有时间，就读书；如果时间少，就复习词语。先比较两个办法，再说条件与安排。', check: '每个 si 条件后都有对应办法吗？说的是现实可能发生的条件吗？' }
  },
  'b1-story': {
    words: [['cuando era pequeña', '她小时候', 'era 交代过去背景；pequeña 配合这里的 Ana。'], ['se mudó a Madrid', '她搬到了马德里', 'mudarse 是搬家；这里用一次事件推动故事。'], ['sonó el teléfono', '电话响了', 'sonó 是突然发生的一次事件，与当时正在学习的背景对照。']],
    dialogue: { scene: '朋友想知道你过去的生活与一次变化。', turns: ['朋友：¿Cómo era tu vida antes?', '你：Antes…（说背景或习惯）', '朋友：¿Qué pasó un día?'], personalize: '说一个具体变化，再补充当时在做什么；可用虚构经历。' },
    newScene: { prompt: '换到一次上课经历：先交代教室和日常习惯，再说某天突然发生的事情与结果。', check: '听者能分出“通常怎样”“当时正在做什么”和“那一次发生什么”吗？' }
  },
  'b1-advice': {
    words: [['en voz alta', '大声地', 'leer en voz alta 是朗读；把方式和动作一起理解。'], ['la entienda', '听懂她的话', 'la 指 Ana；entienda 配合 Luis，接在 para que 引出的目的里。'], ['para recordar palabras', '为了记住词语', '复习和记词的是同一个 Luis，所以 para 后直接接原形。']],
    dialogue: { scene: '同学总是记不住词，向你求助。', turns: ['同学：Me cuesta recordar palabras.（我记词有困难。）', '你：Te aconsejo que…', '同学：¿Para qué sirve?（这样做有什么用？）'], personalize: '给一个自己用过的办法，再解释目的。先想清谁做动作、谁得到帮助。' },
    newScene: { prompt: '换成同学读文章遇到困难：给一条阅读建议，再说你会怎么帮助他理解。分别试用 para 和 para que。', check: '建议回应了阅读困难吗？两种目的表达里，行动者是否交代清楚？' }
  },
  'b1-opinion': {
    words: [['según la profesora', '据老师说', '先说明来源，后面的信息与自己的判断分开。'], ['sea suficiente', '是足够的', 'sea 是 ser 的虚拟式；这里接在 no cree que 后，表达否定判断。'], ['se basa en su experiencia', '基于她自己的经历', 'basarse en 表示依据；su 在本段指 Ana 的经历。']],
    dialogue: { scene: '同学问你，只读书能不能学会交流。', turns: ['同学：¿Crees que leer es suficiente?', '你：Creo que… / No creo que…', '同学：¿En qué te basas?（你的依据是什么？）'], personalize: '用自己一次学习经历支持看法，再补一个可执行的办法。' },
    newScene: { prompt: '换成讨论背词卡：说明优点和限制，标明哪些来自自己的经历，哪些只是猜测。', check: '读者能辨认来源、判断和建议吗？有没有把个人经历说成所有人的结论？' }
  },
  'b2-concession': {
    words: [['lo apoya', '她支持它', 'lo 指 el proyecto；不是指前面的费用。'], ['una prueba pequeña', '一次小范围试行', '这里的 prueba 是试行，不是测验分数；结合项目语境理解。'], ['antes de ampliarlo', '扩大项目之前', 'ampliar 后的 lo 仍指项目；antes de 后保留原形。']],
    dialogue: { scene: '伙伴担心学习项目要花钱，与你讨论是否继续。', turns: ['伙伴：El proyecto cuesta dinero. ¿Lo apoyas?', '你：Aunque…（承认已知费用后说明立场）', '伙伴：¿Y si el coste todavía no está confirmado?'], personalize: '再回答费用未确定的情况，并提出一项小范围试行办法。' },
    newScene: { prompt: '换成组织读书会：分别设定时间投入已确定和未确定两种情况，各写一句让步，再决定如何试行。', check: 'aunque 从句的语气符合你设定的事实或假设吗？建议有没有回应时间限制？' }
  },
  'b2-hypothesis': {
    words: [['ofrecería clases gratuitas', '会提供免费课程', 'ofrecería 是假设结果；gratuitas 配合阴性复数 clases。'], ['con el presupuesto actual', '按现有预算', 'actual 在这里是“当前的”，不是“实际发生的”。'], ['revisar el plan', '重新检查、调整计划', 'revisar 在项目语境中是回头检查，不只是学习中的复习。']],
    dialogue: { scene: '学习伙伴想安排更多练习，但你目前时间有限。', turns: ['伙伴：¿Qué harías si tuvieras más tiempo?', '你：Si tuviera más tiempo,…', '伙伴：¿Qué puedes hacer ahora?'], personalize: '给出理想安排后，回到自己当前的限制，说一个今天能做的小办法。' },
    newScene: { prompt: '换成组织免费读书会：假设场地更多会怎样，再按现有场地安排一个小组，说明如何复盘。', check: '假设结果与当前能做的事分开了吗？si 后没有误用条件式吧？' }
  },
  'b2-report': {
    words: [['había anunciado', '此前已经宣布过', '先以周三的转述为参照，再向前看周一的宣布。'], ['al día siguiente', '次日', '这里相对于周一的原话，指周二；不是相对于周三。'], ['lo había presentado', '她是否已经提交了它', 'lo 指报告；前面的 no sabía si 表明 Luis 并不知道结果。']],
    dialogue: { scene: '周一伙伴说明计划；周三另一位伙伴向你核实。', turns: ['周一，伙伴：Enviaré el documento mañana.', '周三，同伴：¿Qué había anunciado?', '你：Había anunciado que…'], personalize: '标明原话中的“明天”是哪一天，再说提交是否得到确认，不确定就保留未知。' },
    newScene: { prompt: '换成周五宣布、下周一转述的活动计划。写出日期关系，区分原计划与自己后来核实到的结果。', check: '“次日”仍指周六吗？有没有把宣布计划直接当作已经完成？' }
  },
  'a1-greetings': {
    words: [['entra en una cafetería', '她走进一家咖啡馆', 'entra 是“她走进”；en 后说明进入的地方。'], ['dice', '她说', '本段指 Ana；换成“我说”时是 digo。'], ['el camarero responde', '服务员回答', 'responde 指他回答；服务员是女性时可说 la camarera。']],
    dialogue: { scene: '下午，你走进咖啡馆点饮品。', turns: ['店员：Buenas tardes.', '你：Buenas tardes. Un / Una…, por favor.', '店员：Aquí tienes.（给你。）'], personalize: '换成自己想点的饮品，再道谢；可用 un té（茶）或 un café。' },
    newScene: { prompt: '换成晚上买一本书：先问候，用 Un libro, por favor 提请求，再演出道谢与回应。', check: '问候改成晚上的说法了吗？两个人是在接着对方的话说吗？' }
  },
  'a1-agreement': {
    words: [['una mesa pequeña', '一张小桌子', 'mesa 是阴性单数；una 和 pequeña 一起配合。'], ['cerca de la mesa', '在桌子附近', 'cerca de 是一组地点表达，不用拆成逐字翻译。'], ['las sillas', '这些椅子', 'silla 是阴性；多把椅子用 las sillas。']],
    dialogue: { scene: '朋友请你介绍房间里的物品。', turns: ['朋友：¿Qué hay en tu habitación?', '你：Hay…（说一种真实物品）', '朋友：¿Los libros son grandes o pequeños?'], personalize: '描述自己书的大小，再说一种阴性复数物品；没有这些物品可设一个房间。' },
    newScene: { prompt: '换到教室：描述一张桌子和几把椅子，再把单数桌子改说成多张桌子。', check: '从一件换成多件时，冠词、名词和形容词是否一起变化？' }
  },
  'a1-questions': {
    words: [['hoy', '今天', '先找到时间词，再看今天做或不做什么。'], ['pregunta', '她问', '本段是 Ana 发问；同一个词也可作名词，表示“问题”。'], ['leo un libro de español', '我在读一本西语书', 'leo 是 leer 的“我”形式；de español 说明书的内容。']],
    dialogue: { scene: '朋友想知道你的学习地点和原因。', turns: ['朋友：¿Dónde estudias español?', '你：Estudio en…', '朋友：¿Por qué estudias español?'], personalize: '回答自己的原因，再反问对方一个地点或时间问题。' },
    newScene: { prompt: '换成了解朋友的阅读习惯：问读什么、在哪里读、为什么读，再替自己回答。', check: '三个问题真的在问不同信息吗？疑问的 por qué 与回答的 porque 区分了吗？' }
  },
  'a2-routine': {
    words: [['después de ducharse', '她洗澡后', 'de 后用原形 ducharse；说自己时可换成 después de ducharme。'], ['prepara el desayuno', '她准备早餐', 'prepara 是 preparar 的“她”形式，desayuno 是早餐。'], ['se acuesta', '她上床睡觉', '把 se 与 acuesta 一起记；换成自己时说 me acuesto。']],
    dialogue: { scene: '同学与你比较上课前的作息。', turns: ['同学：¿A qué hora te levantas?', '你：Me levanto a las…', '同学：¿Qué haces después de desayunar?'], personalize: '换成自己的起床时间，回答早餐后做什么，最后说睡觉时间。' },
    newScene: { prompt: '换成你与朋友共同的一天，用 nos levantamos / nos acostamos 说时间，再加一个 después de + 原形的活动。', check: '从“我”换成“我们”，小代词和动词都改变了吗？顺序是否合理？' }
  },
  'a2-help': {
    words: [['dolor de garganta', '嗓子疼', 'dolor 是名词“疼痛”；不要和动词 duele 的位置混用。'], ['pedir una cita', '请求预约', '这里 cita 指预约；把 pedir 和要请求的事情一起理解。'], ['la persona que atiende', '接电话、接待的人', 'atiende 指此刻处理来电的人，并未说明对方一定是医生。']],
    dialogue: { scene: '虚构预约电话：你想说明不适并预约。', turns: ['接待人员：¿Cómo te llamas?', '你：Me llamo… Me duele…', '接待人员：¿Qué necesitas?'], personalize: '用虚构名字和一种不适回答，再请求预约；不需要填写自己的健康信息。' },
    newScene: { prompt: '换成向同学说明今天不能去学习小组：描述一个或多个部位不适，说明需要做什么。只练语言。', check: 'duele / duelen 配合身体部位的数量了吗？tener que 后用了原形吗？' }
  },
  'a2-travel': {
    words: [['han reservado', '他们已预订', 'han 配合 Ana 和 Luis 两个人；reservado 不跟着人数改变。'], ['ha escrito al hotel', '他已给酒店写信', 'escrito 是 escribir 的不规则分词；al hotel 是联系的对象。'], ['todavía no', '还没有', '常用来指出一项尚未完成的准备，不等于永远不会做。']],
    dialogue: { scene: '出发前，同伴核对你做了哪些准备。', turns: ['同伴：¿Has reservado una habitación?', '你：He… / Todavía no he…', '同伴：¿Has preparado la maleta?'], personalize: '说一项已完成、一项未完成的准备；maleta 是行李箱，可换成 billetes（票）。' },
    newScene: { prompt: '换成读书会准备：用 haber + 分词说已买书、已写信和尚未完成的一件事；说明是谁做的。', check: 'haber 跟人称变化了吗？分词保持原样了吗？这里专练复合过去时，实际选择还受地区与语境影响。' }
  },
  'b1-relative': {
    words: [['que la ayuda', '帮助她的', 'que 接回 la profesora；la 指 Marta，不是学校。'], ['ofrece cursos', '提供课程', 'ofrece 指学校开课；cursos 是课程。'], ['donde vive Marta', '玛尔塔居住的地方', 'donde 把居住信息接到前面的城市，不再重复城市名称。']],
    dialogue: { scene: '新同学请你介绍熟悉的老师与学习地点。', turns: ['同学：¿Cómo es la profesora que te ayuda?', '你：La profesora que…', '同学：¿Cómo es el lugar donde estudias?'], personalize: '用一个老师的具体做法和一个地方的特点回答；也可设虚构人物。' },
    newScene: { prompt: '换成介绍朋友与常去的图书馆。先各写两句，再用 que / donde 合并，避免重复名词。', check: '合并后仍然指同一个人或地点吗？关系词后有没有重复写一遍相同主语？' }
  },
  'b1-wishes': {
    words: [['me alegro de que', '我很高兴……', 'alegrarse de 是一组搭配；从句里的行动者可以是另一个人。'], ['podamos estudiar', '我们能学习', 'podamos 是 poder 的“我们”虚拟式；estudiar 仍是原形。'], ['espero llegar', '我希望到达', '希望和到达都是同一个“我”，这里直接接原形。']],
    dialogue: { scene: '朋友来你的城市，你们想一起学习。', turns: ['朋友：Ya estoy en tu ciudad.', '你：Me alegro de que…', '朋友：¿Qué esperas hacer esta semana?'], personalize: '说自己的一个希望，再说一个需要朋友参与的希望，别照搬原文的时间。' },
    newScene: { prompt: '换成朋友开始新课程：表达高兴，再分别说你希望自己做什么、希望朋友做什么。', check: '同一行动者的原形与不同的行动者所用 que 从句分清了吗？' }
  },
  'b1-anterior': {
    words: [['ya había salido', '此前已经出发了', '以 Luis 到站为参照，火车离开更早；ya 是“已经”。'], ['el día anterior', '前一天', '这里相对于到站那天，不是相对于今天。'], ['lo que había pasado', '此前发生的事', 'lo que 将整件事接在“解释”之后，不单指某个物品。']],
    dialogue: { scene: '朋友问你为何没赶上一次活动。', turns: ['朋友：¿Qué pasó cuando llegaste?', '你：Cuando llegué,… ya había…', '朋友：¿Qué hiciste después?'], personalize: '换成自己或虚构的一次经历：说更早发生的事，再说到达后的行动。' },
    newScene: { prompt: '换成到图书馆时活动已经开始。先说到达，再交代此前已做的一项准备，最后说后来怎样处理。', check: '每个过去完成时都有清楚的过去参照点吗？更早的事和后来的处理分开了吗？' }
  },
  'b2-specific': {
    words: [['no ha encontrado ninguno', '还没有找到任何一个', '这说明符合要求的课程还未找到，不能当作已经确定的对象。'], ['horario nocturno', '夜间上课的时间安排', 'nocturno 配合阳性 horario；放进完整需求里理解。'], ['le propone preguntar', '她提议他去问问', 'le 指她的兄弟；preguntar 是提议去做的事，并非已完成的行动。']],
    dialogue: { scene: '同伴问你已有的课程与想寻找的新课程。', turns: ['同伴：¿Qué curso conoces?', '你：Conozco un curso que…', '同伴：¿Qué otro curso buscas?'], personalize: '先介绍确定的课程，再说明尚未找到的要求，换成自己需要的时间或内容。' },
    newScene: { prompt: '换成找读书伙伴：先介绍已认识的人，再说尚未找到的理想伙伴应有什么特点。', check: '已确定的对象与仅列需求的对象分清了吗？语气是否跟着语境选择？' }
  },
  'b2-passive': {
    words: [['se analizaron las respuestas', '对回答进行了分析', '这里 las respuestas 是复数主语，动词也用复数。'], ['fueron publicados', '被公布了', '分词 publicados 配合阳性复数 los resultados。'], ['no incluye los nombres', '没有包含姓名', '没公开姓名不等于没做采访；不要从缺项推断更多结论。']],
    dialogue: { scene: '同伴请你解释一份虚构调查报告怎么做成的。', turns: ['同伴：¿Cómo se recogió la información?', '你：Se entrevistó a…（设定人数）', '同伴：¿Qué se publicó y qué no?'], personalize: '说回答如何处理、结果如何公布，再说明一个没有公布的项目。' },
    newScene: { prompt: '换成课程反馈调查：自己设定对象与人数，分别写信息收集、分析、公布及一个限制；明确这是虚构练习。', check: '人的宾语与被动主语区分了吗？动词、分词配合准确吗？有没有虚构成真实调查结论？' }
  },
  'b2-evaluation': {
    words: [['pueda usarla', '能够使用它', 'pueda 配合 el barrio；la 指阴性的 biblioteca。'], ['un espacio pequeño', '一个小空间', 'espacio 是阳性；这是先试行的场地，不代表已经扩大。'], ['una evaluación', '一次评估', '这里指检查试行结果，不能仅从提出评估推断项目有效。']],
    dialogue: { scene: '同伴与你讨论怎样改进学习小组。', turns: ['同伴：¿Qué es lo más importante?', '你：Lo importante es…', '同伴：¿Cómo sabremos si la propuesta funciona?'], personalize: '换成自己在意的需求，说一个限制与一个能观察的结果，再提小范围试行办法。' },
    newScene: { prompt: '换成线上读书会提案：交代参与者需要什么、为何值得做、有什么限制，以及试行后根据什么决定继续。', check: '理由支持结论吗？评估办法能实际观察结果吗？假设材料标明了吗？' }
  }
};
