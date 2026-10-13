// 每级的巩固分支；显式前置关系保护首批 12 包的旧进度。
module.exports = ({ choice, text }) => [
  {
    id:'a1-greetings',level:'A1',previousId:'a1-place',title:'把问候变成一个小对话',lessonIds:['g1'],goal:'使用成对标点、问候与礼貌请求。',recycled:['soy','café','gracias'],
    rules: [
      "向别人直接提问，通常在开头和结尾各写一个问号：¿Cómo estás?（你好吗？）",
      "点单或请求时加 por favor（请）；别人说 Gracias（谢谢），你可以回应 De nada（不客气）。",
      "早晨常说 buenos días，下午常说 buenas tardes，晚上常说 buenas noches。具体分界随地区和作息变化，先在情景中练。"
    ],
    examples:[['¡Hola! Un café, por favor.','你好！请来一杯咖啡。'],['Gracias. — De nada.','谢谢。——不客气。']],
    reading:'Por la mañana Ana entra en una cafetería. Dice: «Buenos días. Un café, por favor». Después dice «Gracias». El camarero responde: «De nada».',glossary:'entra：走进；cafetería：咖啡馆；camarero：服务员；responde：回答。',
    questions:[choice('早晨初次见面，常见问候是：',['Buenos días.','Buenas noches.','De nada.'],0,'Buenos días 是常见早晨问候；具体分界随作息与地区变化。'),text('只填礼貌短语：Un café, ___.','por favor','请求中加入 por favor。'),{...text('只补全成对的问号，写出整句：Cómo estás?','¿Cómo estás?','普通直接疑问句需要开头 ¿ 与结尾 ?；此题明确检查标点。'),preservePunctuation:true},choice('根据短文，服务员怎样回应道谢？',['De nada.','Buenos días.','Un café.'],0,'El camarero responde: De nada。')],
    output:{prompt:'写 4 句咖啡馆小对话：问候、请求、道谢、回应。',starters:['Buenos días…','Un…, por favor.','Gracias.','De nada.'],rubric:['问候是否符合所设场景？','请求是否加入礼貌表达？','问句与感叹句标点是否成对？'],model:'Buenos días. Un café, por favor. Gracias. De nada.'}
  },
  {
    id:'a1-agreement',level:'A1',previousId:'a1-greetings',title:'从一件物品说到几件',lessonIds:['g3'],goal:'让冠词、名词和形容词共同配合性数。',recycled:['libro','mesa','pequeño'],
    rules: [
      "把“一张小桌子”变成“这些小桌子”：la mesa pequeña → las mesas pequeñas。三个词一起变，不要只改名词。",
      "libro 是阳性；agua 仍是阴性。agua 以重读的 a 开头，单数紧挨名词前用 el，但仍说 el agua fría，不把形容词改成阳性。",
      "常见元音结尾词加 -s；常见辅音结尾词加 -es，例如 ciudad → ciudades。先练熟这组，再逐步记例外。"
    ],
    examples:[['Los libros son pequeños.','这些书很小。'],['El agua está fría.','水是冷的。']],
    reading:'En mi casa hay una mesa pequeña y dos libros. Los libros son pequeños. Cerca de la mesa hay dos sillas. Las sillas son grandes.',glossary:'silla：椅子，阴性；cerca de：在……附近；grandes：大的，复数。',
    questions:[choice('选择正确的阴性复数：',['las mesas pequeñas','los mesas pequeños','las mesa pequeñas'],0,'三个词都与阴性复数配合。'),text('只填 ciudad 的复数：Hay dos ___ pequeñas.','ciudades','ciudad 是阴性，辅音结尾加 -es：ciudades。'),text('只改冠词与形容词，写出整句：Las libros son pequeñas.','Los libros son pequeños.','libros 为阳性复数，用 los、pequeños。'),choice('根据短文，哪些物品很大？',['Las sillas.','Los libros.','La mesa.'],0,'短文明确说明 Las sillas son grandes。')],
    output:{prompt:'写 3 句描述一个房间：一种单数物品、两种复数物品，加入大小形容词。',starters:['Hay una / un…','Los… son…','Las… son…'],rubric:['冠词与名词性数是否配合？','形容词是否配合名词？','是否准确区分一个与多个？'],model:'Hay una mesa pequeña. Los libros son pequeños. Las sillas son grandes.'}
  },
  {
    id:'a1-questions',level:'A1',previousId:'a1-agreement',title:'问清楚，也能说“不”',lessonIds:['g6'],goal:'用疑问词获取信息，正确放置否定词。',recycled:['estudiar','casa','libro'],
    rules: [
      "想知道地点，问 ¿Dónde…?；想知道原因，问 ¿Por qué…?。dónde 和 qué 的重音要写出来。",
      "问“为什么”写 por qué，回答“因为”通常写 porque。把一问一答一起练，容易记住它们的区别。",
      "说“不做”，把 no 放在变位动词前：No estudio hoy.（我今天不学习。）"
    ],
    examples:[['¿Dónde estudias? — Estudio en casa.','你在哪里学习？——我在家学习。'],['¿Por qué lees? — Porque me gusta.','你为什么阅读？——因为我喜欢。']],
    reading:'Luis estudia en casa. Hoy no trabaja porque es domingo. Ana pregunta: «¿Qué lees?». Luis responde: «Leo un libro de español».',glossary:'domingo：周日；pregunta：她问；qué：什么；de español：关于西语的。',
    questions:[choice('询问学习地点：¿___ estudias?',['Dónde','Quién','Cuándo'],0,'地点用 dónde；quién 问人，cuándo 问时间。'),text('只填疑问短语：¿___ estudias español?（为什么）','Por qué','por qué 分写，qué 带重音；回答原因通常用 porque。'),text('只改 no 的位置，写出整句：Hoy estudio no en casa.','Hoy no estudio en casa.','普通否定句中 no 放在变位动词 estudio 前。'),choice('根据短文，Luis 今天为什么不工作？',['Porque es domingo.','Porque Ana trabaja.','Porque no tiene un libro.'],0,'短文给出的原因是 es domingo。')],
    output:{prompt:'写一个 4 句对话：一个地点问题及回答，再写一个原因问题及回答；回答中可加入否定。',starters:['¿Dónde…?','… en…','¿Por qué…?','Porque…'],rubric:['疑问词与想获取的信息是否对应？','por qué / porque 是否区分？','否定词和重音是否准确？'],model:'¿Dónde estudias? Estudio en casa. ¿Por qué no trabajas hoy? Porque es domingo.'}
  },
  {
    id:'a2-routine',level:'A2',previousId:'a2-plans',title:'把起床到睡觉连成一天',lessonIds:['g10'],goal:'配合代词式动词的人称，并交代动作顺序。',recycled:['estudio','después','casa'],
    rules: [
      "把起床的代词和动词连着读：me levanto（我起床）、te levantas（你起床）、se levanta（他 / 她起床）、nos levantamos（我们起床）。",
      "说“我睡觉”是 me acuesto，词干 o 变成 ue；说“我们睡觉”是 nos acostamos。两部分都要按人称配合。",
      "说做某事之前或之后，用 antes de / después de 加动词原形：Después de comer, estudio.（吃饭后我学习。）"
    ],
    examples:[['Me levanto a las siete.','我七点起床。'],['Después de comer, estudio en casa.','吃饭后我在家学习。']],
    reading:'Ana se levanta a las siete. Después de ducharse, prepara el desayuno. Trabaja por la mañana. Por la noche lee y se acuesta a las once.',glossary:'ducharse：淋浴；prepara：准备；se acuesta：她上床睡觉；once：十一。',
    questions:[choice('Yo ___ levanto temprano.',['me','se','te'],0,'yo 对应 me，动词为 levanto。'),text('只填 acostarse 的 yo 形式，包括代词：Yo ___ a las once.','me acuesto','yo 使用 me acuesto，保留代词并发生 o → ue。'),text('只改 comer 的形式，写出整句：Después de como, estudio.','Después de comer, estudio.','介词 de 后用不定式 comer。'),choice('根据短文，Ana 什么时候阅读？',['Por la noche.','Después de acostarse siempre.','A las siete de la mañana.'],0,'短文说 Por la noche lee。')],
    output:{prompt:'用 4–5 句按顺序写自己的作息，包括起床、一个 después de 结构和睡觉。',starters:['Me levanto…','Después de…','Por la tarde…','Me acuesto…'],rubric:['代词与动词是否都配合主语？','de 后是否使用不定式？','时间顺序是否容易跟随？'],model:'Me levanto a las siete. Después de comer, estudio español. Por la tarde trabajo. Por la noche leo. Me acuesto a las once.'}
  },
  {
    id:'a2-help',level:'A2',previousId:'a2-routine',title:'说明不适与需要',lessonIds:['g11'],goal:'用 doler 配合身体部位，并说明必要行动。',recycled:['necesitar','porque','descansar'],
    rules: [
      "说一个部位疼，用 me duele：Me duele la cabeza.（我头疼。）说多个部位疼，用 me duelen：Me duelen los pies.（我双脚疼。）",
      "说需要做什么，用 tener que 加动词原形：Tengo que descansar.（我需要休息。）这里只示范怎样表达需要。",
      "把不适、需要和请求分开说清楚，例如描述哪里疼，再请求预约。本包只练语言，例句不提供诊断或治疗意见。"
    ],
    examples:[['Me duele la cabeza.','我头痛。'],['Necesito pedir una cita.','我需要预约。']],
    reading:'Luis tiene dolor de garganta. Llama al centro de salud para pedir una cita. Dice que necesita hablar con una médica. La persona que atiende le pregunta su nombre.',glossary:'garganta：喉咙；centro de salud：医疗中心；atiende：接待；cita：预约。',
    questions:[choice('Me ___ los pies.',['duelen','duele','dolor'],0,'pies 是复数语法主语，使用 duelen。'),text('只填 doler 的对应形式：Me ___ la cabeza.','duele','cabeza 是单数，使用 duele。'),text('只改 descansar 的形式，写出整句：Tengo que descanso en casa.','Tengo que descansar en casa.','tener que 后接不定式 descansar。'),choice('根据短文，Luis 打电话的目的是什么？',['Pedir una cita.','Comprar una camisa.','Anunciar un examen.'],0,'短文明确说 para pedir una cita。')],
    output:{prompt:'写一个 4 句预约对话：介绍自己、描述一种不适、说明需要、礼貌请求预约。可用虚构人物。',starters:['Soy…','Me duele / Me duelen…','Necesito…','¿Puedes…, por favor?'],rubric:['duele / duelen 是否与部位配合？','需要与请求是否说清楚？','是否避免把语言例句当成医疗建议？'],model:'Soy Luis. Me duele la garganta. Necesito hablar con una médica. ¿Puedes ayudarme a pedir una cita, por favor?'}
  },
  {
    id:'a2-travel',level:'A2',previousId:'a2-help',title:'交代旅行前已经完成的事',lessonIds:['g12'],goal:'使用 haber + 过去分词说明经历或与现在有关的完成事件。',recycled:['comprar','visitar','billete'],
    rules: [
      "说已经做了什么，先让 haber 配合人称：he、has、ha、hemos、habéis、han，再接分词：He reservado una habitación.（我已订好房间。）",
      "规则分词可先练 hablado、comido、vivido；escrito、visto、hecho 要单独记。haber 后的分词不会跟着主语变性数。",
      "这包专练 haber 加分词。实际使用中，复合过去时和简单过去时的选择还受地区与语境影响，不把一种表达当作全球唯一用法。"
    ],
    examples:[['He comprado un billete.','我已买了一张票。'],['Hemos escrito al hotel.','我们已给酒店写信。']],
    reading:'Ana y Luis han reservado una habitación. Ana ha comprado los billetes y Luis ha escrito al hotel. Todavía no han preparado las maletas. Van a salir mañana.',glossary:'todavía no：还没有；maletas：行李箱；han reservado：他们已预订；van a salir：将出发。',
    questions:[choice('Yo ___ reservado una habitación.',['he','ha','han'],0,'yo 对应 haber 的 he。'),text('只填 escribir 的过去分词：He ___ al hotel.','escrito','escribir 的不规则过去分词是 escrito。'),text('只改 llegar 的形式，写出整句：Hemos llegar al hotel.','Hemos llegado al hotel.','haber 后必须使用过去分词 llegado。'),choice('根据短文，他们哪件事还没有完成？',['Preparar las maletas.','Reservar una habitación.','Comprar los billetes.'],0,'Todavía no han preparado las maletas 明确表示尚未完成。')],
    output:{prompt:'用 4 句写出行准备：两件已完成的事、一件未完成的事和出发安排。',starters:['He / Hemos…','También…','Todavía no…','Vamos a…'],rubric:['haber 与主语是否配合？','分词是否准确，尤其不规则形式？','是否区分已完成、未完成与计划？'],model:'Hemos reservado una habitación. He comprado los billetes. Todavía no hemos preparado las maletas. Vamos a salir mañana.'}
  },
  {
    id:'b1-relative',level:'B1',previousId:'b1-opinion',title:'用关系从句补充信息',lessonIds:['g22'],goal:'用 que 与 donde 指清楚所谈对象，减少重复。',recycled:['curso','aprender','ciudad'],
    rules: [
      "用 que 连接对人或事物的补充说明：El curso que hago es útil.（我上的课程很有用。）这样不用再重复一次 curso。",
      "补充地点信息，可用 donde：La ciudad donde vivo es tranquila.（我住的城市很安静。）",
      "先找被补充说明的名词，也就是“先行词”，再接从句。这里先练已经明确存在的人、物和地点。"
    ],
    examples:[['La profesora que me ayuda habla despacio.','帮助我的老师说得很慢。'],['La escuela donde estudio está cerca.','我学习的学校在附近。']],
    reading:'Marta estudia en una escuela que ofrece cursos por la tarde. La profesora que la ayuda prepara ejercicios claros. La ciudad donde vive Marta tiene una biblioteca grande.',glossary:'ofrece：提供；claros：清楚的；biblioteca：图书馆；la ayuda：帮助她。',
    questions:[choice('地点：La escuela ___ estudio está cerca.',['donde','que','quién'],0,'本题表示在学校学习，用地点关系词 donde。'),text('只填关系词：La profesora ___ me ayuda es amable.','que','que 指代先行词 profesora，在从句中作主语。'),text('用 que 合并成一句：Tengo un curso. El curso ofrece prácticas.','Tengo un curso que ofrece prácticas.','保留已存在的课程，用 que 接 ofrece 的信息，本句使用直陈式 ofrece。'),choice('根据短文，学校什么时候提供课程？',['Por la tarde.','Solo por la mañana.','Nunca.'],0,'第一句说 ofrece cursos por la tarde。')],
    output:{prompt:'用 5 句介绍学校或城市：至少使用一次 que 和一次 donde，再给出自己的评价。',starters:['Estudio en…','La escuela que…','La ciudad donde…','Me gusta… porque…'],rubric:['关系词是否对应人 / 物或地点？','每个关系从句的先行词是否清楚？','是否减少了重复，而没有丢失信息？'],model:'Estudio en una escuela pequeña. La profesora que me ayuda habla despacio. La escuela ofrece cursos por la tarde. La ciudad donde vivo tiene una biblioteca. Me gusta estudiar allí porque puedo leer.'}
  },
  {
    id:'b1-wishes',level:'B1',previousId:'b1-relative',title:'表达感受与希望',lessonIds:['g23'],goal:'正确使用情感结构和面向另一主语的希望。',recycled:['aconsejar','confianza','amiga'],
    rules: [
      "表达高兴，记住整组 me alegro de que：Me alegro de que estés aquí.（我很高兴你在这里。）de 不能漏，后面用虚拟式。",
      "希望另一个人来：Espero que llegues pronto.（我希望你快点到。）到达的人是你，动词与 tú 配合。",
      "希望自己来：Espero llegar pronto.（我希望早点到。）前后都是我，直接用不定式，不必机械加 que。"
    ],
    examples:[['Me alegro de que estés aquí.','我很高兴你在这里。'],['Espero llegar pronto.','我希望自己早点到。']],
    reading:'Ana escribe a su amiga: «Me alegro de que estés en nuestra ciudad. Espero que podamos estudiar juntas. Yo espero llegar a la biblioteca a las cinco». La amiga responde que también quiere estudiar.',glossary:'podamos：我们能够，虚拟式；juntas：一起，女性复数；a las cinco：五点。',
    questions:[choice('Me alegro ___ que estés aquí.',['de','a','por'],0,'alegrarse de que 保留介词 de。'),text('只填 estar 的 tú 虚拟式：Me alegro de que ___ aquí.','estés','本情感从句用 estés，保留 é。'),text('只改希望结构，写出整句：Yo espero que llegar pronto.','Yo espero llegar pronto.','本题希望到达的人和主句主语都是 yo，用不定式 llegar。'),choice('根据短文，Ana 希望和朋友做什么？',['Estudiar juntas.','Salir de la ciudad enseguida.','Cancelar la visita a la biblioteca.'],0,'Espero que podamos estudiar juntas 说明希望一起学习。')],
    output:{prompt:'写 5 句给同学的短消息：一项感受、对对方或双方的希望、自己的安排和一个具体约定。',starters:['Me alegro de que…','Espero que…','Yo espero…','Podemos…','¿Quedamos…?'],rubric:['de que 结构是否完整？','希望从句的主语和语气是否配合？','自己的希望能否用不定式清楚表达？'],model:'Me alegro de que estés aquí. Espero que podamos estudiar juntos. Yo espero llegar a las cinco. Podemos practicar español en la biblioteca. ¿Quedamos allí?'}
  },
  {
    id:'b1-anterior',level:'B1',previousId:'b1-wishes',title:'讲清两件过去事情的先后',lessonIds:['g24'],goal:'使用过去完成时说明一个过去参照点之前的事件。',recycled:['viaje','cuando','experiencia'],
    rules: [
      "讲过去某个时间点之前已发生的事，用 había / habías / habíamos / habían 加分词，先确定“谁”与“参照点”。",
      "Cuando llegué, el tren ya había salido.（我到达时，火车已经开走了。）先发生的是火车离开，后发生的是我到达。",
      "关键是两件过去事件的先后，不是“很久以前”。试着用时间线解释自己的句子。"
    ],
    examples:[['Cuando llegué, el tren ya había salido.','我到达时，火车已经离开。'],['Expliqué que había perdido mi maleta.','我解释说此前丢了行李箱。']],
    reading:'Cuando Luis llegó a la estación, el tren ya había salido. Había comprado el billete el día anterior. Después llamó a Ana y explicó lo que había pasado. Ana le ayudó a buscar otro tren.',glossary:'estación：车站；el día anterior：前一天；había pasado：此前发生了；buscar：寻找。',
    questions:[choice('离开早于我到达：Cuando llegué, el tren ya ___ salido.',['había','ha','he'],0,'过去参照点 llegué 之前的事件，使用 había salido。'),text('只填 haber 的 nosotros 未完成过去时：Ya ___ comprado los billetes cuando llegamos.','habíamos','nosotros 对应 habíamos，重音不可省略。'),text('只改 salir 的形式，写出整句：El tren había salir antes de mi llegada.','El tren había salido antes de mi llegada.','haber 后接过去分词 salido。'),choice('根据短文，哪件事发生得最早？',['Comprar el billete.','Llamar a Ana.','Buscar otro tren con Ana.'],0,'票在前一天已经买好，早于到站与之后的电话。')],
    output:{prompt:'用 5–6 句写一次误会或迟到：过去参照点、此前事件、发现问题、解释与解决。',starters:['Cuando llegué,…','Ya había…','Después…','Expliqué que…','Al final…'],rubric:['更早事件是否有明确的过去参照点？','haber 与分词是否构成完整结构？','解决过程是否与前面的事件衔接？'],model:'Cuando llegué, el tren ya había salido. Había comprado el billete el día anterior. Después llamé a una amiga. Expliqué que había llegado tarde. Ella me ayudó a buscar otro tren. Al final pude continuar el viaje.'}
  },
  {
    id:'b2-specific',level:'B2',previousId:'b2-report',title:'区分已有对象与尚未找到的对象',lessonIds:['g25'],goal:'根据特指、寻找与否定存在的语境选择关系从句语气。',recycled:['curso','que','ofrecer'],
    rules: [
      "介绍已经确定的课程：Tengo un curso que ofrece prácticas.（我有一个提供练习的课程。）从句说明这个课程的事实。",
      "提出寻找要求，但课程还未确定：Busco un curso que ofrezca prácticas.（我在找一个提供练习的课程。）从句用虚拟式表达要求。",
      "否定存在：No hay nadie que pueda ayudar.（没有人能帮忙。）先理解整句话有没有确定的对象，再选语气。"
    ],
    examples:[['Busco una profesora que tenga experiencia.','我在找一位有经验的老师，尚未确定对象。'],['Tengo una profesora que tiene experiencia.','我有一位经验丰富的老师。']],
    reading:'Marta ya conoce un curso que ofrece prácticas. Su hermano todavía busca uno que tenga horario nocturno. No ha encontrado ninguno que cumpla sus requisitos. Marta le propone preguntar en otra escuela.',glossary:'nocturno：夜间的；requisitos：要求；cumpla：符合，虚拟式；ninguno：任何一个都没有。',
    questions:[choice('尚未找到特定课程：Busco un curso que ___ prácticas.',['ofrezca','ofrece','ofrecer'],0,'在本题未确定的寻找语境中使用 ofrezca。'),text('只填 tener：Tengo una profesora que ___ experiencia.（明确已有）','tiene','本题作事实断言，明确已有老师，用 tiene。'),text('在“没有人能帮助”的语境，只改 poder：No hay nadie que puede ayudar.','No hay nadie que pueda ayudar.','典型否定存在从句用虚拟式 pueda。'),choice('根据短文，谁还没有找到符合要求的课程？',['El hermano de Marta.','Marta, que no conoce ningún curso.','La profesora de Marta.'],0,'hermano 仍在寻找；Marta 已认识一个提供实践的课程。')],
    output:{prompt:'用 6 句比较一种已有资源与一种正在寻找的资源：现有优点、寻找条件、缺口和可执行办法。',starters:['Ya tengo… que…','Sin embargo, busco… que…','Necesito…','Todavía no…','Por eso…'],rubric:['是否明确区分已有与未确定对象？','关系从句语气是否符合语境？','需求和行动是否相互对应？'],model:'Tengo un curso que ofrece prácticas. Sin embargo, busco otro que tenga horario nocturno. Necesito estudiar después del trabajo. Todavía no he encontrado uno que cumpla mis requisitos. Por eso voy a preguntar en otra escuela. También compararé los horarios antes de decidir.'}
  },
  {
    id:'b2-passive',level:'B2',previousId:'b2-specific',title:'把结果与信息处理过程说清楚',lessonIds:['g28'],goal:'区分 ser 被动、被动 se 与无人称 se。',recycled:['informe','resultados','según'],
    rules: [
      "强调被分析的样本，可说 Las muestras fueron analizadas.（样本被分析了。）ser 后的被动分词跟着主语变性数。",
      "强调公布的结果，也可说 Se publicaron los resultados.（结果公布了。）在这种被动 se 结构中，动词跟主语 los resultados 的数量配合。",
      "不说明谁采访了参与者，可说 Se entrevistó a los participantes.（对参与者进行了采访。）按这里的标准无人称结构用单数；a 后的人是宾语，不决定动词用复数。"
    ],
    examples:[['Los resultados fueron publicados.','结果被公布了。'],['Se entrevistó a los participantes.','对参与者进行了访谈。']],
    reading:'Se entrevistó a veinte participantes. Después se analizaron las respuestas. Los resultados fueron publicados en un informe. El documento explica el método, pero no incluye los nombres de los participantes.',glossary:'entrevistó：访谈了；respuestas：回答；método：方法；incluye：包含。',
    questions:[choice('被动 se：Se ___ los resultados ayer.',['publicaron','publicó','publicar'],0,'los resultados 为复数主语，被动 se 用 publicaron。'),text('只填 analizar 的配合分词：Las muestras fueron ___.','analizadas','阴性复数主语 muestras，分词 analizadas。'),text('按本题标准无人称结构，只改动词：Se entrevistaron a los participantes.','Se entrevistó a los participantes.','含 a 的人宾语无人称结构，本题要求第三人称单数 entrevistó。'),choice('根据短文，报告没有包含什么？',['Los nombres de los participantes.','El método.','Los resultados.'],0,'最后一句明确没有参与者姓名。')],
    output:{prompt:'写 6 句虚构项目摘要：说明信息如何收集、处理、发布，列出结论与一个限制。',starters:['Se entrevistó a…','Se analizaron…','Los resultados fueron…','El informe indica…','Sin embargo,…'],rubric:['是否区分被动主语与人宾语？','分词和动词是否与相应主语配合？','过程、结论与限制是否分别说清楚？'],model:'Se entrevistó a diez participantes. Después se analizaron sus respuestas. Los resultados fueron publicados en un informe. El documento explica el método. Sin embargo, la muestra es pequeña. Por lo tanto, necesitamos más datos antes de generalizar.'}
  },
  {
    id:'b2-evaluation',level:'B2',previousId:'b2-passive',title:'用评价与证据收束提案',lessonIds:['g30','g31','g32'],goal:'提出优先事项，区分理由与结论，并回应限制。',recycled:['aunque','por lo tanto','proyecto'],
    rules: [
      "概括“重要的事情”，用 lo 加形容词：Lo importante es escuchar.（重要的是倾听。）这里不指某个阳性或阴性名词。",
      "评价一个情况：Es importante que haya respeto.（互相尊重很重要。）que 后用虚拟式；看清参与者，再配合动词形式。",
      "用 sin embargo 补充限制，用 por lo tanto 提出结论。最后检查建议能否执行，以及怎样用结果检验它。"
    ],
    examples:[['Lo importante es evaluar los resultados.','重要的是评估结果。'],['Es importante que todos participen.','让所有人参与很重要。']],
    reading:'El equipo propone abrir una biblioteca. Lo importante es que el barrio pueda usarla. El proyecto requiere dinero; sin embargo, puede empezar con un espacio pequeño. Por lo tanto, el equipo recomienda una prueba y una evaluación antes de ampliarlo.',glossary:'abrir：开设；pueda usarla：能够使用它；ampliarlo：扩大它；espacio：空间。',
    questions:[choice('表达抽象优先事项：___ importante es escuchar.',['Lo','El','La'],0,'lo + 形容词名词化抽象性质。'),text('只填 haber 的现在虚拟式：Es importante que ___ respeto.','haya','评价从句使用 haya；此处 haber 表存在，不随名词数量变。'),text('只改参加的动词，写出整句：Es importante que todos participa.','Es importante que todos participen.','评价从句用虚拟式，todos 对应复数 participen。'),choice('根据短文，团队的建议是什么？',['Probar y evaluar antes de ampliar.','Ampliar sin evaluar.', 'Afirmar que no hace falta dinero.'],0,'建议先试行和评估，再扩大；仍承认费用限制。')],
    output:{prompt:'写 7–8 句项目提案：需求、优先事项、两条理由、一个限制、试行方案、评估和结论。',starters:['Proponemos…','Lo importante es…','Es importante que…','Además,…','Sin embargo,…','Por lo tanto,…'],rubric:['评价结构是否完整并配合语气？','结论是否由真实或明确标为假设的理由支撑？','是否给出可操作的试行和评估办法？'],model:'Proponemos abrir una biblioteca pequeña. Lo importante es escuchar al barrio. Es importante que todos participen. Además, necesitamos materiales útiles. Sin embargo, el presupuesto es limitado. Podemos empezar con una prueba de un mes. Evaluaremos el uso y las opiniones. Por lo tanto, ampliaremos el proyecto solo si los resultados lo justifican.'}
  }
];
