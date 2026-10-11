const sources = require('./sources');
const vocabularyReview = require('./vocabulary-review');
const definitions = [
  ['u1', '01', '第一声 Hola', '问候与礼貌', '能打招呼、道谢并做简单告别。', '词尾元音要清楚；h 不发音，hola 读作 /ˈola/。'],
  ['u2', '02', '介绍你自己', '身份与国籍', '能说自己的名字、国籍和职业。', 'ñ 的发音接近 /ɲ/；español 的 ñ 不是普通 n。'],
  ['u3', '03', '身边的小世界', '名词与冠词', '能用冠词指称日常物品，区分单复数。', '重音符号不能省略：café、teléfono。'],
  ['u4', '04', '你在哪里', '状态与位置', '能描述位置、状态与基本特征。', 'está 的重音在最后一个音节。'],
  ['u5', '05', '我的每一天', '日常与现在时', '能用规则动词描述自己的日常活动。', '西语 r 与 rr 不同；先练轻弹舌 r，再练 rr。'],
  ['u6', '06', '多问一句', '问句与否定', '能提问时间、地点和人物，并作否定回答。', '疑问词带重音：qué、quién、dónde、cuándo、cómo。'],
  ['u7', '07', '说说你的喜欢', '喜好与饮食', '能表达对食物和活动的喜好。', 'j 通常为 /x/；不同地区强弱有差异。'],
  ['u8', '08', '下一站，出发', '城市与计划', '能询问附近设施，并表达简单计划。', 'll 在多数地区与 y 合流；地区发音差异是正常现象。']
];
const units = definitions.map(([id, number, title, topic, goal, pronunciation]) => ({ id, number, title, topic, goal, pronunciation, level: 'A1 入门', sourceIds: ['pcic', 'cefr', 'pcic-grammar', 'pcic-functions'] }));

