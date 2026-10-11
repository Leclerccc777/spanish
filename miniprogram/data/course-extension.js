// 原创分级练习语料。等级表示本课程的教学顺序，不是官方逐词定级。
const blocks = [];
function add(level, title, goal, section, vocabulary, grammar) { blocks.push({level, title, goal, section, vocabulary, grammar}); }
// 词条格式：西语 | 中文 | 词性 | 原创例句 | 中文译文。记名词时同时看例句中的冠词。
add('A2','住进新街区','能描述住所、比较生活条件。','10. Vivienda',`
barrio|街区|阳性名词|Mi barrio es tranquilo.|我的街区很安静。
piso|公寓；楼层|阳性名词|Mi piso tiene dos habitaciones.|我的公寓有两个房间。
alquiler|租金；租赁|阳性名词|El alquiler es más barato aquí.|这里的租金更便宜。
habitación|房间|阴性名词|Mi habitación tiene una ventana.|我的房间有一扇窗。
cocina|厨房|阴性名词|La cocina es pequeña.|厨房很小。
baño|浴室；卫生间|阳性名词|El baño está al lado de la cocina.|卫生间在厨房旁边。
vecino / vecina|邻居|名词|Mi vecina es amable.|我的邻居很友善。
ascensor|电梯|阳性名词|El ascensor está a la derecha.|电梯在右边。
mueble|家具（单件）|阳性名词|Este mueble es nuevo.|这件家具是新的。
tranquilo / tranquila|安静的；平静的|形容词|Busco una calle tranquila.|我在找一条安静的街道。`,
['比较：más / menos / tan','比较特征时保留形容词的性数配合。',['más + 形容词 + que 表示“比……更”；menos…que 表示“不如……”。','tan + 形容词 + como 表示同等程度。bueno 的常用比较级为 mejor。'],[
['Este piso es ___ grande que el otro.',['más','tan','muy'],0,'más…que 表示比较。'],['Mi calle es tan tranquila ___ la tuya.',['que','como','de'],1,'同等比较用 tan…como。'],['“更好的”常用比较级是：',['más bueno','mejor','bien'],1,'bueno 常用不规则比较级 mejor。'],['Las habitaciones son más ___.',['pequeño','pequeña','pequeñas'],2,'与阴性复数 habitaciones 配合。']]]);
add('A2','说说日常作息','能依时间顺序描述一天。','5. Alimentación; 7. Trabajo; 8. Ocio',`
mañana|早晨；明天|阴性名词 / 副词|Por la mañana estudio en casa.|早上我在家学习。
desayuno|早餐|阳性名词|Mi desayuno es sencillo.|我的早餐很简单。
horario|时间表；作息时间|阳性名词|Mi horario cambia los lunes.|我的时间安排周一会变化。
levantarse|起床|代词式动词|Me levanto a las siete.|我七点起床。
ducharse|淋浴|代词式动词|Me ducho por la mañana.|我早上淋浴。
acostarse|上床睡觉|代词式动词|Me acuesto a las once.|我十一点上床睡觉。
temprano|早；早早地|副词|Hoy me levanto temprano.|我今天起得早。
después|之后|副词|Después preparo el desayuno.|之后我准备早餐。
antes|之前|副词|Antes de dormir, leo.|睡觉前我阅读。
siempre|总是|副词|Siempre estudio después de cenar.|我总是在晚饭后学习。`,
['代词式动词与时间顺序','把动词和对应人称代词一起记。',['levantarse：me levanto、te levantas、se levanta、nos levantamos、os levantáis、se levantan。','代词置于普通变位动词前；antes de / después de 后可接不定式。acostarse 现在时部分人称 o→ue。'],[
['Yo ___ levanto temprano.',['se','me','te'],1,'yo 搭配 me。'],['Ana ___ ducha.',['me','te','se'],2,'第三人称搭配 se。'],['Después de ___, estudio.',['comer','como','comes'],0,'介词 de 后接不定式。'],['Yo ___ a las once.（acostarse）',['me acosto','me acuesto','se acuesta'],1,'yo 使用 me acuesto。']]]);
add('A2','身体与求助','能描述不适、表达需要。','13. Salud e higiene',`
salud|健康|阴性名词|La salud es importante.|健康很重要。
fiebre|发烧；发热|阴性名词|Tengo fiebre desde ayer.|我从昨天开始发烧。
dolor|疼痛|阳性名词|Tengo dolor de cabeza.|我头痛。
cabeza|头|阴性名词|Me duele la cabeza.|我头痛。
garganta|喉咙|阴性名词|Me duele la garganta.|我喉咙痛。
tos|咳嗽|阴性名词|Tengo tos por la noche.|我晚上咳嗽。
cita|预约；约会|阴性名词|Tengo una cita con la médica.|我预约了看医生。
medicamento|药物|阳性名词|Este medicamento es para la tos.|这个药用于咳嗽。
descansar|休息|动词|Necesito descansar en casa.|我需要在家休息。
mejorar|改善；好转|动词|Espero mejorar pronto.|我希望很快好转。`,
['doler 与 tener que','描述疼痛的部位和必须做的事。',['me duele + 单数部位；me duelen + 复数部位，部位是语法主语。','tener que + 不定式表示义务或必要；hay que + 不定式常表达一般必要性。例句仅用于语言学习。'],[
['Me ___ la cabeza.',['duelen','duele','dolor'],1,'cabeza 单数，动词用 duele。'],['Me ___ los pies.',['duele','duelen','doler'],1,'pies 复数，动词用 duelen。'],['Tengo que ___.',['descanso','descansas','descansar'],2,'tener que 后接不定式。'],['___ que descansar.（一般建议）',['Hay','Soy','Está'],0,'hay que 表一般必要性。']]]);
add('A2','预订与出行','能预订住宿、说明已有经历。','14. Viajes, alojamiento y transporte',`
reserva|预订|阴性名词|Tengo una reserva para dos noches.|我预订了两晚。
hotel|酒店|阳性名词|El hotel está cerca del centro.|酒店在市中心附近。
maleta|行李箱|阴性名词|Mi maleta es pequeña.|我的行李箱很小。
pasaporte|护照|阳性名词|Llevo el pasaporte en el bolso.|我把护照带在包里。
billete|票；纸币|阳性名词|He comprado un billete de tren.|我买了一张火车票。
aeropuerto|机场|阳性名词|El aeropuerto está lejos.|机场很远。
vuelo|航班；飞行|阳性名词|Mi vuelo sale a las ocho.|我的航班八点起飞。
llegar|到达|动词|He llegado al hotel.|我已经到达酒店。
salir|离开；出去|动词|Salgo del hotel a las nueve.|我九点离开酒店。
viaje|旅行|阳性名词|El viaje ha sido agradable.|这次旅行很愉快。`,
['复合过去时：he + participio','先学习描述经历的常用形式。',['haber：he、has、ha、hemos、habéis、han；加过去分词：hablado、comido、vivido。','he comprado 表达过去经历或与当前有关的完成事件；与简单过去时的选择因地区、语境而异，拉美不少地区更常用简单过去时。','常见不规则分词：hecho、visto、escrito。'],[
['Yo ___ reservado una habitación.',['he','ha','has'],0,'yo 搭配 he。'],['Hemos ___ al hotel.',['llegar','llegado','llegamos'],1,'haber 后用过去分词。'],['escribir 的过去分词是：',['escribido','escrito','escribiendo'],1,'不规则分词 escrito。'],['Ana ___ comprado el billete.',['han','he','ha'],2,'第三人称单数 ha。']]]);
add('A2','去市场买东西','能询问数量、价格并指称物品。','12. Compras, tiendas y establecimientos',`
precio|价格|阳性名词|El precio es bueno.|价格不错。
talla|服装尺码|阴性名词|Esta talla es pequeña.|这个尺码偏小。
tienda|商店|阴性名词|La tienda abre a las diez.|商店十点开门。
camisa|衬衫|阴性名词|Quiero comprar una camisa.|我想买一件衬衫。
pantalón|裤子|阳性名词|Este pantalón es azul.|这条裤子是蓝色的。
barato / barata|便宜的|形容词|Esta camisa es barata.|这件衬衫很便宜。
caro / cara|贵的|形容词|Estos zapatos son caros.|这些鞋很贵。
pagar|支付|动词|Quiero pagar con tarjeta.|我想用卡支付。
tarjeta|卡；卡片|阴性名词|Pago con tarjeta.|我用卡支付。
recibo|收据|阳性名词|Necesito el recibo.|我需要收据。`,
['指示词与宾语代词','从“这件衬衫”过渡到“我买它”。',['este/esta/estos/estas 与名词性数配合；ese、aquel 等随距离和语境变化。','lo/la/los/las 指代直接宾语，通常置于变位动词前：La compro。性数依据被指代名词。'],[
['___ camisa es barata.',['Este','Esta','Estos'],1,'camisa 阴性单数，esta。'],['“我买这件衬衫”：___ compro.',['Lo','Las','La'],2,'la 指代阴性单数 camisa。'],['“我买这些鞋”：___ compro.',['Los','La','Lo'],0,'zapatos 阳性复数，los。'],['___ pantalones son caros.',['Esta','Estos','Este'],1,'pantalones 阳性复数，estos。']]]);
add('A2','周末做了什么','能用简单过去时叙述已结束的活动。','8. Ocio',`
fin de semana|周末|名词短语|El fin de semana fue tranquilo.|这个周末很平静。
película|电影|阴性名词|Ayer vi una película.|我昨天看了一部电影。
concierto|音乐会|阳性名词|Después fui a un concierto.|之后我去听了一场音乐会。
ayer|昨天|副词|Ayer visité a una amiga.|我昨天拜访了一位朋友。
visitar|参观；拜访|动词|Visité un museo.|我参观了一座博物馆。
bailar|跳舞|动词|Bailamos el sábado.|我们周六跳了舞。
jugar|玩；参加运动|动词|Jugué al fútbol.|我踢了足球。
deporte|运动|阳性名词|Me gusta hacer deporte.|我喜欢运动。
entrada|入场券；入口|阴性名词|Compré una entrada.|我买了一张入场券。
divertido / divertida|有趣的|形容词|La película fue divertida.|那部电影很有趣。`,
['简单过去时：结束的活动','用明确时间描述发生了什么。',['规则 -ar：hablé、hablaste、habló、hablamos、hablasteis、hablaron；-er/-ir：comí、comiste、comió、comimos、comisteis、comieron。','ir/ser 共用 fui、fuiste、fue、fuimos、fuisteis、fueron；ver：vi。时间与上下文帮助区分含义。'],[
['Ayer yo ___ un museo.',['visito','visité','visitar'],1,'已结束的过去活动用 visité。'],['Ana ___ una entrada ayer.',['compró','compro','compras'],0,'第三人称过去式 compró。'],['Ayer ___ al concierto.（我去）',['voy','ir','fui'],2,'ir 的第一人称简单过去式 fui。'],['Yo ___ una película ayer.',['veo','vi','ver'],1,'ver 的第一人称简单过去式 vi。']]]);
add('A2','天气与假期计划','能根据天气商量下一步安排。','20.4. Clima y tiempo atmosférico',`
tiempo|天气；时间|阳性名词|Hoy hace buen tiempo.|今天天气好。
lluvia|雨|阴性名词|Hay lluvia por la tarde.|下午有雨。
sol|太阳|阳性名词|Por la mañana hace sol.|早上有太阳。
frío|寒冷|阳性名词|Hace frío en la montaña.|山里很冷。
calor|炎热|阳性名词|En verano hace calor.|夏天很热。
verano|夏天|阳性名词|Viajo en verano.|我在夏天旅行。
invierno|冬天|阳性名词|En invierno leo en casa.|冬天我在家阅读。
playa|海滩|阴性名词|Podemos ir a la playa.|我们可以去海滩。
montaña|山|阴性名词|La montaña está lejos.|山很远。
paraguas|雨伞|阳性名词|Llevo un paraguas.|我带一把雨伞。`,
['hacer 天气与 poder 建议','学习天气的无人称表达和常见不规则动词。',['hace frío / calor / sol 表天气，常用第三人称单数。llover：llueve。','poder：puedo、puedes、puede、podemos、podéis、pueden；poder + 不定式。Si llueve, nos quedamos en casa 为现实条件。'],[
['Hoy ___ frío.',['hace','hago','hacen'],0,'天气表达 hace frío。'],['Nosotros ___ ir a la playa.',['pueden','podemos','puedo'],1,'nosotros 变位 podemos。'],['Podemos ___ en casa.',['comemos','comer','come'],1,'poder 后接不定式。'],['Si ___, me quedo en casa.',['llover','lluvia','llueve'],2,'现实条件可用现在时 llueve。']]]);
add('A2','邀约与学习安排','能礼貌提出请求并商定安排。','6. Educación; 7. Trabajo',`
curso|课程|阳性名词|Quiero hacer un curso de español.|我想上西语课。
reunión|会议；聚会|阴性名词|Tenemos una reunión el lunes.|我们周一有会议。
compañero / compañera|同伴；同事；同学|名词|Mi compañera estudia conmigo.|我的同学和我一起学习。
examen|考试|阳性名词|El examen es el viernes.|考试在周五。
tarea|任务；作业|阴性名词|Tengo que terminar la tarea.|我得完成作业。
apuntar|记下；报名（apuntarse）|动词|Quiero apuntarme al curso.|我想报名课程。
quedar|约定见面；留下|动词|¿Quedamos a las seis?|我们约六点见面好吗？
invitar|邀请|动词|Quiero invitar a Ana.|我想邀请安娜。
ayudar|帮助|动词|¿Puedes ayudarme?|你能帮我吗？
libre|空闲的；自由的|形容词|Estoy libre por la tarde.|我下午有空。`,
['请求与不定式后的代词','让表达从信息变成互动。',['¿Puedes + 不定式? 可以提出请求；礼貌还取决于语调、上下文和 por favor。','宾语代词可附着于不定式：ayudarme；也可在变位动词前：Me puedes ayudar。','querer：quiero、quieres、quiere、queremos、queréis、quieren。'],[
['¿Puedes ___, por favor?',['ayudarme','ayudo','ayudas'],0,'poder 后不定式，可附着代词。'],['___ puedes ayudar.（帮我）',['Yo','Me','Mi'],1,'me 是宾语代词。'],['Yo ___ hacer un curso.',['quiere','quieres','quiero'],2,'yo 使用 quiero。'],['¿Quedamos ___ las seis?',['en','a','de'],1,'钟点常用 a las。']]]);
add('B1','讲一段成长经历','能用背景和事件串起过去的故事。','1. Individuo; 2. Dimensión perceptiva y anímica',`
infancia|童年|阴性名词|Mi infancia fue feliz.|我的童年很快乐。
recuerdo|记忆；回忆|阳性名词|Tengo un recuerdo especial.|我有一段特别的回忆。
cambio|改变；变化|阳性名词|Un cambio importante llegó después.|后来发生了一个重要变化。
experiencia|经历；经验|阴性名词|Fue una experiencia nueva.|那是一次新经历。
costumbre|习惯；风俗|阴性名词|Tenía la costumbre de leer.|我曾有阅读的习惯。
crecer|成长；生长|动词|Crecí en una ciudad pequeña.|我在小城市长大。
recordar|记得；回忆|动词|Recuerdo mi primera clase.|我记得第一堂课。
mudarse|搬家|代词式动词|Me mudé cuando tenía diez años.|我十岁时搬了家。
entonces|那时；那么|副词|Entonces no hablaba español.|那时我不会说西语。
de repente|突然|副词短语|De repente sonó el teléfono.|电话突然响了。`,
['未完成过去时与简单过去时','用背景衬托一次发生的事件。',['imperfecto：hablaba、comía、vivía；常用于背景、习惯、过去进行中的情况。','indefinido 常用于推进叙述的已完成事件。不能只按“时间长短”选择时态。','Cuando era pequeña, leía mucho；Estudiaba cuando sonó el teléfono。'],[
['背景：Cuando ___ pequeña, leía mucho.',['fui','era','soy'],1,'背景身份常用 era。'],['Estudiaba cuando ___ el teléfono.',['suena','sonaba','sonó'],2,'打断背景活动的一次事件用 sonó。'],['De niño ___ cada día.（习惯）',['leía','leí','leo'],0,'过去习惯用 leía。'],['Ayer ___ a Madrid.（一次已完成搬家）',['me mudo','me mudé','me mudaba'],1,'已结束事件 me mudé。']]]);
add('B1','学习遇到困难','能解释学习困难、给出建议。','6. Educación',`
aprendizaje|学习过程|阳性名词|El aprendizaje requiere tiempo.|学习需要时间。
esfuerzo|努力|阳性名词|El esfuerzo diario me ayuda.|每天的努力帮助我。
objetivo|目标|阳性名词|Mi objetivo es hablar con confianza.|我的目标是自信地说话。
dificultad|困难|阴性名词|Tengo dificultad para escuchar.|我听力有困难。
pronunciación|发音|阴性名词|Practico la pronunciación cada día.|我每天练发音。
vocabulario|词汇|阳性名词|Uso el vocabulario en frases.|我把词汇用在句子里。
repasar|复习|动词|Conviene repasar antes del examen.|考试前宜复习。
superar|克服；超过|动词|Quiero superar esta dificultad.|我想克服这个困难。
aconsejar|建议|动词|Te aconsejo que leas en voz alta.|我建议你大声读。
confianza|信心；信任|阴性名词|Tengo más confianza al hablar.|我说话时更有信心。`,
['建议与现在虚拟式','表达建议时练习 que 从句。',['Te aconsejo que + subjuntivo 表建议；Te aconsejo estudiar 使用不定式也可表达建议。','规则现在虚拟式：hablar→hable，comer→coma，vivir→viva；入门常见不规则：ser→sea、ir→vaya。','当建议面向另一主语时，本课练习 que + 变位虚拟式。'],[
['Te aconsejo que ___ más.（estudiar）',['estudias','estudies','estudiar'],1,'建议从句用 estudies。'],['Conviene ___ cada día.',['repasar','repasas','repasado'],0,'此结构用不定式。'],['Quiero que Ana ___ conmigo.（hablar）',['habla','habló','hable'],2,'不同主语的愿望从句用 hable。'],['Espero que ___ bien.（estar, tú）',['estás','estés','estar'],1,'希望从句用 estés。']]]);
add('B1','工作与求职','能描述能力、写简单求职信息。','7. Trabajo',`
empleo|工作岗位；就业|阳性名词|Busco un empleo estable.|我在找稳定工作。
currículum|简历|阳性名词|He enviado mi currículum.|我发送了简历。
entrevista|面试；访谈|阴性名词|Tengo una entrevista mañana.|我明天有面试。
empresa|企业；公司|阴性名词|Quiero trabajar en esta empresa.|我想在这家公司工作。
contrato|合同|阳性名词|El contrato dura un año.|合同期限一年。
sueldo|薪水|阳性名词|El sueldo depende del puesto.|薪水取决于岗位。
responsabilidad|责任|阴性名词|Tengo experiencia y responsabilidad.|我有经验和责任感。
solicitar|申请；请求|动词|Quisiera solicitar información.|我想申请获取信息。
organizar|组织；安排|动词|Sé organizar reuniones.|我会组织会议。
puesto|岗位；位置|阳性名词|Me interesa este puesto.|我对这个岗位感兴趣。`,
['条件式的礼貌与建议','用 podría、me gustaría 降低请求的直接程度。',['condicional：hablaría、comería、viviría；常用于建议和较委婉请求。','poder→podría，tener→tendría，hacer→haría；me gustaría + 不定式。','条件式还可表示从过去看未来，本单元先练请求与建议。'],[
['¿___ darme información?（poder, usted）',['Podría','Pudiste','Puedes'],0,'usted 的较委婉请求用 podría。'],['Me gustaría ___ aquí.',['trabajo','trabajar','trabajé'],1,'gustaría 后接不定式。'],['Yo ___ una entrevista.（solicitar, condicional）',['solicité','solicito','solicitaría'],2,'规则条件式 solicitaría。'],['建议：Yo en tu lugar lo ___.（hacer）',['hago','haría','hice'],1,'条件式 haría 可给建议。']]]);
add('B1','读懂一条新闻','能区分信息、来源和自己的看法。','9. Información y medios de comunicación',`
noticia|新闻|阴性名词|He leído una noticia interesante.|我读了一条有趣的新闻。
fuente|来源；泉源|阴性名词|La fuente es un periódico local.|来源是一家本地报纸。
opinión|意见；观点|阴性名词|Mi opinión es diferente.|我的观点不同。
periódico|报纸|阳性名词|Leo el periódico por la mañana.|我早上读报。
titular|新闻标题|阳性名词|El titular resume la noticia.|标题概括新闻。
información|信息|阴性名词|Necesitamos más información.|我们需要更多信息。
publicar|发表；发布|动词|El periódico publicó la noticia.|报纸发布了新闻。
afirmar|断言；肯定地说|动词|El informe afirma que hay mejoras.|报告称已有改善。
parecer|似乎；觉得|动词|Me parece una buena noticia.|我觉得是好消息。
según|根据；按照|介词|Según el informe, hay cambios.|根据报告，出现了变化。`,
['肯定、否定与意见','区分信息断言和没有作出断言的看法。',['Creo que + indicativo 通常表示说话者作出肯定判断；No creo que + subjuntivo 常见于否定该判断。','Me parece que + indicativo 表看法；según + 信息来源交代依据。','这是典型教学语境，真实语用中语气选择还受引用、强调等影响。'],[
['Creo que la noticia ___ cierta.',['sea','es','ser'],1,'典型肯定判断用直陈式 es。'],['No creo que ___ cierto.',['es','ser','sea'],2,'典型否定判断用虚拟式 sea。'],['___ el periódico, hay cambios.',['Según','Porque','Aunque'],0,'según 标记来源。'],['Me parece que Ana ___ razón.',['tenga','tiene','tener'],1,'本句肯定意见用 tiene。']]]);
add('B1','把生活变得绿色','能提出环保行动并解释目的。','20. Geografía y naturaleza',`
medio ambiente|环境|名词短语|Debemos cuidar el medio ambiente.|我们应该保护环境。
residuo|废弃物；残余物|阳性名词|Producimos demasiados residuos.|我们产生了过多废弃物。
reciclaje|回收利用|阳性名词|El reciclaje reduce los residuos.|回收利用减少废弃物。
energía|能源；能量|阴性名词|Podemos ahorrar energía.|我们可以节约能源。
ahorrar|节省；储蓄|动词|Apago la luz para ahorrar energía.|我关灯节约能源。
reutilizar|再次使用|动词|Reutilizo las bolsas.|我重复使用袋子。
contaminación|污染|阴性名词|La contaminación afecta al barrio.|污染影响街区。
proteger|保护|动词|Queremos proteger los ríos.|我们想保护河流。
reducir|减少|动词|Intento reducir el consumo.|我尝试减少消耗。
consumo|消费；消耗|阳性名词|El consumo de agua ha bajado.|用水量下降了。`,
['目的：para 与 para que','让行动和目的连起来。',['同一动作主体常用 para + 不定式：Apago la luz para ahorrar。','目的涉及另一个主语时常用 para que + subjuntivo：Te lo explico para que lo entiendas。','deber + 不定式可以表达义务：Debemos reducir los residuos。'],[
['Apago la luz para ___ energía.',['ahorro','ahorrar','ahorre'],1,'para 后不定式。'],['Te ayudo para que ___ tiempo.（tener, tú）',['tienes','tener','tengas'],2,'目的从句虚拟式 tengas。'],['Debemos ___ el agua.',['ahorrar','ahorramos','ahorra'],0,'deber 后用不定式。'],['Reciclamos ___ reducir residuos.',['porque','para','que'],1,'行动目的用 para。']]]);
add('B1','技术改变生活','能比较便利与风险，说明使用习惯。','16. Ciencia y tecnología',`
contraseña|密码；口令|阴性名词|Cambio mi contraseña con frecuencia.|我经常更换密码。
pantalla|屏幕|阴性名词|Paso mucho tiempo ante la pantalla.|我在屏幕前花很多时间。
aplicación|应用；应用程序|阴性名词|Esta aplicación me ayuda a estudiar.|这个应用帮助我学习。
conexión|连接|阴性名词|La conexión es lenta.|网络连接很慢。
archivo|文件；档案|阳性名词|Guardo una copia del archivo.|我保存文件的副本。
descargar|下载；卸下|动词|Voy a descargar el documento.|我要下载文档。
compartir|分享；共同使用|动词|Comparto fotos con mi familia.|我和家人分享照片。
privacidad|隐私|阴性名词|Me preocupa la privacidad.|我关心隐私。
ventaja|优势；好处|阴性名词|Una ventaja es la rapidez.|一个优点是速度快。
inconveniente|不便；缺点|阳性名词|El coste es un inconveniente.|费用是一个缺点。`,
['关系从句：que 与 donde','把两个信息组合成一句话。',['que 可以指代人或物：La aplicación que uso es gratuita。','donde 常指地点：La ciudad donde vivo。','已知、特定的对象常用直陈式；尚未确定的寻找对象可用虚拟式，后面单元进一步练习。'],[
['La aplicación ___ uso es útil.',['que','quién','cuándo'],0,'que 指代 aplicación。'],['La ciudad ___ vivo es pequeña.',['quién','donde','porque'],1,'地点用 donde。'],['Tengo una amiga que ___ aquí.',['trabaja','trabajar','trabaje'],0,'已知朋友的事实用 trabaja。'],['El archivo que ___ ayer está aquí.',['descargar','descargas','descargué'],2,'ayer 的已完成事件用 descargué。']]]);
add('B1','朋友之间的沟通','能表达感受、愿望与原因。','3. Identidad personal; 4. Relaciones personales',`
relación|关系|阴性名词|Nuestra relación es buena.|我们的关系很好。
apoyo|支持|阳性名词|El apoyo de mis amigos es importante.|朋友的支持很重要。
respeto|尊重|阳性名词|El respeto facilita el diálogo.|尊重有助于对话。
discusión|讨论；争论|阴性名词|La discusión terminó bien.|争论有了好的结果。
acuerdo|共识；协议|阳性名词|Llegamos a un acuerdo.|我们达成了共识。
preocuparse|担忧；关心|代词式动词|Me preocupo por mi familia.|我关心家人。
alegrarse|感到高兴|代词式动词|Me alegro de que estés aquí.|我很高兴你在这里。
confiar|信任|动词|Confío en mis amigos.|我信任朋友。
disculparse|道歉|代词式动词|Quiero disculparme por llegar tarde.|我想为迟到道歉。
sincero / sincera|真诚的|形容词|Prefiero una respuesta sincera.|我更愿意听真诚的回答。`,
['感受与愿望从句','在讲事实之外表达对事实的感受。',['Me alegro de que + subjuntivo 表达情感评价；注意 de que 不省略 de。','Espero que + subjuntivo 表希望；同一主语可用 Espero llegar pronto。','confiar en、preocuparse por 连同介词一起记忆。'],[
['Me alegro de que ___ aquí.（estar, tú）',['estás','estés','estar'],1,'情感评价从句用 estés。'],['Espero ___ pronto.（我到达）',['llegar','llego','llegues'],0,'同一主语可用不定式。'],['Confío ___ mis amigos.',['por','de','en'],2,'confiar en。'],['Me preocupo ___ mi familia.',['en','por','a'],1,'preocuparse por。']]]);
add('B1','解决旅行中的问题','能说明先后事件并提出解决办法。','14. Viajes; 11. Servicios',`
retraso|延误；迟到|阳性名词|El retraso cambió nuestros planes.|延误改变了我们的计划。
reclamación|投诉；索赔|阴性名词|Presenté una reclamación.|我提出了投诉。
solución|解决办法|阴性名词|Encontramos una solución.|我们找到了解决办法。
equipaje|行李|阳性名词|Había perdido mi equipaje.|我曾丢失行李。
seguro|保险|阳性名词|El seguro cubre este problema.|保险承保这个问题。
cancelar|取消|动词|La compañía canceló el vuelo.|公司取消了航班。
perder|丢失；错过|动词|Perdí el tren por el retraso.|我因延误错过火车。
recuperar|找回；恢复|动词|Recuperé la maleta al día siguiente.|我次日找回了行李箱。
explicar|解释|动词|Expliqué lo que había pasado.|我解释了之前发生的事情。
resolver|解决|动词|El personal resolvió el problema.|工作人员解决了问题。`,
['过去完成时：此前已发生','从一个过去时点回看更早的事件。',['había、habías、había、habíamos、habíais、habían + 过去分词。','Cuando llegué, el tren ya había salido：火车离开早于我到达。','它表示相对先后，不是“很久以前”的专用时态。'],[
['Cuando llegué, el tren ya ___ salido.',['ha','había','hay'],1,'过去参照点之前用 había salido。'],['Habíamos ___ una reserva.（hacer）',['hacido','haciendo','hecho'],2,'hacer 的分词 hecho。'],['Ana ___ perdido la maleta antes.',['había','habían','habías'],0,'第三人称单数 había。'],['“此前已写”：había ___.',['escribido','escrito','escribiendo'],1,'escribir 的分词 escrito。']]]);
add('B2','讨论教育机会','能从个人经验转向社会问题。','6. Educación; 17. Gobierno, política y sociedad',`
igualdad|平等|阴性名词|La igualdad de oportunidades es esencial.|机会平等至关重要。
beca|奖学金；助学金|阴性名词|Una beca puede ampliar las oportunidades.|助学金可以增加机会。
formación|培养；培训|阴性名词|La formación debe ser accesible.|培训应当易于获得。
desigualdad|不平等|阴性名词|La desigualdad limita el acceso.|不平等限制了获取机会。
acceso|进入；获取机会|阳性名词|El acceso a la educación es importante.|获得教育的机会很重要。
rendimiento|表现；效能|阳性名词|El rendimiento depende de varios factores.|表现取决于多个因素。
abandono|放弃；辍学（语境）|阳性名词|El abandono escolar requiere atención.|辍学问题需要关注。
inclusión|包容；纳入|阴性名词|La inclusión beneficia a la sociedad.|包容有益于社会。
fomentar|促进；鼓励|动词|Es necesario fomentar la participación.|有必要促进参与。
recurso|资源；手段|阳性名词|Faltan recursos en algunas escuelas.|一些学校缺少资源。`,
['非特指关系从句','说明需要怎样的人或资源。',['特定存在的对象常用直陈式：Tengo un curso que ofrece prácticas。','寻找、要求而尚未确定的对象常用虚拟式：Busco un curso que ofrezca prácticas。','否定存在：No hay nadie que pueda ayudar。在具体语境中理解语气。'],[
['Busco un curso que ___ prácticas.（尚未找到）',['ofrece','ofrezca','ofrecer'],1,'非特指寻找对象用 ofrezca。'],['Tengo un curso que ___ prácticas.（已知事实）',['ofrezca','ofrecer','ofrece'],2,'已知事实用 ofrece。'],['No hay nadie que ___ ayudar.',['pueda','puede','poder'],0,'否定存在用 pueda。'],['Necesitamos recursos que ___ accesibles.（要求）',['son','sean','ser'],1,'尚未确定资源的要求用 sean。']]]);
add('B2','就业与经济选择','能比较方案、讨论假设情形。','7. Trabajo; 15. Economía e industria',`
presupuesto|预算|阳性名词|El presupuesto es limitado.|预算有限。
inversión|投资|阴性名词|La inversión debe tener un objetivo claro.|投资应有明确目标。
beneficio|益处；利润|阳性名词|El beneficio no es solo económico.|收益不仅是经济上的。
mercado|市场|阳性名词|El mercado cambia con rapidez.|市场变化迅速。
demanda|需求|阴性名词|La demanda de formación ha crecido.|培训需求增长了。
oferta|供给；报价|阴性名词|La oferta de empleo es amplia.|工作岗位供给广泛。
riesgo|风险|阳性名词|Hay que evaluar el riesgo.|需要评估风险。
viable|可行的|形容词|Esta propuesta parece viable.|这个提议似乎可行。
negociar|谈判；协商|动词|Debemos negociar las condiciones.|我们应该协商条件。
plazo|期限|阳性名词|El plazo termina en junio.|期限六月截止。`,
['假设：si + imperfecto de subjuntivo','用假设比较现实之外的选择。',['Si tuviera más tiempo, estudiaría más：si 从句用未完成虚拟式，主句用条件式。','-ra 与 -se 常可替换：tuviera/tuviese。本课先使用 -ra。','不要写 Si tendría… 来表达本课这种假设条件。'],[
['Si ___ más dinero, invertiría en formación.',['tendría','tuviera','tengo'],1,'本课假设条件用 tuviera。'],['Si fuera posible, ___ el plazo.（ampliar）',['amplié','amplío','ampliaría'],2,'主句用条件式 ampliaría。'],['hablar 的未完成虚拟式形式是：',['hablara','hablaría','hablé'],0,'-ra 形式 hablara。'],['“如果我有时间”：Si ___ tiempo…（假设）',['tendría','tuviese','tener'],1,'tuviese 是 tuviera 的常见替代形式。']]]);
add('B2','环境政策与取舍','能提出措施并权衡成本与效果。','20. Geografía y naturaleza; 15. Economía',`
sostenibilidad|可持续性|阴性名词|La sostenibilidad exige cambios duraderos.|可持续性需要持久变化。
emisión|排放；发出|阴性名词|Las emisiones deben reducirse.|排放应当减少。
medida|措施；测量|阴性名词|Esta medida puede mejorar la salud.|这项措施可以改善健康。
renovable|可再生的|形容词|La energía renovable tiene ventajas.|可再生能源具有优势。
impacto|影响；撞击|阳性名词|Debemos evaluar el impacto ambiental.|我们应评估环境影响。
transición|过渡；转型|阴性名词|La transición necesita recursos.|转型需要资源。
eficiencia|效率|阴性名词|La eficiencia reduce el consumo.|效率提升减少消耗。
compromiso|承诺；责任|阳性名词|Hace falta un compromiso común.|需要共同承诺。
a largo plazo|长期来看|介词短语|A largo plazo, ahorraríamos energía.|长期来看，我们会节约能源。
llevar a cabo|实施；开展|动词短语|Hay que llevar a cabo el plan.|需要实施计划。`,
['让步：aunque 与语气','承认困难，同时继续论证。',['aunque + indicativo 可陈述一个事实：Aunque es caro, lo compro。','aunque + subjuntivo 可将信息处理为假设、已知或不影响结论的让步：Aunque sea caro, lo compraré。','虚拟式不等于说信息必然不真实；它也可用于已知信息的让步。'],[
['“即使贵也买”，暂不确定价格：Aunque ___ caro…',['es','sea','ser'],1,'假设让步用 sea。'],['陈述事实“虽然现在贵”：Aunque ahora ___ caro…',['sea','ser','es'],2,'这里明确陈述事实，选择 es。'],['让步连接词是：',['aunque','porque','para'],0,'aunque 表“虽然/即使”。'],['Aunque ___ lloviendo, saldré.（不影响决定）',['está','esté','estar'],1,'让步不影响决定可用 esté。']]]);
add('B2','科技、证据与判断','能解释研究结果及其局限。','16. Ciencia y tecnología',`
investigación|研究；调查|阴性名词|La investigación aporta nuevos datos.|研究提供了新数据。
evidencia|证据；明显性|阴性名词|La evidencia disponible es limitada.|现有证据有限。
hipótesis|假设|阴性名词|Esta hipótesis necesita pruebas.|这个假设需要检验。
dato|数据；资料|阳性名词|Los datos no explican todo.|数据不能解释一切。
hallazgo|发现|阳性名词|El hallazgo abre nuevas preguntas.|这一发现提出了新问题。
método|方法|阳性名词|El método debe ser claro.|方法应当清晰。
fiable|可靠的|形容词|Necesitamos información fiable.|我们需要可靠信息。
limitación|局限；限制|阴性名词|El estudio tiene una limitación.|研究有一个局限。
comprobar|核实；检验|动词|Debemos comprobar los resultados.|我们应该检验结果。
cuestionar|质疑；提出疑问|动词|Podemos cuestionar la conclusión.|我们可以质疑结论。`,
['被动与无人称表达','组织信息时突出研究、数据和结果。',['ser + participio 构成被动，分词与主语配合：Las muestras fueron analizadas。','被动 se 的动词与主语配合：Se publicaron los resultados。','无人称 se 常为第三人称单数：Se entrevistó a los participantes；与被动 se 区分。'],[
['Las muestras fueron ___.',['analizado','analizadas','analizar'],1,'阴性复数配合 analizadas。'],['Se ___ los resultados ayer.',['publicó','publicar','publicaron'],2,'被动 se 与复数主语配合。'],['Se ___ a los participantes.',['entrevistó','entrevistaron','entrevistar'],0,'a 引入人，例句为无人称 se 单数。'],['El estudio fue ___ ayer.',['publicada','publicado','publicadas'],1,'阳性单数配合 publicado。']]]);
add('B2','媒体与信息辨析','能引用观点、辨别信息可信度。','9. Información y medios de comunicación',`
sesgo|偏向；偏差|阳性名词|El sesgo puede afectar a la información.|偏向可能影响信息。
credibilidad|可信度|阴性名词|La credibilidad depende de las fuentes.|可信度取决于来源。
verificación|核验|阴性名词|La verificación requiere tiempo.|核验需要时间。
rumor|传言|阳性名词|No debemos difundir un rumor.|我们不应该传播传言。
difundir|传播；散布|动词|Las redes pueden difundir noticias.|社交网络可以传播新闻。
contrastar|对比；交叉核对|动词|Es útil contrastar varias fuentes.|交叉核对多个来源很有用。
enfoque|视角；处理方法|阳性名词|El enfoque cambia según el medio.|视角因媒体而异。
contexto|上下文；背景|阳性名词|Falta contexto en el titular.|标题缺少背景。
matiz|细微差别|阳性名词|Este matiz es importante.|这个细微差别很重要。
tergiversar|曲解；歪曲|动词|No hay que tergiversar los hechos.|不应该歪曲事实。`,
['间接引语与时间参照','转述时依据说话时点调整表达。',['过去转述语境常见：Dijo: «Estoy cansada» → Dijo que estaba cansada。','Mañana iré → Dijo que iría al día siguiente；这里以过去说话时点为参照。','若信息现在仍成立，也可能保留现在时；不是所有转述都机械后移时态。'],[
['过去转述：Dijo: «Estoy cansada» → Dijo que ___ cansada.',['esté','estaba','estar'],1,'题设过去参照用 estaba。'],['过去转述未来：Dijo que ___ al día siguiente.（ir）',['va','vaya','iría'],2,'从过去看未来用 iría。'],['以过去参照转述 mañana：',['al día siguiente','ayer','ahora'],0,'mañana 转为 al día siguiente。'],['“他说他已经到了”：Dijo que ya ___ llegado.',['hay','había','llega'],1,'过去之前已发生用 había llegado。']]]);
add('B2','文化与身份','能讨论文化体验，尊重不同视角。','8. Ocio; 3. Identidad personal',`
patrimonio|遗产；财产|阳性名词|El patrimonio cultural merece protección.|文化遗产值得保护。
diversidad|多样性|阴性名词|La diversidad enriquece la ciudad.|多样性丰富城市。
identidad|身份；认同|阴性名词|La identidad cambia con la experiencia.|认同随经历变化。
tradición|传统|阴性名词|La tradición tiene varios significados.|传统有多种含义。
pertenencia|归属；隶属|阴性名词|El sentido de pertenencia es importante.|归属感很重要。
convivencia|共同生活；共处|阴性名词|La convivencia requiere respeto.|共处需要尊重。
prejuicio|偏见|阳性名词|Un prejuicio dificulta el diálogo.|偏见妨碍对话。
enriquecer|使丰富|动词|Aprender idiomas puede enriquecer la vida.|学习语言可以丰富生活。
preservar|保存；保护|动词|Queremos preservar la memoria local.|我们想保存当地记忆。
interpretar|解释；诠释|动词|Podemos interpretar la obra de otro modo.|我们可以以另一种方式解读作品。`,
['强调与评价：lo que / lo + adjetivo','从描述事物走向评价重要之处。',['lo que 可以指“……的事情/内容”：Lo que importa es el respeto。','lo + 形容词可以名词化抽象性质：Lo importante es escuchar。','Es importante que + subjuntivo 表评价；同主语或泛指可用 Es importante escuchar。'],[
['___ importante es escuchar.',['El','Lo','La'],1,'lo + 形容词名词化。'],['Lo ___ importa es el respeto.',['quién','donde','que'],2,'lo que 指“重要的事情”。'],['Es importante que ___ respeto.',['haya','hay','haber'],0,'评价从句用 haya。'],['Es importante ___ a los demás.',['escuchas','escuchar','escuché'],1,'泛指行为用不定式。']]]);
add('B2','表达赞同与反对','能提出立场、理由、反方观点和回应。','17. Gobierno, política y sociedad; Funciones 2',`
argumento|论据；论点|阳性名词|Este argumento necesita un ejemplo.|这个论据需要例子。
postura|立场；姿势|阴性名词|Mi postura admite algunos matices.|我的立场容许一些细微调整。
conclusión|结论|阴性名词|La conclusión debe apoyarse en razones.|结论应有理由支持。
justificar|说明理由；证明合理|动词|Hay que justificar la propuesta.|需要说明提议的理由。
refutar|反驳|动词|No basta con refutar al otro.|仅反驳对方还不够。
por un lado|一方面|篇章表达|Por un lado, el plan tiene ventajas.|一方面，这个计划有优势。
por otro lado|另一方面|篇章表达|Por otro lado, existen riesgos.|另一方面，存在风险。
sin embargo|然而|篇章连接语|Sin embargo, podemos mejorar el plan.|然而，我们可以改进计划。
por lo tanto|因此|篇章连接语|Por lo tanto, propongo un cambio.|因此，我提议作出改变。
en cambio|相反；相比之下|篇章连接语|En cambio, esta opción cuesta menos.|相比之下，这个选项成本更低。`,
['论证连接语','让观点、反方和结论形成清晰结构。',['por un lado / por otro lado 组织两个方面；sin embargo 引入与前文预期相反的信息。','por lo tanto 引出结论或结果；en cambio 比较对照。','连接语不能代替证据；每个观点配一个理由或具体例子。'],[
['计划很贵，___ 能节能。（转折）',['por lo tanto','sin embargo','porque'],1,'转折使用 sin embargo。'],['有充分理由，___ 建议采用。（结果）',['en cambio','aunque','por lo tanto'],2,'推论结果用 por lo tanto。'],['Por un lado… 与哪一项配对？',['por otro lado','por favor','por qué'],0,'组织两个方面。'],['比较两个方案时“相比之下”：',['porque','en cambio','para que'],1,'en cambio 标记对照。']]]);
add('B2','把计划变成提案','能写出问题、目标、措施和评估标准。','7. Trabajo; 17. Gobierno, política y sociedad',`
propuesta|提议；提案|阴性名词|La propuesta responde a un problema real.|提案回应一个真实问题。
prioridad|优先事项|阴性名词|La prioridad es mejorar el acceso.|优先事项是改善获取机会。
evaluación|评估|阴性名词|La evaluación debe ser transparente.|评估应当透明。
participación|参与|阴性名词|La participación mejora el proyecto.|参与可以改进项目。
criterio|标准；判断依据|阳性名词|Necesitamos un criterio claro.|我们需要明确标准。
seguimiento|跟进；监测|阳性名词|El seguimiento permite corregir errores.|跟进使纠正错误成为可能。
alcanzar|达到；够到|动词|Queremos alcanzar un objetivo común.|我们想达到共同目标。
plantear|提出；设定问题|动词|Conviene plantear varias opciones.|宜提出多个选项。
a pesar de|尽管|介词短语|A pesar del coste, el plan es viable.|尽管有成本，计划仍可行。
en definitiva|总而言之|篇章连接语|En definitiva, hace falta un plan claro.|总而言之，需要清晰计划。`,
['让步结构与总结提案','用不同结构说明困难不改变建议。',['a pesar de + 名词/不定式：a pesar del coste，a pesar de tener poco tiempo。de + el → del。','a pesar de que 引入变位从句；陈述事实可用直陈式，假设或背景让步可用虚拟式。','en definitiva 提炼结论；先写问题、目标、措施、评估，再写总结。'],[
['A pesar ___ coste, el plan es viable.',['de el','del','al'],1,'de + el 缩合为 del。'],['A pesar de ___ poco tiempo, participo.',['tengo','tenía','tener'],2,'介词后不定式。'],['从句“尽管”：a pesar ___.',['de que','que de','por que'],0,'a pesar de que 引入变位从句。'],['提炼总结的连接语是：',['por qué','en definitiva','aquí'],1,'en definitiva 用于总结。']]]);
const posNotes = {
  piso: '西班牙常用 piso 指公寓；拉美常见 apartamento / departamento。',
  billete: '交通票：西班牙常用 billete；拉美多地常用 boleto / pasaje。',
  ordenador: '西班牙常用 ordenador；拉美多地用 computadora / computador。',
  currículum: '也可用 currículo；课程采用 currículum。',
  pantalón: '指裤子时也常用复数 pantalones。',
  evidencia: '此处选“可用于判断的证据”义；也有“明显性”义。'
};
const lemma = {'fin de semana':'semana','de repente':'repente','medio ambiente':'ambiente','a largo plazo':'plazo','llevar a cabo':'cabo','por un lado':'lado','por otro lado':'lado','sin embargo':'embargo','por lo tanto':'tanto','en cambio':'cambio','a pesar de':'pesar','en definitiva':'definitivo'};
const units = [], words = [], lessons = [];
blocks.forEach((b, index) => {
  const n = index + 9, unitId = `u${n}`, grammarSource = b.level === 'A2' ? 'pcic-grammar' : 'pcic-grammar-b';
  const vocabSource = b.level === 'A2' ? 'pcic-vocabulary-a' : 'pcic-vocabulary-b';
  const unit = {id:unitId, number:String(n).padStart(2,'0'), title:b.title, topic:b.title, goal:b.goal, level:b.level, levelCode:b.level, pronunciation:'带重音的词与常见搭配一起读；先慢读完整例句，再试着连贯表达。', sourceIds:['pcic','cefr',vocabSource,grammarSource]};
  units.push(unit);
  const rows = b.vocabulary.trim().split('\n');
  if(rows.length !== 10) throw new Error(`${unitId} 词条数量应为 10`);
  rows.forEach((row, i) => {
    const [spanish,meaning,pos,example,translation] = row.split('|');
    const base = spanish.split(' / ')[0];
    words.push({id:`w${index*10+81+i}`,unitId,level:b.level,spanish,meaning,pos,example,translation,note:posNotes[base]||'通用',dictionaryUrl:`https://dle.rae.es/${encodeURIComponent(lemma[base]||base)}`,sourceIds:['dle',vocabSource],editorial:'原创释义与例句；新增词条待逐条词典复核',verification:{status:'pending'}});
  });
  const [title,summary,rules,questions] = b.grammar;
  lessons.push({id:`g${n}`,unitId,title,summary,rules,examples:words.filter(w=>w.unitId===unitId).slice(0,3).map(w=>[w.example,w.translation]),questions:questions.map(([prompt,options,answer,explanation],i)=>({id:`g${n}q${i+1}`,prompt,options,answer,explanation})),references:[{sourceId:grammarSource,section:`语法清单：${title}（本站的讲解标题；参照官方对应结构）`},{sourceId:vocabSource,section:b.section}],sourceIds:[grammarSource,vocabSource],editorial:'原创讲解和练习；依 PCIC 结构编排，待专业教师审稿'});
});

