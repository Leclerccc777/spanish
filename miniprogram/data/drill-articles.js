// Original bridge readings. Preview and self-check only; no new progress fields.
module.exports = {
  'a1-likes': {
    title: 'Una tarde con Mei · 小美的一个下午',
    goal: '先读两小段生活介绍，再把人物的信息换成自己的。',
    paragraphs: [
      'Me llamo Mei. Soy estudiante y vivo en una ciudad pequeña. Por la mañana estudio español en casa. En mi habitación hay una mesa y dos sillas. Mis libros están en la mesa. Me gusta leer porque aprendo palabras nuevas.',
      'Por la tarde voy a una cafetería. Mi amiga Ana trabaja allí. Pido un café y digo «gracias». Los domingos Ana no trabaja. Le gusta leer también. Ese día leemos en mi casa.'
    ],
    words: [['voy', '我去，ir 的“我”形式'], ['leemos', '我们读书，leer 的“我们”形式'], ['allí', '在那里，指前句的咖啡馆'], ['pido', '我点 / 我要，pedir 的“我”形式'], ['ese día', '那一天，指星期日']],
    checks: [
      ['两段分别在介绍什么？', 'Por la mañana estudio español en casa.', '第一段介绍 Mei 和上午的学习环境；第二段写下午去咖啡馆以及星期日和朋友读书。'],
      ['星期日为什么能和 Ana 一起读书？', 'Los domingos Ana no trabaja. Le gusta leer también.', 'Ana 星期日不工作，而且也喜欢读书；这两条信息一起支持她们的安排。'],
      ['最后一句的“那一天”是哪一天？', 'Ese día leemos en mi casa.', '回到前面的 Los domingos；不是泛指每天下午。leemos 表示我们读书。']
    ],
    response: '合上文章，说三句：你是谁、在哪里学习、喜欢什么以及一个理由。再假设朋友星期日要工作，换一天邀请对方。'
  },
  'a2-travel': {
    title: 'Un cambio de planes · 一次行程调整',
    goal: '读一封出行邮件，把过去的事、已完成的准备和下一步安排分开。',
    paragraphs: [
      'Hola, Marta: El sábado pasado fui a Toledo con Luis. Salimos temprano, pero perdimos el autobús al centro. Primero buscamos información en la estación. Una señora nos explicó dónde comprar otro billete. Después llegamos al hotel y dejamos las maletas.',
      'Queríamos visitar un museo, pero estaba cerrado. Por eso paseamos por la ciudad y comimos cerca de una plaza. La comida era más barata que en nuestro barrio. Al final volvimos al hotel a pie.',
      'Hoy hemos reservado las entradas para mañana. Todavía no hemos elegido un restaurante. Si hace sol, vamos a comer fuera. Si llueve, podemos comer en el hotel. ¿Quieres venir con nosotros? Un abrazo, Ana.'
    ],
    words: [['perdimos el autobús', '我们没赶上公交车'], ['queríamos', '我们当时想；先按整块理解这种过去的想法'], ['era más barata', '当时更便宜；比较那时的价格'], ['estaba cerrado', '当时关着门；描述那时的状态'], ['hemos reservado las entradas', '我们已经订好门票'], ['todavía no hemos elegido', '我们还没有选好']],
    checks: [
      ['这封邮件主要是在抱怨，还是在说明变化并邀请朋友？', '¿Quieres venir con nosotros?', '前两段介绍遇到的问题和调整，最后说明准备与安排，并邀请 Marta。'],
      ['为什么没去博物馆？后来做了什么？', 'Queríamos visitar un museo, pero estaba cerrado. Por eso paseamos por la ciudad y comimos cerca de una plaza.', 'pero 给出障碍，por eso 接调整；原计划没有发生，散步和吃饭发生了。'],
      ['明天的安排中，哪些已准备好，哪些还不确定？', 'Hoy hemos reservado las entradas para mañana. Todavía no hemos elegido un restaurante.', '门票已订；餐厅没选，在哪里吃还取决于天气。不能把 si 后的情况当作天气预报。']
    ],
    response: '用四五句回复 Ana：能否参加、一个原因、你能帮忙准备什么。再把情景换成雨天与朋友去公园，提出一个室内替代安排。'
  },
  'b1-anterior': {
    title: 'Aprender a leer de otra manera · 换一种方式阅读',
    goal: '读三段经历文章，抓住问题、做法和有保留的结论；不要求认识每一个词。',
    paragraphs: [
      'Cuando Mei empezó a estudiar español, intentaba traducir todas las palabras de cada texto. Leía muy despacio y a menudo olvidaba el principio antes de llegar al final. Un día encontró un artículo sobre una biblioteca que organizaba actividades gratuitas. Había estudiado muchas palabras, pero no pudo explicar de qué trataba el artículo. Se dio cuenta de que necesitaba cambiar su forma de leer.',
      'Su profesora le dio un consejo: «Busca primero el tema de cada párrafo. Después puedes elegir dos o tres palabras importantes y comprobar su significado». Mei probó este método con una amiga. Primero leyeron por separado; luego compararon sus resúmenes. Cuando no estaban de acuerdo, volvieron al texto para buscar una frase para apoyar cada idea. También escribieron una pregunta para la autora del artículo.',
      'Al cabo de un mes, Mei comprendía mejor los textos sobre temas conocidos. Todavía necesitaba ayuda con artículos especializados, pero ya podía contar lo esencial sin traducir cada frase. Según ella, lo más útil no fue leer más rápido, sino aprender a justificar lo que había entendido. Ahora quiere participar en el grupo de lectura de la biblioteca.'
    ],
    words: [['de qué trataba el artículo', '文章在讲什么；抓主题'], ['por separado', '各自独立地'], ['para apoyar cada idea', '用来支持每个想法；这里指原文依据'], ['lo esencial', '最主要的内容'], ['sino', '不是前一项，而是后一项；纠正重点']],
    checks: [
      ['用一句话概括每段，再把三段连成一个主旨。', 'Se dio cuenta de que necesitaba cambiar su forma de leer.', '逐词翻译带来困难 → 先抓段意、找词义并核对依据 → 熟悉主题的阅读改善。主旨是阅读方法的改变。'],
      ['意见不同时，她们如何判断，而不是只凭感觉？', 'Cuando no estaban de acuerdo, volvieron al texto para buscar una frase para apoyar cada idea.', '回到原文找支持想法的句子；不同摘要需要证据，不能只看谁说得流利。'],
      ['能否据此认为 Mei 已经能独立读懂任何文章？', 'Todavía necesitaba ayuda con artículos especializados, pero ya podía contar lo esencial sin traducir cada frase.', '不能。专业文章仍需帮助；进步体现在熟悉主题和概括主要内容，原文保留了范围。']
    ],
    response: '先用三句西语概括问题、改变和结果，再用两句说你的阅读习惯及想尝试的办法。换到“听一段公告”的情景：哪些方法还能用，哪些需要调整？'
  },
  'b2-evaluation': {
    title: 'Una biblioteca abierta al barrio · 社区图书馆提案',
    goal: '读一篇项目评论，分清调查、提议和未知结果，再作有依据的回应。',
    paragraphs: [
      'El ayuntamiento estudia abrir una biblioteca en un local que lleva varios años vacío. Según un informe municipal, se entrevistó a veinte vecinos y la mayoría pidió un lugar tranquilo para leer. Algunos también propusieron cursos de idiomas por la noche. Sin embargo, el documento no explica cómo se eligió a las personas entrevistadas. Por eso, sus respuestas ofrecen información útil, pero no permiten conocer las necesidades de todo el barrio.',
      'La asociación vecinal apoya la propuesta, aunque reconoce que el presupuesto es limitado. Si hubiera más recursos, contrataría a varias personas y abriría todos los días. Con el dinero disponible, propone empezar tres tardes por semana. Busca voluntarios que puedan ayudar, pero todavía no ha confirmado cuántos participarían. El lunes anunció que presentaría un plan detallado al día siguiente; al cierre de este artículo, no se había publicado.',
      'Una profesora del barrio recomienda que la prueba dure tres meses. Durante ese periodo, se podrían registrar las visitas y preguntar a los usuarios qué horarios necesitan. También sería importante escuchar a quienes no acudan, para no confundir la opinión de los visitantes con la de toda la comunidad.',
      'La idea merece una oportunidad, siempre que se evalúen sus resultados antes de ampliarla. Abrir un local no garantiza por sí solo que más personas lean. Un objetivo razonable sería comprobar si el espacio responde a necesidades concretas y si puede mantenerse con los recursos existentes.'
    ],
    words: [['ayuntamiento', '市政府'], ['al cierre de este artículo', '截至本文完稿时；给未知结果限定时间'], ['quienes no acudan', '那些不来的人'], ['siempre que', '只要；这里提出支持的条件'], ['por sí solo', '仅凭这件事本身']],
    checks: [
      ['作者支持什么，又对支持提出了什么条件？', 'La idea merece una oportunidad, siempre que se evalúen sus resultados antes de ampliarla.', '支持试行，在扩大前先评估；这不是对项目必然成功的断言。'],
      ['为什么不能把二十人的回答直接代表全社区？', 'Sin embargo, el documento no explica cómo se eligió a las personas entrevistadas.', '抽取受访者的方法不明，代表性尚不清楚；还应听取不使用图书馆的人。'],
      ['哪些内容还是假设或计划，而非已实现的事实？', 'Busca voluntarios que puedan ayudar, pero todavía no ha confirmado cuántos participarían.', '更多资源下每天开放是设想；志愿者人数未确认；宣布提交计划也不代表已公开计划，均需后续核实。']
    ],
    response: '用六至八句写一段回应：立场、两条原文依据、一项未知和一个可执行建议。再把项目换成晚间语言交流角，说明预算不变时先试什么、如何判断是否继续。'
  }
};