// 原创教学释义及例句。不是官网词典全文或授权教材节选。
const rows = [
  ['u1','hola','你好','感叹词','Hola, Ana.','你好，安娜。','通用'],
  ['u1','adiós','再见','感叹词','Adiós, hasta mañana.','再见，明天见。','通用'],
  ['u1','gracias','谢谢','礼貌表达','Gracias por tu ayuda.','谢谢你的帮助。','通用'],
  ['u1','por favor','请','礼貌表达','Un café, por favor.','请来一杯咖啡。','通用'],
  ['u1','perdón','对不起；劳驾','名词 / 礼貌表达','Perdón, ¿dónde está la estación?','劳驾，车站在哪里？','通用'],
  ['u1','sí','是；对','副词','Sí, soy Ana.','是的，我是安娜。','通用'],
  ['u1','no','不；不是','副词','No, gracias.','不了，谢谢。','通用'],
  ['u1','buenos días','早上好','问候语','Buenos días, profesora.','早上好，老师。','通用'],
  ['u1','buenas tardes','下午好','问候语','Buenas tardes, señor.','下午好，先生。','通用'],
  ['u1','buenas noches','晚上好；晚安','问候语','Buenas noches, hasta mañana.','晚安，明天见。','通用'],
  ['u2','nombre','名字','阳性名词','Mi nombre es Ana.','我的名字是安娜。','通用'],
  ['u2','estudiante','学生','通性名词','Soy estudiante.','我是学生。','通用'],
  ['u2','profesor / profesora','老师','名词','Ana es profesora.','安娜是老师。','通用'],
  ['u2','amigo / amiga','朋友','名词','Luis es mi amigo.','路易斯是我的朋友。','通用'],
  ['u2','familia','家庭；家人','阴性名词','Mi familia vive en China.','我的家人住在中国。','通用'],
  ['u2','chino / china','中国的；中国人','形容词 / 名词','Soy china.','我是中国人（女性）。','通用'],
  ['u2','español / española','西班牙的；西班牙人','形容词 / 名词','Luis es español.','路易斯是西班牙人。','通用'],
  ['u2','país','国家','阳性名词','China es un país muy grande.','中国是一个很大的国家。','通用'],
  ['u2','ciudad','城市','阴性名词','Madrid es una ciudad.','马德里是一座城市。','通用'],
  ['u2','trabajo','工作','阳性名词','Mi trabajo es interesante.','我的工作很有趣。','通用'],
  ['u3','libro','书','阳性名词','Tengo un libro.','我有一本书。','通用'],
  ['u3','mesa','桌子','阴性名词','La mesa es pequeña.','这张桌子很小。','通用'],
  ['u3','casa','房子；家','阴性名词','Mi casa es pequeña.','我的房子很小。','通用'],
  ['u3','agua','水','阴性名词','El agua está fría.','水是凉的。','单数用 el agua，但 agua 仍为阴性，复数 las aguas'],
  ['u3','café','咖啡','阳性名词','Quiero un café.','我想要一杯咖啡。','通用'],
  ['u3','teléfono','电话','阳性名词','El teléfono está en la mesa.','电话在桌上。','通用'],
  ['u3','puerta','门','阴性名词','La puerta está abierta.','门开着。','通用'],
  ['u3','ventana','窗户','阴性名词','La ventana es grande.','窗户很大。','通用'],
  ['u3','bolígrafo','圆珠笔','阳性名词','Tengo dos bolígrafos.','我有两支圆珠笔。','部分地区常说 lapicero 或 pluma'],
  ['u3','coche','汽车','阳性名词','El coche es rojo.','汽车是红色的。','西班牙常用 coche；拉美常见 carro / auto'],
  ['u4','aquí','这里','副词','Estoy aquí.','我在这里。','通用'],
  ['u4','allí','那里','副词','La estación está allí.','车站在那里。','部分拉美语境也常用 allá'],
  ['u4','bien','好；顺利','副词','Estoy bien, gracias.','我很好，谢谢。','通用'],
  ['u4','cansado / cansada','累的','形容词','Estoy cansada.','我累了（女性说）。','通用'],
  ['u4','contento / contenta','高兴的','形容词','Luis está contento.','路易斯很高兴。','通用'],
  ['u4','grande','大的','形容词','La casa es grande.','房子很大。','通用'],
  ['u4','pequeño / pequeña','小的','形容词','El libro es pequeño.','这本书很小。','通用'],
  ['u4','cerca','近；附近','副词','La escuela está cerca.','学校很近。','通用'],
  ['u4','lejos','远','副词','La estación está lejos.','车站很远。','通用'],
  ['u4','escuela','学校','阴性名词','Estoy en la escuela.','我在学校。','通用'],
  ['u5','hablar','说话','动词','Hablo español.','我说西班牙语。','通用'],
  ['u5','estudiar','学习','动词','Estudio español cada día.','我每天学习西班牙语。','通用'],
  ['u5','trabajar','工作','动词','Trabajo en una escuela.','我在一所学校工作。','通用'],
  ['u5','comer','吃','动词','Como pan.','我吃面包。','通用'],
  ['u5','beber','喝','动词','Bebo agua.','我喝水。','通用'],
  ['u5','vivir','生活；居住','动词','Vivo en Pekín.','我住在北京。','通用'],
  ['u5','leer','阅读','动词','Leo un libro.','我读一本书。','通用'],
  ['u5','escribir','写','动词','Escribo una carta.','我写一封信。','通用'],
  ['u5','aprender','学习；学会','动词','Aprendo español.','我学习西班牙语。','通用'],
  ['u5','día','天；日','阳性名词','Estudio cada día.','我每天学习。','通用'],
  ['u6','qué','什么','疑问词','¿Qué estudias?','你学什么？','通用'],
  ['u6','quién','谁','疑问词','¿Quién es Ana?','谁是安娜？','通用'],
  ['u6','dónde','哪里','疑问词','¿Dónde vives?','你住在哪里？','通用'],
  ['u6','cuándo','什么时候','疑问词','¿Cuándo trabajas?','你什么时候工作？','通用'],
  ['u6','cómo','怎样；如何','疑问词','¿Cómo estás?','你好吗？','通用'],
  ['u6','por qué','为什么','疑问表达','¿Por qué estudias español?','你为什么学习西班牙语？','提问分开写，回答用 porque'],
  ['u6','hoy','今天','副词','Hoy estudio español.','今天我学西班牙语。','通用'],
  ['u6','mañana','明天；早晨','副词 / 阴性名词','Mañana trabajo.','明天我工作。','por la mañana 表示在早晨'],
  ['u6','hora','小时；时刻','阴性名词','¿Qué hora es?','现在几点了？','通用'],
  ['u6','porque','因为','连词','Estudio español porque me gusta.','我学西班牙语，因为我喜欢它。','通用'],
  ['u7','gustar','使……喜欢','动词','Me gusta el café.','我喜欢咖啡。','语法主语是被喜欢的事物'],
  ['u7','pan','面包','阳性名词','Me gusta el pan.','我喜欢面包。','通用'],
  ['u7','fruta','水果','阴性名词','Como fruta cada día.','我每天吃水果。','通用'],
  ['u7','manzana','苹果','阴性名词','Me gustan las manzanas.','我喜欢苹果。','通用'],
  ['u7','arroz','大米；米饭','阳性名词','Me gusta el arroz.','我喜欢米饭。','通用'],
  ['u7','leche','牛奶','阴性名词','Bebo leche.','我喝牛奶。','通用'],
  ['u7','té','茶','阳性名词','Me gusta el té.','我喜欢茶。','通用'],
  ['u7','desayuno','早餐','阳性名词','El desayuno está en la mesa.','早餐在桌上。','通用'],
  ['u7','comida','食物；一餐','阴性名词','La comida está buena.','食物很好吃。','西班牙常也指午餐；各地用法有差异'],
  ['u7','música','音乐','阴性名词','Me gusta la música.','我喜欢音乐。','通用'],
  ['u8','calle','街道','阴性名词','Hay una farmacia en esta calle.','这条街上有一家药店。','通用'],
  ['u8','estación','车站','阴性名词','La estación está cerca.','车站在附近。','通用'],
  ['u8','farmacia','药店','阴性名词','¿Hay una farmacia aquí?','这里有药店吗？','通用'],
  ['u8','supermercado','超市','阳性名词','Voy al supermercado.','我去超市。','通用'],
  ['u8','derecha','右边','阴性名词','La farmacia está a la derecha.','药店在右边。','通用'],
  ['u8','izquierda','左边','阴性名词','La estación está a la izquierda.','车站在左边。','通用'],
  ['u8','ir','去','动词','Voy a estudiar mañana.','我明天要学习。','通用'],
  ['u8','viajar','旅行','动词','Voy a viajar a España.','我要去西班牙旅行。','通用'],
  ['u8','billete','票','阳性名词','Un billete, por favor.','请来一张票。','西班牙常用 billete；拉美常见 boleto / pasaje'],
  ['u8','autobús','公共汽车','阳性名词','Voy en autobús.','我乘公共汽车去。','拉美也有 camión、bus、colectivo 等地区用法']
];
const lemmaOverrides = { 'gracias': 'gracia', 'por favor': 'favor', 'buenos días': 'día', 'buenas tardes': 'tarde', 'buenas noches': 'noche' };
const words = rows.map(([unitId, spanish, meaning, pos, example, translation, note], i) => ({ id: `w${i + 1}`, unitId, spanish, meaning, pos, example, translation, note, dictionaryUrl: spanish === 'por qué' ? 'https://www.rae.es/dpd/porqu%C3%A9' : `https://dle.rae.es/${encodeURIComponent(lemmaOverrides[spanish] || spanish.split(' / ')[0])}`, sourceIds: ['dle', 'dpd'], editorial: '原创；词义与用法可查对应官方词条' }));
const question = (id, prompt, options, answer, explanation) => ({ id, prompt, options, answer, explanation });
const lessons = [
  { id: 'g1', unitId: 'u1', title: '从问候开始：标点与礼貌', summary: '西语问句、感叹句有开头和结尾两个符号。', rules: ['问句使用 ¿…?，感叹句使用 ¡…!。', 'Buenos días 用于早晨；buenas tardes 用于下午至傍晚；buenas noches 用于晚上，也可道晚安。具体分界随地区与作息变化。', 'gracias 的常见回答是 de nada；por favor 用于礼貌请求。'], examples: [['¿Cómo estás?', '你好吗？'], ['¡Hola! Un café, por favor.', '你好！请来一杯咖啡。']], questions: [question('g1q1','选择完整、规范的西语问句。',['Cómo estás?','¿Cómo estás?','¡Cómo estás?'],1,'直接疑问句首尾分别用 ¿ 和 ?。'),question('g1q2','早上见到老师，你会说：',['Buenas noches.','Buenos días.','Adiós.'],1,'Buenos días 是早晨问候语。'),question('g1q3','请求一杯咖啡，补全 Un café, ___.',['por favor','de nada','adiós'],0,'por favor 使请求更礼貌。'),question('g1q4','别人说 Gracias，常见的回应是：',['¿Dónde?','Buenas tardes.','De nada.'],2,'De nada 相当于“不客气”。')] },
  { id: 'g2', unitId: 'u2', title: '用 ser 介绍身份', summary: 'soy、eres、es：从“我是谁”开始。', rules: ['ser 表示身份、来源等：yo soy，tú eres，él/ella/usted es，nosotros/as somos，vosotros/as sois，ellos/ellas/ustedes son。', '常省略人称主语：Soy estudiante。表示职业且不带修饰时通常不加不定冠词。', '国籍形容词需与所指的人在性、数上配合：chino/china，español/española。', '西班牙常用 vosotros/as 表示非正式的复数“你们”；拉美普遍使用 ustedes，并搭配第三人称复数动词。'], examples: [['Soy estudiante. Soy de China.', '我是学生。我来自中国。'], ['Ana es española.', '安娜是西班牙人。']], questions: [question('g2q1','Yo ___ estudiante.',['es','soy','eres'],1,'yo 对应 soy。'),question('g2q2','Tú ___ de China.',['eres','son','soy'],0,'tú 对应 eres。'),question('g2q3','Ana ___ profesora.',['somos','eres','es'],2,'Ana 是第三人称单数，用 es。'),question('g2q4','Ana（女性）说“我是中国人”：',['Soy chino.','Soy china.','Estoy China.'],1,'国籍形容词与性别一致；这里表达身份，用 ser。')] },
  { id: 'g3', unitId: 'u3', title: '名词、冠词与复数', summary: 'el / la，un / una；让词语彼此配合。', rules: ['名词有语法性：el libro、la mesa。词尾 -o/-a 常提供线索，但有例外，需连冠词一起记忆。', '定冠词 el/la/los/las；不定冠词 un/una/unos/unas。形容词也常随名词改变性、数。', '多数元音结尾词加 -s，多数辅音结尾词加 -es：libros、ciudades。', 'agua 为阴性；紧接带重音 /a/ 开头的单数阴性名词时定冠词用 el：el agua fría；复数 las aguas frías。'], examples: [['Un libro, dos libros.', '一本书，两本书。'], ['La mesa es pequeña.', '桌子很小。']], questions: [question('g3q1','选择“这张桌子”。',['el mesa','la mesa','los mesa'],1,'mesa 是阴性单数名词，搭配 la。'),question('g3q2','libro 的复数是：',['libroes','libros','libras'],1,'非重读元音结尾，通常直接加 -s。'),question('g3q3','选择正确表达。',['una libro','un mesa','un libro'],2,'libro 是阳性单数名词，搭配 un。'),question('g3q4','哪句符合性数配合？',['El agua está fría.','El agua está frío.','La libro es pequeña.'],0,'agua 是阴性，形容词用 fría；单数冠词使用 el。')] },
  { id: 'g4', unitId: 'u4', title: 'ser 与 estar：身份、状态、位置', summary: '不要只用“永久 / 临时”区分这两个动词。', rules: ['ser 表示身份、类别或特征：Soy estudiante；La casa es grande。', 'estar 表示人或事物的位置、状态：Estoy aquí；Ana está cansada。事件举办地点等特殊用法以后再学。', 'estar：estoy、estás、está、estamos、estáis、están。', '形容词与主语配合：Ana está cansada；Luis está cansado。有些形容词搭配 ser 和 estar 意义会改变。'], examples: [['Soy estudiante y estoy cansada.', '我是学生，今天很累（女性说）。'], ['La escuela está cerca.', '学校在附近。']], questions: [question('g4q1','身份：Soy estudiante。位置：___ en casa.',['Soy','Estoy','Es'],1,'表达人的位置通常使用 estar；yo 用 estoy。'),question('g4q2','La mesa ___ grande.',['estoy','están','es'],2,'描述桌子的尺寸特征，用 ser 的单数 es。'),question('g4q3','Ana ___ cansada.',['está','eres','están'],0,'状态用 estar，第三人称单数 está。'),question('g4q4','¿Dónde ___ la escuela?',['son','está','soy'],1,'询问学校位置，使用 está。')] },
  { id: 'g5', unitId: 'u5', title: '规则动词的现在时', summary: '-ar / -er / -ir：去词尾，再加对应人称结尾。', rules: ['-ar：hablo、hablas、habla、hablamos、habláis、hablan。', '-er：como、comes、come、comemos、coméis、comen。', '-ir：vivo、vives、vive、vivimos、vivís、viven。', '现在时可用于习惯：Estudio cada día。常根据动词变位省略主语。只涵盖规则动词，不套用于所有动词。'], examples: [['Hablo español y vivo en China.', '我说西班牙语，住在中国。'], ['Ana estudia cada día.', '安娜每天学习。']], questions: [question('g5q1','Yo ___ español.（hablar）',['hablas','hablo','hablan'],1,'hablar 去掉 -ar，加第一人称单数 -o。'),question('g5q2','Tú ___ pan.（comer）',['come','como','comes'],2,'comer 的 tú 变位是 comes。'),question('g5q3','Nosotros ___ en China.（vivir）',['vivimos','viven','vivo'],0,'vivir 的 nosotros 变位是 vivimos。'),question('g5q4','Ana ___ español.（estudiar）',['estudio','estudia','estudias'],1,'第三人称单数 -ar 规则动词词尾为 -a。')] },
  { id: 'g6', unitId: 'u6', title: '提问与否定', summary: '用疑问词开口，用 no 放在动词前。', rules: ['qué 什么；quién 谁；dónde 哪里；cuándo 什么时候；cómo 怎样；por qué 为什么。', '直接或间接疑问用法的疑问词带重音。不是所有 que/donde 都要重音。', '一般否定将 no 放在变位动词前：No hablo español。', '提问用 por qué，回答原因用 porque。西语可以用语调和标点形成是非问句：¿Estudias español?'], examples: [['¿Dónde vives? Vivo en China.', '你住在哪里？我住在中国。'], ['No trabajo hoy.', '我今天不工作。']], questions: [question('g6q1','问地点：¿___ vives?',['Quién','Dónde','Cuándo'],1,'dónde 询问地点。'),question('g6q2','选择“我不喝咖啡”。',['Bebo no café.','No bebo café.','Bebo café no.'],1,'普通否定中 no 在变位动词前。'),question('g6q3','“为什么学西语？”使用：',['porque','por que','por qué'],2,'直接疑问表达用分开写且带重音的 por qué。'),question('g6q4','回答“因为我喜欢”：___ me gusta.',['Porque','Por qué','Quién'],0,'表示原因的连词 porque 连写，不带重音。')] },
  { id: 'g7', unitId: 'u7', title: '用 gustar 表达喜好', summary: 'Me gusta el café；Me gustan las manzanas。', rules: ['可以理解为“某物使我喜欢”：me 是间接宾语，喜欢的事物是语法主语。', '单数事物或不定式通常用 gusta：Me gusta el té；Me gusta leer。', '复数事物用 gustan：Me gustan las manzanas。', 'me/te/le/nos/os/les 表示对谁而言。否定放前面：No me gusta el café。'], examples: [['Me gusta leer.', '我喜欢阅读。'], ['¿Te gustan las manzanas?', '你喜欢苹果吗？']], questions: [question('g7q1','Me ___ el café.',['gustan','gusto','gusta'],2,'主语 el café 是单数，动词用 gusta。'),question('g7q2','Me ___ las manzanas.',['gustan','gusta','gustas'],0,'las manzanas 是复数，动词用 gustan。'),question('g7q3','“我喜欢阅读”正确表达是：',['Me gustan leer.','Me gusta leer.','Yo gusto leer.'],1,'不定式 leer 作主语时用单数 gusta。'),question('g7q4','“你喜欢茶吗？”：¿___ gusta el té?',['Me','Te','Nos'],1,'对 tú 而言，用间接宾语代词 te。')] },
  { id: 'g8', unitId: 'u8', title: 'hay 与 ir a：地点和计划', summary: '先问“有没有”，再说“在哪里”和“要做什么”。', rules: ['hay 表示存在，单复数形式一样：Hay una farmacia；Hay dos farmacias。', 'hay 常引入新事物；estar 定位已知事物：La farmacia está aquí。', 'ir 的现在时：voy、vas、va、vamos、vais、van。ir a + 不定式表达计划：Voy a estudiar。', 'a + el 缩合成 al：Voy al supermercado。a la 不缩合。'], examples: [['¿Hay una farmacia? Sí, está a la derecha.', '有药店吗？有，在右边。'], ['Voy a estudiar mañana.', '我明天要学习。']], questions: [question('g8q1','“这里有两家药店”：Aquí ___ dos farmacias.',['están','hay','son'],1,'引入存在的事物用 hay，形式不随单复数改变。'),question('g8q2','“这家药店在这里”：La farmacia ___ aquí.',['hay','es','está'],2,'定位已知设施用 está。'),question('g8q3','“我要学习”：Voy ___ estudiar.',['a','de','en'],0,'ir a + 不定式表达计划。'),question('g8q4','“我去超市”：Voy ___ supermercado.',['a el','al','a la'],1,'a + el 缩合为 al；supermercado 是阳性名词。')] }
].map(l => ({ ...l, sourceIds: ['pcic-grammar', 'dpd'], editorial: '原创讲解与题目；主要语法依据已核对' }));
const referenceMap = {
  g1: [['pcic-functions', '5.1、5.2、5.12、5.13：问候、回应与道谢'], ['dpd-signs', '1、2.1：成对标点']],
  g2: [['pcic-grammar', '9.1.1、12.1：ser 变位、身份与职业'], ['pcic-functions', '1.3：提供个人信息']],
  g3: [['pcic-grammar', '1.2、1.3、3.1、3.2：性数与冠词'], ['dpd-el', '2.1：el agua 与阴性配合']],
  g4: [['pcic-grammar', '12.1、12.2：系动词与表语']],
  g5: [['pcic-grammar', '9.1.1：规则现在时']],
  g6: [['pcic-grammar', '7.3、8.2、8.8、8.9：疑问词与否定']],
  g7: [['pcic-grammar', '3.1、7.1.3、12.1：gustar 与间接宾语'], ['dpd-gustar', '1a：喜好事物为主语']],
  g8: [['pcic-grammar', '3.1、9.1.1、12.1：冠词、haber / ir、动词结构'], ['pcic-functions', '3.10：表达计划（A2 拓展）']]
};
const extensions = { g3: 'A2 提前接触：el agua 等重读 /a/ 阴性名词的冠词例外。', g4: 'A2 提前接触：ser / estar 搭配形容词描述特征与状态。', g6: 'A2 提前接触：用 cuándo 询问时间，先理解常见句子即可。', g8: 'A2 提前接触：ir a + 不定式表达计划。先学 hay 和位置，再尝试这个结构。' };
lessons.forEach(lesson => {
  lesson.references = referenceMap[lesson.id].map(([sourceId, section]) => ({ sourceId, section }));
  lesson.sourceIds = [...new Set(lesson.references.map(r => r.sourceId))];
  lesson.extension = extensions[lesson.id] || '';
});
const extension = require('./course-extension');
units.forEach(unit => { unit.levelCode = 'A1'; });
units.push(...extension.units);
words.push(...extension.words);
lessons.push(...extension.lessons);
words.forEach(word => {
  word.level = units.find(unit => unit.id === word.unitId).levelCode;
  const reference = vocabularyReview.entries[word.id];
  word.verification = reference ? { status: 'reviewed', date: vocabularyReview.reviewedAt, scope: vocabularyReview.scope, reference } : { status: 'pending' };
});
const levels = [
  {id:'A1',title:'日常短句',goal:'问候、介绍自己、描述身边事物',target:'2–3 句'},
  {id:'A2',title:'情景交流',goal:'出行、购物、作息与简单经历',target:'25 词以上情景短文'},
  {id:'B1',title:'连贯叙述',goal:'经历、理由、建议与个人意见',target:'45 词以上连贯段落'},
  {id:'B2',title:'观点与论证',goal:'观点、证据、让步、方案与结论',target:'65 词以上观点短文'}
];
const tasks = require('./expression-tasks')({units,words,levels});
module.exports = { units, words, lessons, sources, levels, tasks };