const focusedExamples = [[["Mi piso es más pequeño que el tuyo.", "我的公寓比你的小。"], ["Esta calle es tan tranquila como la otra.", "这条街和另一条一样安静。"]], [["Me levanto temprano y después me ducho.", "我早起，之后淋浴。"], ["Antes de acostarme, leo un libro.", "上床睡觉前，我读书。"]], [["Me duele la garganta y tengo que descansar.", "我喉咙痛，必须休息。"], ["Me duelen los pies.", "我脚痛。"]], [["He reservado una habitación.", "我预订了一个房间。"], ["Ana ha escrito un mensaje al hotel.", "安娜给酒店写了消息。"]], [["Esta camisa es bonita. La compro.", "这件衬衫很漂亮。我买它。"], ["Estos zapatos son baratos. Los compro.", "这些鞋便宜。我买它们。"]], [["Ayer visité un museo y compré una entrada.", "我昨天参观了博物馆并买了一张入场券。"], ["El sábado fui a un concierto.", "我周六去听了一场音乐会。"]], [["Hace sol y podemos ir a la playa.", "阳光明媚，我们可以去海滩。"], ["Si llueve, nos quedamos en casa.", "如果下雨，我们就留在家里。"]], [["¿Puedes ayudarme con la tarea, por favor?", "请问你能帮我做作业吗？"], ["Me puedes ayudar después de la reunión.", "你可以在会议后帮我。"]], [["Cuando era pequeña, leía mucho.", "我小时候常读书。"], ["Estudiaba cuando sonó el teléfono.", "电话响时我正在学习。"]], [["Te aconsejo que repases el vocabulario.", "我建议你复习词汇。"], ["Espero que tengas más confianza.", "我希望你更有信心。"]], [["Me gustaría trabajar en esta empresa.", "我想在这家公司工作。"], ["¿Podría darme más información sobre el puesto?", "您能给我更多岗位信息吗？"]], [["Creo que la noticia es cierta.", "我认为这条新闻是真的。"], ["No creo que la noticia sea cierta.", "我不认为这条新闻是真的。"]], [["Apago la luz para ahorrar energía.", "我关灯节约能源。"], ["Te explico el plan para que puedas participar.", "我向你解释计划，好让你能参与。"]], [["La aplicación que uso es útil.", "我使用的应用很有用。"], ["La ciudad donde vivo tiene una biblioteca.", "我居住的城市有一座图书馆。"]], [["Me alegro de que estés aquí.", "我很高兴你在这里。"], ["Espero que podamos llegar a un acuerdo.", "我希望我们能达成共识。"]], [["Cuando llegué, el tren ya había salido.", "我到达时，火车已经离开。"], ["Expliqué que había perdido mi equipaje.", "我解释说我之前丢了行李。"]], [["Busco un curso que ofrezca prácticas.", "我在找一门提供实践机会的课程。"], ["Tengo un curso que ofrece prácticas.", "我有一门提供实践机会的课程。"]], [["Si tuviera más dinero, invertiría en formación.", "如果我有更多钱，我会投资培训。"], ["Si fuera posible, ampliaríamos el plazo.", "如果可以，我们会延长期限。"]], [["Aunque el plan sea caro, lo llevaremos a cabo.", "即使计划昂贵，我们也会实施它。"], ["Aunque ahora es caro, el proyecto tiene ventajas.", "虽然项目现在很贵，但它有优势。"]], [["Las muestras fueron analizadas.", "样本经过了分析。"], ["Se publicaron los resultados.", "结果被公布了。"]], [["Dijo que estaba cansada.", "她说她当时很累。"], ["Dijo que iría al día siguiente.", "他/她说会在次日去。"]], [["Lo importante es escuchar a los demás.", "重要的是倾听他人。"], ["Es importante que haya respeto.", "存在尊重很重要。"]], [["El plan es caro; sin embargo, tiene ventajas.", "计划很贵；然而，它有优势。"], ["Hay razones suficientes; por lo tanto, propongo aprobarlo.", "理由充分；因此，我提议批准它。"]], [["A pesar del coste, el plan es viable.", "尽管有成本，计划仍可行。"], ["En definitiva, necesitamos una evaluación clara.", "总而言之，我们需要清晰的评估。"]]];
lessons.forEach((lesson,i)=>{lesson.examples=[...focusedExamples[i],lesson.examples[0]];});
module.exports = {units,words,lessons};
