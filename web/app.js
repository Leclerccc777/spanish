/* global HolaLearning */
(() => {
  'use strict';
  const L = window.HolaLearning;
  const C = L.course;
  const KEY = 'hola-learning-v1';
  const root = document.getElementById('app');
  let storageFailed = false;
  let state;
  try { state = L.restore(JSON.parse(localStorage.getItem(KEY) || 'null')); }
  catch { state = L.emptyState(); storageFailed = true; }
  let levelFilter = '', grammarLevel = 'A1', expressionEditor = null;
  let query = '', unitFilter = '', sourceFilter = '', session = null, quiz = null, wordQuiz = null;
  let bankLevel='A1', bankQuery='', bankPageIndex=0, packPageIndex=0;
  let foundationQuiz=null, yearWeek=0;
  let nounQuiz=null;
  let toastTimer;
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const paths = {
    home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
    book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1z"/><path d="M12 5v15"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8z"/><path d="m2 12 10 5 10-5M2 16l10 5 10-5"/>',
    library: '<rect x="3" y="4" width="5" height="16" rx="1"/><path d="M10 4h4v16h-4zM16 5l4-1 3 15-4 1z"/>',
    chart: '<path d="M3 3v18h18M7 16v-5M12 16V7M17 16V4"/>',
    flame: '<path d="M13 2c1 6-4 5-2 11-3-1-3-4-3-4s-5 5-3 10c3 5 13 4 14-2 1-5-2-8-6-15z"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M17 14h1"/>',
    volume: '<path d="M11 4 5 9H2v6h3l6 5zM15 8c3 2 3 6 0 8M18 5c5 4 5 10 0 14"/>',
    refresh: '<path d="M20 7a8 8 0 1 0 1 7M20 3v5h-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  const btn = (label, action, attrs = '', cls = '') => `<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
  const pill = (label, warm = false) => `<span class="pill${warm ? ' warm' : ''}">${esc(label)}</span>`;
  const percent = (value, total) => Math.min(100, Math.round(value / total * 100));
  const meter = value => `<div class="meter"><span style="width:${value}%"></span></div>`;
  function notify(message) { const element = document.getElementById('toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 4000); }
  function commit(action) {
    const draft = L.restore(JSON.parse(JSON.stringify(state)));
    const result = action(draft);
    try { localStorage.setItem(KEY, JSON.stringify(draft)); }
    catch { notify('学习记录未保存，请检查浏览器存储权限或空间后重试。'); return null; }
    state = draft;
    return result;
  }
  const route = () => location.hash.slice(1) || 'today';
  function navigate(to) { if (route() === to) render(); else location.hash = to; }
  const heading = (overline, title, subtitle, trailing = '') => `<div class="page-head"><div><div class="eyebrow">${esc(overline)}</div><h1>${esc(title)}</h1><p class="subtitle">${esc(subtitle)}</p></div>${trailing}</div>`;
  function shell(body, active) {
    const items = [['today','home','今日学习'],['words','book','词汇练习'],['grammar','layers','语法路线'],['library','library','资料库'],['progress','chart','学习进度']];
    const current = ['study', 'word-quiz', 'bank', 'nouns'].includes(active) || active.startsWith('noun/') ? 'words' : (active.startsWith('lesson/') || active.startsWith('expression/') || active.startsWith('foundation/') || active==='foundations' || active==='year') ? 'grammar' : active;
    const s = L.summary(state);
    return `<div class="shell"><aside class="sidebar"><a href="#today" class="brand" aria-label="Hola 首页"><span class="brand-mark">h</span><span><span class="brand-word">hola<span style="color:#1cb0f6">.</span></span><span class="brand-sub">每天一点西语</span></span></a><nav class="nav" aria-label="主导航">${items.map(([key,i,title]) => `<a href="#${key}" class="${current === key ? 'active' : ''}" ${current === key ? 'aria-current="page"' : ''}>${icon(i)}<span>${title}</span></a>`).join('')}</nav><div class="sidebar-bottom"><div class="mini-note"><strong>Un poco cada día.</strong>每天一点点，<br>让语言成为你的新日常。<div style="margin-top:13px">${pill('A1 → B2 · 通用西语')}</div></div><div class="side-footer">HECHO CON CALMA · 慢慢学</div></div></aside><main class="main"><header class="topbar"><span class="crumb">我的西语旅程 / ${esc((items.find(x => x[0] === current) || items[0])[2])}</span><div class="top-actions"><span class="level">${`${s.unit.levelCode} · ${s.checkedIn ? '✓ 今日已打卡' : '分级学习'}`}</span><span class="avatar" aria-label="本地学习者">学</span></div></header><div class="content">${body}<footer class="footer-note"><span>以 Cervantes / CEFR / RAE 为参考方向 · 参考页面已核验</span><span>本地保存 · A1–B2 分级练习 · 浏览器体验版</span></footer></div></main></div>`;
  }
  function art() {
    return `<svg class="hero-art" viewBox="0 0 220 230" aria-hidden="true"><circle cx="126" cy="99" r="77" fill="#46a302"/><circle cx="180" cy="26" r="17" fill="#ffdc62"/><path d="M24 69h15m-7-7v15M188 167h17m-8-8v16" stroke="#e4ffc4" stroke-width="2"/><g transform="rotate(-9 112 115)"><rect x="49" y="53" width="119" height="149" rx="10" fill="#329000"/><rect x="42" y="45" width="119" height="149" rx="8" fill="#ffffff"/><path d="M58 72h77M58 79h48" stroke="#d8edfc" stroke-width="2"/><text x="101" y="123" text-anchor="middle" font-family="sans-serif" font-size="35" font-weight="800" fill="#286600">¡Hola!</text><text x="101" y="146" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="3" fill="#075b86">UN NUEVO MUNDO</text><path d="M59 170h77" stroke="#d8edfc" stroke-width="2"/><circle cx="131" cy="173" r="11" fill="#ddffb9"/><path d="m126 173 3 3 6-7" stroke="#286600" stroke-width="2" fill="none"/></g><g transform="rotate(12 176 116)"><rect x="169" y="73" width="10" height="100" rx="4" fill="#ff9600"/><path d="m169 172 5 12 5-12" fill="#fff4c9"/><path d="m172 180 2 4 2-4" fill="#303b45"/></g><path d="M177 199c-1-24 8-39 21-41-1 18-7 26-21 41Z" fill="#c3f68e"/><path d="M177 199c-13-10-20-12-29-10 6 11 16 15 29 10Z" fill="#ddffb9"/></svg>`;
  }
  function stat(value, label, i, unit = '') { return `<div class="stat"><div class="stat-icon">${icon(i)}</div><div><div class="stat-value">${value}<small>${esc(unit)}</small></div><div class="stat-label">${esc(label)}</div></div></div>`; }
  function todayPage() {
    const s = L.summary(state); const foundationPassed=L.foundationProgress(state).filter(f=>f.passed).length; const lesson = C.lessons.find(l => l.unitId === s.unit.id);
    const date = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
    return heading('BUEN DÍA, ESTUDIANTE', '把西语，变成日常。', '每天约 15 分钟，向更大的世界说 Hola。', `<div class="date-chip">${icon('calendar')}${esc(date)}</div>`) +
      `<section class="card beginner-start"><h2>${foundationPassed<4?'零基础？从这里开始。':'把基础练熟，再走远一点。'}</h2><p class="tiny">发音 → 重音 → 名词阴阳性 → 性数配合，每次一个 5–6 分钟小步骤。</p><div class="actions">${btn(`四步入门 · ${foundationPassed} / 4 达标`,'foundations')}${btn('一年 A1 → B1 计划','year','','secondary')}${btn('A1 名词三步练习 →','nouns','','secondary')}</div></section><div class="dashboard-grid"><section class="hero"><div class="hero-grid"><div><div class="hero-tag">${icon('sun').replace('viewBox=', 'width="12" height="12" viewBox=')} UNIDAD ${s.unit.number} · ${esc(s.unit.topic)}</div><h2>${esc(s.unit.title)}</h2><p>${esc(s.unit.goal)}<br>从一个词开始，慢慢说出你的故事。</p>${btn(`${s.checkedIn ? '再巩固一轮' : '开始今日学习'} ${icon('arrow')}`, 'study', '', 'lime')}</div>${art()}</div></section><section class="card task-list"><div class="task-header"><h2>今天的小目标</h2>${pill(s.checkedIn ? '已打卡 ✓' : '待完成', !s.checkedIn)}</div><div class="task"><div class="task-icon">${icon('book')}</div><div class="task-label">词汇学习<div class="task-meta">新词 + 间隔复习</div></div><div class="task-count">${s.day.words.length} <span class="tiny">/ ${s.day.goal}</span></div></div>${meter(s.wordPercent)}<div class="task"><div class="task-icon">${icon('layers')}</div><div class="task-label">语法练习<div class="task-meta">4 道题，达标线 75%</div></div><div class="task-count">${s.day.grammar.length ? '✓' : '0'} <span class="tiny">/ 1</span></div></div><div class="checkin-note">${icon('check')}<span>${s.checkedIn ? '今日目标完成啦，学习记录已保存。' : '完成两个目标后，自动为今天打卡。'}</span></div></section></div>` +
      `<div class="card"><h2>词汇路线 · 累计 6500 个条目</h2><p class="tiny">A1 800 → A2 2300 → B1 4300 → B2 6500 · 当前每日范围：${state.track==='bank'?'扩展词库':'课内词汇'}</p>${btn('进入 6500 词库 →','bank','','secondary')}</div><section class="stats" aria-label="学习统计">${stat(s.streak,'连续打卡','flame','天')}${stat(s.learned,'已学习词汇','book','词')}${stat(s.due,'到期复习','refresh','词')}${stat(s.grammarPassed,'语法已达标','layers','课')}</section><div class="two-column"><section><div class="section-head"><h2>学一点，练一点</h2><a class="text-link" href="#grammar">全部课程 →</a></div><div class="card lesson-teaser"><div class="lesson-cover">${s.unit.number}</div><div>${pill('今日语法')}<h3>${esc(lesson.title)}</h3><p>讲解 + 例句 + 4 道练习</p></div>${btn('去练习 →','lesson',`data-id="${lesson.id}"`,'secondary')}</div></section><section><div class="section-head"><h2>把词串起来</h2><span class="tiny">UN CONSEJO</span></div><div class="tip"><h3>${esc(s.unit.levelCode)} · 今天的表达挑战</h3><p>把本单元词汇放进句子，同时复用前面学过的词。</p>${btn('开始词汇串联 →','expression',`data-id="${C.tasks.find(t=>t.unitId===s.unit.id).id}"`,'secondary')}</div></section></div><div class="section-head"><h2>你的 A1 → B2 学习路线</h2><a class="text-link" href="#grammar">查看 32 个单元 →</a></div><div class="roadmap">${C.units.filter(u=>u.levelCode===s.unit.levelCode).slice(0,4).map(u => { const unlocked = L.isUnlocked(state,u.id); const p = L.unitProgress(state,u.id); const current = s.unit.id === u.id; return `<div class="card unit-mini ${current ? 'current' : ''} ${unlocked ? '' : 'locked'}"><div class="unit-number">UNIDAD ${u.number}<span class="unit-state">${p.complete ? '✓ 完成' : current ? '正在学习' : unlocked ? '可学习' : '待解锁'}</span></div><h3>${esc(u.title)}</h3><span class="tiny">${esc(u.topic)} · 10 个词</span><button aria-label="学习${esc(u.title)}" data-action="lesson" data-id="${C.lessons.find(l=>l.unitId===u.id).id}"></button></div>`; }).join('')}</div>`;
  }
  function foundationsPage() {
    const rows=L.foundationProgress(state);
    return heading('PRIMEROS PASOS','先学会第一句话。','四个 5–6 分钟小步骤，先建立读音、重音、阴阳性与配合的基础。')+`<div class="notice">第一天先做第一微课，再记 3–5 个词，说一句 Hola, me llamo… 。之后逐步加入语法与表达，不用一次背完词库。</div><div class="lesson-grid">${rows.map((f,i)=>`<article class="card"><div class="card-head">${pill(`步骤 ${i+1}`)}<span class="tiny">${f.passed?'规则练习达标':`${f.minutes} 分钟`}</span></div><h2>${esc(f.title)}</h2><p>${esc(f.goal)}</p>${btn(f.passed?'再巩固一次':'从这里开始 →','foundation',`data-id="${f.id}"`,'secondary')}</article>`).join('')}</div><div class="actions">${btn('A1 名词三步练习 →','nouns','','secondary')}${btn('一年 A1 → B1 计划','year','','secondary')}${btn('开始今天的词汇','study')}</div>`;
  }
  function nounInfo(id) {
    const n=L.nounLessons.find(n=>n.id===id);
    return n ? `<div class="regional"><strong lang="es">${esc(n.singular)} → ${esc(n.plural)}</strong> · ${esc(n.gender)}<p lang="es">${esc(n.phrase)} · ${esc(n.phraseTranslation)}</p><p class="tiny">新增词形与搭配待教师审稿</p>${btn('练这个名词','noun',`data-id="${n.id}"`,'small secondary')}</div>` : '';
  }
  function nounsPage() {
    return heading('PALABRAS EN ACCIÓN · A1','让名词连着用。','选冠词 → 改形容词 → 补完整句。每次约 3 分钟，先练一个名词。') + `<div class="notice">首批 8 个名词，复用已有词条。基础词义与词性有核对记录；新增搭配与练习待教师审稿。练习独立保存，不计每日打卡、词汇掌握或课程解锁。</div><div class="actions">${btn('先复习性数配合','foundation','data-id="agreement"','secondary')}</div><div class="lesson-grid">${L.nounProgress(state).map(n=>`<article class="card noun-card"><div class="card-head">${pill(n.gender)}<span class="tiny">${n.bestScore===null?'尚未练习':`最佳正确率 ${n.bestScore}%`}</span></div><h2 lang="es">${esc(n.singular)}</h2><p>${esc(n.meaning)} · 复数 <span lang="es">${esc(n.plural)}</span></p><p class="example" lang="es">${esc(n.phrase)}</p><p class="tiny">待订正 ${n.mistakes.length} 项</p>${n.mistakes.map(q=>`<p class="tiny">${esc(q.title)} · 上次：${esc(q.previousAnswer)}</p>`).join('')}${btn(n.mistakes.length?'订正这组练习':'练这一个名词 →','noun',`data-id="${n.id}"`,'secondary')}</article>`).join('')}</div>`;
  }
  function submitNounAnswer(answer) {
    if(!nounQuiz||nounQuiz.feedback||nounQuiz.result)return;
    if(typeof answer!=='string'||!answer.trim())return notify('请先填写答案。');
    nounQuiz.feedback=L.evaluateNounAnswer(nounQuiz.id,nounQuiz.index,answer);
    nounQuiz.input=answer;nounQuiz.answers[nounQuiz.index]=answer;render();
  }
  function nounPage(id) {
    const n=L.nounLessons.find(n=>n.id===id);
    if(!n)return '<div class="card empty">没有找到名词练习。<a href="#nouns">返回名词列表</a></div>';
    const head=`${btn(`${icon('back')} 返回名词列表`,'nouns','','back')}${heading('PALABRAS EN ACCIÓN · A1',n.singular,n.meaning+' · '+n.gender)}`;
    if(!nounQuiz||nounQuiz.id!==id)return `<section class="reading">${head}<div class="card"><h2>把冠词一起记</h2><p class="example" lang="es">${esc(n.singular)} → ${esc(n.plural)}</p><p class="example" lang="es">${esc(n.phrase)}</p><p>${esc(n.phraseTranslation)}</p><p>${esc(n.rule)}</p><div class="notice">${esc(n.note)}</div><p class="example" lang="es">${esc(n.sentence)}</p><p>${esc(n.translation)}</p></div><p class="tiny">${esc(n.reviewScope)}</p><div class="card"><h2>本组参考</h2><p><a href="${esc(L.findWord(n.id).dictionaryUrl)}" target="_blank" rel="noopener noreferrer">查原词典义项 ↗</a></p>${n.references.map(r=>{const s=C.sources.find(s=>s.id===r.sourceId);return `<p class="tiny"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br>${esc(r.section)}</p>`;}).join('')}</div>${btn('开始三步练习 →','noun-begin',`data-id="${id}"`)}</section>`;
    if(nounQuiz.result){const r=nounQuiz.result;return `<section class="reading">${head}<div class="card result-card"><div class="result-score">${r.score}%</div><h2>三步练习已保存</h2><p>答对 ${r.correct} / ${r.total} 题。错项保留在名词列表，下次答对即可移除。</p><p class="tiny">仅检查本题指定答案，不判断自由表达能力；不计每日打卡或词汇掌握。</p><div class="actions">${btn('再练这三步','noun-begin',`data-id="${id}"`)}${btn('换一个名词 →','nouns','','secondary')}</div></div></section>`;}
    const q=n.questions[nounQuiz.index],f=nounQuiz.feedback;
    return `<section class="reading">${head}${pill(`${nounQuiz.index+1} / 3`)}<h2 class="question-title">${esc(q.title)}</h2><p>${esc(q.prompt)}</p>${q.kind==='article'?q.options.map(o=>`<button class="choice ${f&&o===q.answer?'correct':f&&o===nounQuiz.input?'wrong':''}" data-action="noun-answer" data-answer="${o}" ${f?'disabled':''}>${o}</button>`).join(''):`<label for="noun-answer">西语答案</label><input id="noun-answer" class="search-input spelling-input" value="${esc(nounQuiz.input)}" maxlength="200" autocomplete="off" autocapitalize="off" spellcheck="false" ${f?'disabled':''}/><div class="accent-buttons">${['á','é','í','ó','ú','ü','ñ'].map(c=>`<button data-action="noun-accent" data-char="${c}" aria-label="添加 ${c}" ${f?'disabled':''}>${c}</button>`).join('')}</div><p class="tiny">大小写、空格和句末标点可灵活；重音与 ñ 要准确。</p>${f?'':btn('检查答案','noun-submit')}`}${f?`<div class="feedback" role="status"><strong>${f.correct?'✓ 答对了':'再看一下配合与拼写'}</strong><p lang="es">参考答案：${esc(f.answer)}</p><p>${esc(f.explanation)}</p></div>${btn(nounQuiz.index===2?'保存并查看结果':'下一步 →','noun-next')}`:''}</section>`;
  }
  function foundationPage(id) {
    const f=L.foundations.find(f=>f.id===id);
    if(!f)return '<div class="card empty">没有找到基础课。</div>';
    const head=`${btn(`${icon('back')} 返回四步入门`,'foundations','','back')}${heading('PRIMEROS PASOS',f.title,f.goal)}`;
    if(!foundationQuiz||foundationQuiz.id!==id)return `<section class="reading">${head}<div class="card"><ol class="rules">${f.rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div>${f.examples.map(([es,zh])=>`<div class="card"><p class="example" lang="es">${esc(es)}</p><p>${esc(zh)}</p>${'speechSynthesis' in window?btn('听设备合成语音','foundation-speak',`data-text="${esc(es.split(' → ')[0])}"`,'small secondary'):''}</div>`).join('')}<div class="card"><h2>现在开口试一试</h2><p>${esc(f.practice)}</p><p class="tiny">合成语音取决于设备的西语音色，不是教材录音；本地练习不判断发音。</p></div><div class="card"><h2>本课参考</h2>${f.references.map(r=>{const s=C.sources.find(s=>s.id===r.sourceId);return `<p class="tiny"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br>${esc(r.section)}</p>`;}).join('')}</div>${btn('做 4 道小练习 →','foundation-begin',`data-id="${id}"`)}</section>`;
    if(foundationQuiz.result){const r=foundationQuiz.result;return `<section class="reading">${head}<div class="card result-card"><div class="result-score">${r.score}%</div><h2>${r.passed?'这一步的规则练习已达标':'慢慢来，再练一次'}</h2><p>答对 ${r.correct} / ${r.total} 题。选择题检查规则知识，口头发音仍需要模仿和反馈。</p><p class="tiny">基础课进度单独保存，不计每日词汇或语法打卡。</p><div class="actions">${btn('继续下一微课 →','foundations')}${btn('重新练习','foundation-begin',`data-id="${id}"`,'secondary')}${btn('开始今天的词汇','study','','secondary')}</div></div></section>`;}
    const q=f.questions[foundationQuiz.index],selected=foundationQuiz.answers[foundationQuiz.index];
    return `<section class="reading">${head}<div class="pill">${foundationQuiz.index+1} / ${f.questions.length}</div><h2 class="question-title">${esc(q.prompt)}</h2>${q.options.map((option,i)=>`<button class="choice ${selected!==undefined&&i===q.answer?'correct':selected===i?'wrong':''}" data-action="foundation-answer" data-index="${i}" ${selected!==undefined?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span>${esc(option)}</button>`).join('')}${selected!==undefined?`<div class="feedback"><strong>${selected===q.answer?'✓ 答对了':'再看一遍这个规则'}</strong><p>${esc(q.explanation)}</p></div>${btn(foundationQuiz.index+1===f.questions.length?'查看结果':'下一题 →','foundation-next')}`:''}</section>`;
  }
  function yearPage() {
    const summary=L.yearSummary(state,L.dateKey());if(!yearWeek)yearWeek=summary.weekNumber;
    const w=L.yearPlan.weeks[yearWeek-1],record=state.journey.weekChecks[yearWeek]||{skills:[]},editable=summary.started&&summary.day>0&&yearWeek<=summary.weekNumber;
    return heading('UN AÑO, PASO A PASO','一年，慢慢走向 B1。','52 周 + 第 365 天复盘。每周六天练习、一天回顾或休息，按实际掌握情况调整。')+`<div class="card"><h2>${summary.started?'你的学习计划':'从今天设一个起点'}</h2><p>${summary.started?`开始日期：${esc(summary.startDate)} · 经过 ${summary.day} 天 · 建议第 ${summary.weekNumber} 周`:'先用第一周建立习惯，不用追赶日历。'}</p><p class="tiny">周自检已勾选 ${summary.completedWeeks} / 52；入门规则练习 ${summary.foundationPassed} / 4 达标。</p><div class="actions">${summary.started?'':btn('开始一年计划','year-start')}${btn('四步入门','foundations','','secondary')}</div></div><div class="notice">一年是学习安排，不是等级保证。听说读写需要持续练习与反馈；日历不会自动解锁课程，周自检是你的练习记录。中断后从实际薄弱处继续。</div><div class="roadmap">${L.yearPlan.stages.map(s=>`<article class="card"><h3>${s.level||s.id} · 第 ${s.start}–${s.end} 周</h3><p>${esc(s.focus)}</p><p class="tiny">建议每天 ${s.minutes} 分钟 · ${s.newWords?`新词 ${s.newWords} 个，另加旧词复习`:'少学新词，优先回顾'}</p><p class="tiny">${esc(s.output)}</p></article>`).join('')}</div><div class="toolbar"><label for="year-week">查看周次</label><select id="year-week">${L.yearPlan.weeks.map(w=>`<option value="${w.number}" ${w.number===yearWeek?'selected':''}>第 ${w.number} 周 · ${w.level} · ${esc(w.title)}</option>`).join('')}</select>${btn('回到建议的本周','year-current','','small secondary')}</div><div class="card"><h2>第 ${w.number} 周 · ${w.level} · ${esc(w.title)}</h2><p>语法重点：${esc(w.focus)}</p><p>输出目标：${esc(w.output)}</p><p class="tiny">${esc(w.listening)}</p><p class="tiny">新词建议不是当前每日打卡目标；词卡计划仍按你的设置安排到期复习和练习。</p><div class="actions">${btn(L.isUnlocked(state,w.unitId)?'进入配套语法':'查看课程前置要求','lesson',`data-id="${w.lessonId}"`,'secondary')}${btn('进入配套表达','expression',`data-id="${w.taskId}"`,'secondary')}${btn('寻找本周学习资料','library','','ghost')}</div></div><div class="two-column"><div class="card"><h2>一周怎么练？</h2><ol class="rules">${L.yearPlan.rhythm.map(([day,task])=>`<li><strong>${esc(day)}</strong> · ${esc(task)}</li>`).join('')}</ol></div><div class="card"><h2>本周自检</h2><p class="tiny">完成后自行勾选，可反选。只记录练习，不自动判断语言能力；未来周只可预览。</p>${L.yearPlan.skills.map(s=>`<label class="week-check"><input type="checkbox" data-skill="${s.id}" ${record.skills.includes(s.id)?'checked':''} ${editable?'':'disabled'}/> ${esc(s.label)}</label>`).join('')}</div></div><div class="notice">${esc(L.yearPlan.finalDay)}</div>`;
  }
  function wordsPage() {
    const rows = C.curriculumWords.filter(w => (!levelFilter || w.level === levelFilter) && (!unitFilter || w.unitId === unitFilter) && `${w.spanish} ${w.meaning}`.toLowerCase().includes(query.trim().toLowerCase()));
    return heading('VOCABULARIO', '每个词，都有语境。', '320 个 A1–B2 分级词条，连同例句、词性与地区用法一起记忆。', `<div class="practice-modes">${btn(`词卡复习 ${icon('arrow')}`,'study')}${btn('词义与拼写测验','word-quiz','','secondary')}</div>`) + `<div class="card"><h2>从入门走向 6,500 词</h2><p>按阶段学习扩展词库，再把新词放进自己的表达。</p>${btn('进入 6500 词库 →','bank','','secondary')}</div><div class="toolbar"><label class="sr-only" for="word-search">搜索西语或中文释义</label><input id="word-search" class="search-input" placeholder="搜索西语或中文释义，例如 hola / 你好" value="${esc(query)}" autocomplete="off" /><label class="sr-only" for="level-filter">筛选等级</label><select id="level-filter"><option value="">全部等级</option>${C.levels.map(l=>`<option value="${l.id}" ${levelFilter===l.id?'selected':''}>${l.id} · ${esc(l.title)}</option>`).join('')}</select><label class="sr-only" for="unit-filter">筛选单元</label><select id="unit-filter"><option value="">全部单元</option>${C.units.filter(u=>!levelFilter||u.levelCode===levelFilter).map(u => `<option value="${u.id}" ${unitFilter===u.id?'selected':''}>${u.levelCode} · ${u.number} · ${esc(u.topic)}</option>`).join('')}</select><span class="tiny">${rows.length} 个词条</span></div><div class="word-grid">${rows.map(w => { const r = state.reviews[w.id]; return `<article class="card word-card"><div class="word-top"><span class="word-title" lang="es">${esc(w.spanish)}</span>${pill(!L.isUnlocked(state,w.unitId) ? '后续预览' : r ? r.due <= L.dateKey() ? '待复习' : '已学习' : '未学习')}</div><div class="word-meaning">${esc(w.meaning)}</div><div class="word-pos">${esc(w.pos)} · ${w.level} · 单元 ${w.unitId.slice(1)}</div><details><summary>查看例句与用法</summary>${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><div class="translation">${w.bank?'英文原义 · 中文为辅助释义，待人工校对':esc(w.translation)}</div>${w.note !== '通用' ? `<div class="regional">${esc(w.note)}</div>` : ''}<p class="tiny">${w.verification.status==='reviewed'?`${esc(w.verification.reference)}<br>词义与词性核验 ${esc(w.verification.date)}`:'新增词条：待逐条词典复核'} · 例句为原创<br><a href="${esc(w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">查官方词条 ↗</a></p></details></article>`; }).join('') || '<div class="card empty">没有找到这个词，试试其他关键词。</div>'}</div>`;
  }
  function bankPage() {
    const levels=L.bankProgress(state), unlocked=new Set(levels.filter(l=>l.unlocked).map(l=>l.id));
    const term=bankQuery.normalize('NFC').trim().toLowerCase();
    const all=C.lexicon.catalogue.filter(w=>(!bankLevel||w.level===bankLevel)&&`${w.spanish} ${w.meaning} ${w.definition||''}`.toLowerCase().includes(term));
    const pages=Math.max(1,Math.ceil(all.length/30));bankPageIndex=Math.max(0,Math.min(bankPageIndex,pages-1));
    const packs=C.lexicon.packs.filter(p=>!bankLevel||p.level===bankLevel),packPages=Math.max(1,Math.ceil(packs.length/6));packPageIndex=Math.max(0,Math.min(packPageIndex,packPages-1));
    return heading('VOCABULARIO EN ESPIRAL','6,500 个词，从认识到表达。','6,483 个单词 + 17 个表达；词形和重复语境不计为新词。')+`<div class="card"><h2>选择每天学习的词汇范围</h2><p class="tiny">当前：${state.track==='bank'?'扩展词库':'课内词汇'}。到期复习优先，单词答对后计入每日目标；语法仍按 32 单元学习。</p><div class="actions">${btn('启用扩展词库','track','data-track="bank"',state.track==='bank'?'':'secondary')}${btn('使用课内词汇','track','data-track="course"',state.track==='course'?'':'secondary')}</div></div><div class="level-tabs">${btn('全部','bank-level','data-level=""',bankLevel===''?'':'secondary')}${levels.map(l=>btn(l.id,'bank-level',`data-level="${l.id}"`,bankLevel===l.id?'':'secondary')).join('')}</div><div class="roadmap">${levels.map(l=>`<div class="card"><h3>${l.id} · ${l.total} 词</h3><p class="tiny">累计 ${l.cumulative} · 记忆确认 ${l.confirmed} / ${l.total}</p>${meter(percent(l.confirmed,l.total))}<p class="tiny">${l.unlocked?'可训练':esc(l.unlockReason)}</p></div>`).join('')}</div><div class="notice">等级为参考 PCIC 方向与字幕词频的学习阶段，不是官方逐词 CEFR 定级。扩展词条的中文为辅助释义，英语中转可能存在义项差异，需结合英文原义核对；尚待人工校对。名词性别请查原词典。</div><div class="toolbar"><label class="sr-only" for="bank-search">搜索扩展词库</label><input id="bank-search" class="search-input" maxlength="100" placeholder="搜索西语、中文或英文原义" value="${esc(bankQuery)}"/><span id="bank-count" class="tiny">${all.length} 个去重条目 · 第 ${bankPageIndex+1} / ${pages} 页</span></div><div class="word-grid">${all.slice(bankPageIndex*30,(bankPageIndex+1)*30).map(w=>{const available=w.bank?unlocked.has(w.level):L.isUnlocked(state,w.unitId);return `<article class="card word-card"><div class="word-top"><strong class="word-title" lang="es">${esc(w.spanish)}</strong>${pill(available?'可训练':'后续预览')}</div><p class="word-meaning">${esc(w.meaning)}</p><p class="tiny">${w.level} · ${esc(w.pos)}${w.bank?' · 中文辅助释义待校对':''}</p><details><summary>${w.bank?'查看英文原义与来源':'查看例句与来源'}</summary>${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><p class="tiny">${w.bank?`中文对应英语：${esc(w.pivot)} · ${esc(w.verification.reference)}`:esc(w.translation)}</p><a href="${esc(w.bank?w.sourceUrl:w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">${w.bank?'Wiktionary 原词条':'RAE 查询'} ↗</a>${w.bank?`<p class="tiny">派生词库 CC BY-SA 4.0 · <a href="${esc(w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">RAE 查询 ↗</a></p>`:''}</details></article>`;}).join('')||'<div class="card empty">没有找到这个词，试试其他关键词。</div>'}</div><div class="actions">${btn('上一页','bank-page',`data-step="-1" ${bankPageIndex===0?'disabled':''}`,'secondary')}${btn('下一页','bank-page',`data-step="1" ${bankPageIndex+1===pages?'disabled':''}`,'secondary')}</div><div class="section-head"><h2>词包训练 → 词汇串联</h2><span class="tiny">${packs.length} 个词包 · 第 ${packPageIndex+1} / ${packPages} 页</span></div><div class="lesson-grid">${packs.slice(packPageIndex*6,(packPageIndex+1)*6).map(p=>{const locked=!unlocked.has(p.level);return `<article class="card pack-card"><h3>${p.level} · 词包 ${p.number}</h3><p class="tiny">${p.wordIds.length} 词 · ${esc(p.wordIds.slice(0,4).map(id=>L.findWord(id).spanish).join(' · '))}</p><div class="actions">${btn('词卡训练','study',`data-pack="${p.id}" ${locked?'disabled':''}`,'small secondary')}${btn('词义与拼写','word-quiz',`data-pack="${p.id}" ${locked?'disabled':''}`,'small secondary')}${btn(locked?'预览表达':'串联表达','expression',`data-id="${p.id}"`,'small ghost')}</div></article>`;}).join('')}</div><div class="actions">${btn('前一组词包','pack-page',`data-step="-1" ${packPageIndex===0?'disabled':''}`,'secondary')}${btn('后一组词包','pack-page',`data-step="1" ${packPageIndex+1===packPages?'disabled':''}`,'secondary')}</div>`;
  }
  function grammarPage() {
    const levels=L.levelProgress(state), active=levels.find(l=>l.id===grammarLevel);
    return heading('PASO A PASO','从一句话，到一个世界。','A1 → A2 → B1 → B2 · 32 单元 · 320 词条 · 128 道语法题') + `<div class="level-tabs" role="group" aria-label="分级课程">${levels.map(l=>btn(l.id,'grammar-level',`data-level="${l.id}" aria-pressed="${grammarLevel===l.id}"`,grammarLevel===l.id?'':'secondary')).join('')}</div><div class="card level-overview"><h2>${active.id} · ${esc(active.title)}</h2><p>${esc(active.goal)}</p><p class="tiny">词汇 ${active.learned} / ${active.total} · 完成 ${active.completed} / ${active.unitTotal} 单元 · 输出形式完成 ${active.expressions} 次</p><p class="tiny">表达目标：${esc(active.target)}</p></div><div class="notice">前一单元至少 6 个词完成记忆确认，且语法达 75%，解锁下一单元。每单元都有表达任务。课内 320 张词卡配有原创例句；扩展词库提供 6,500 个去重条目。阶段编排供练习使用，单元完成不代表通过等级考试。<p><a href="#bank">进入 6500 词库 →</a></p></div><div class="lesson-grid">${C.units.filter(u=>u.levelCode===grammarLevel).map(u => { const p=L.unitProgress(state,u.id); const unlocked=L.isUnlocked(state,u.id); const lesson=C.lessons.find(l=>l.unitId===u.id), task=C.tasks.find(t=>t.unitId===u.id); return `<article class="card unit-card ${unlocked?'':'locked'}"><div class="card-head"><span class="eyebrow">${u.levelCode} · UNIDAD ${u.number}</span>${pill(p.complete ? '已完成 ✓' : unlocked ? '可学习' : '待解锁')}</div><h2>${esc(u.title)}</h2><p>${esc(u.goal)}</p>${meter(percent(p.learned,p.total))}<div class="tiny">已学习 ${p.learned} / ${p.total} · 记忆确认 ${p.ready} / ${p.total} · 语法${p.passed?'已达标':'待练习'}</div><div class="actions">${btn(unlocked ? '进入课程 →' : '查看解锁条件','lesson',`data-id="${lesson.id}"`,'small secondary')}${btn('词汇串联 →','expression',`data-id="${task.id}"`,'small ghost')}</div></article>`; }).join('')}</div><div class="card"><h2>综合任务：给城市写一份学习提案</h2><p>跨 A1–B2 复用词汇，把背景、目标、措施、局限和结论写成一篇文字。</p>${btn(L.expressionUnlocked(state,'final')?'开始综合任务 →':'预览最终任务 →','expression','data-id="final"','secondary')}</div>`;
  }
  function expressionPage(id) {
    const task=C.tasks.find(t=>t.id===id);
    if(!task)return '<div class="card empty">没有找到表达任务。</div>';
    if(!expressionEditor||expressionEditor.id!==id){const entry=state.expressions[id];expressionEditor={id,text:entry?entry.text:'',result:entry&&entry.submittedText===entry.text?L.evaluateExpression(id,entry.text):null,showModel:false};}
    const locked=!L.expressionUnlocked(state,id), r=expressionEditor.result;
    return `<section class="reading">${btn(`${icon('back')} ${task.bank?'返回扩展词库':'返回分级课程'}`,task.bank?'bank':'roadmap','','back')}${heading('PALABRAS EN ACCIÓN · '+task.level,task.title,task.prompt)}${task.bank?`<div class="card"><p class="tiny">每组最多 5 个目标词，完成全部组可覆盖本词包。切换前请保存草稿。</p><div class="actions">${C.tasks.filter(t=>t.packId===task.packId).map(t=>btn(`表达 ${t.groupNumber}`,'expression',`data-id="${t.id}"`,'small secondary')).join('')}</div></div>`:''}${locked?'<div class="notice">当前可预览题目。扩展任务需达成前一阶段词汇与课程目标；课内任务按单元解锁；综合任务需完成全部单元。</div>':''}<div class="card"><h2>把这些词串起来</h2><div class="expression-targets">${task.targets.map(t=>`<div><strong lang="es">${esc(t.label)}</strong> · ${esc(t.meaning)}<div class="tiny">可检查词形：${esc(t.forms.join(' / '))}</div></div>`).join('')}</div>${task.recycled?`<p class="regional">复用前面学过的词：<strong lang="es">${esc(task.recycled.label)}</strong> · ${esc(task.recycled.meaning)}<br><span class="tiny">可检查词形：${esc(task.recycled.forms.join(' / '))}</span></p>`:''}</div><div class="card"><h2>搭一个表达框架</h2><ol class="rules">${task.outline.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="tiny">至少 ${task.minimumWords} 个西语词、${task.minimumSentences} 句；每句至少 3 词。${task.minimumParagraphs?'用空行分成至少两段。':''}</p>${task.connectors.length?`<p class="tiny">连接语任选一个：${esc(task.connectors.join(' · '))}</p>`:''}</div><div class="card"><label for="expression-text"><h2>用你自己的经历来写</h2></label><textarea id="expression-text" class="expression-input" maxlength="6000" placeholder="先写短句，再把句子连接起来。空行可分段。" ${locked?'disabled':''}>${esc(expressionEditor.text)}</textarea><div class="accent-buttons">${['á','é','í','ó','ú','ü','ñ'].map(c=>`<button data-action="expression-accent" data-char="${c}" ${locked?'disabled':''} aria-label="添加 ${c}">${c}</button>`).join('')}</div><div class="actions">${btn('保存草稿','expression-save',locked?'disabled':'','secondary')}${btn('检查词汇覆盖','expression-submit',locked?'disabled':'')}</div><p class="tiny" id="expression-status" role="status"></p></div>${r?`<div class="card expression-feedback"><h2>${r.complete?'形式要求已完成 ✓':'继续补充你的表达'}</h2><p class="tiny">${r.wordCount} 词 · ${r.sentenceCount} 句 · ${r.paragraphCount} 段</p>${r.checks.map(c=>`<p>${c.passed?'✓':'○'} ${esc(c.label)}</p>`).join('')}<div class="expression-targets">${r.targets.map(t=>`<span>${t.used?'✓ 已使用':'待加入'} ${esc(t.label)}</span>`).join('')}</div><div class="notice">本地检查只统计所列词形、句数、词数与连接语；不能判断语法、意思或连贯性，不计作词汇掌握或等级认证。</div><ol class="rules">${task.rubric.map(c=>`<li>${esc(c)}</li>`).join('')}</ol>${btn(expressionEditor.showModel?'收起参考内容':task.modelKind==='scaffold'?'查看待填写句型框架':'对照参考范文','expression-model','','secondary')}${expressionEditor.showModel?`<p class="example expression-model" lang="es">${esc(task.model)}</p>`:''}</div>`:''}</section>`;
  }
  function libraryPage() {
    return heading('BIBLIOTECA','学习，有据可循。','能力框架、课程规划与权威词典，构成持续完善的资料库。') + `<div class="notice">已核对官方参考正文与主要语法章节。讲解、释义和例题为本站原创，不代表官方教材或认证；原有 80 词已核对基础词义与词性；课内新增 240 词待逐条复核。扩展 6,183 个词元来自开源词典，中文为英语中转辅助释义，尚待西中人工校对。例句尚未经专业教师审稿。</div><div class="toolbar"><label for="source-filter" class="tiny">按资料类型</label><select id="source-filter"><option value="">全部资料</option>${['课程体系','能力框架','语法参考','词典','用法参考','开源词库'].map(k => `<option ${sourceFilter===k?'selected':''}>${k}</option>`).join('')}</select><span class="tiny">${C.sources.length} 个参考入口</span></div><div class="sources-grid">${C.sources.filter(s=>!sourceFilter||s.kind===sourceFilter).map(s => `<article class="card source-card"><div class="card-head">${pill(s.kind)}<span class="tiny">${s.status==='dataset'?'来源文件校验':'官方页面核验'} ${esc(s.verifiedAt)}</span></div><h2>${esc(s.title)}</h2><div class="institution muted">${esc(s.institution)}</div><p>${esc(s.scope)}</p><p class="tiny">${esc(s.verification)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${s.status==='dataset'?'访问数据来源':'访问官方资料'} ↗</a></article>`).join('')}</div><div class="section-head"><h2>资料如何变成课程？</h2></div><section class="card"><ol class="rules"><li>以 CEFR 的交际能力方向组织学习：问候、介绍、提问、喜好与计划。</li><li>以 Cervantes PCIC 作为课程范围的参考方向，各课附有具体参考章节。</li><li>以 RAE / ASALE 词典与 DPD 复核词义、性数配合及地区差异。</li><li>写原创例句和练习，保留来源 ID，使每个课程单元都能回溯参考入口。</li></ol><p class="tiny">当前 32 单元提供 A1–B2 分级练习的起点；扩展词库已收录 6,500 个去重条目；听力、口语评估与词条人工校对仍待完善。<a href="https://github.com/Leclerccc777/spanish/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noopener noreferrer">词库署名与许可 ↗</a></p></section>`;
  }
  function progressPage() {
    const s=L.summary(state); const errors=L.mistakes(state); const wrong=L.wrongWords(state);
    const calendar=Array.from({length:14},(_,i)=> { const key=L.addDays(s.today,i-13); return `<div class="calendar-day ${L.isCheckedIn(state.days[key])?'done':''} ${key===s.today?'today':''}" aria-label="${key} ${L.isCheckedIn(state.days[key])?'已打卡':'未打卡'}">${key.slice(5)}</div>`; }).join('');
    return heading('MI CAMINO','每一步，都算数。','真正的进步，是今天比昨天多懂一点。') + `<div class="stats">${stat(s.streak,'连续打卡','flame','天')}${stat(s.checkins,'累计打卡','calendar','天')}${stat(s.learned,'已学习词汇','book',`/ ${C.lexicon.catalogue.length}`)}${stat(s.grammarPassed,'语法已达标','layers',`/ ${C.lessons.length}`)}</div><div class="progress-columns"><section><div class="card"><div class="card-head"><h2>最近 14 天</h2>${pill('学习日历')}</div><div class="calendar">${calendar}</div><p class="tiny">深绿色：当日完成词汇目标 + 至少一次达标语法练习。按设备本地日期记录。</p></div><div class="card"><div class="card-head"><h2>词汇积累</h2><span>${s.learned} / ${C.lexicon.catalogue.length}</span></div>${meter(percent(s.learned,C.lexicon.catalogue.length))}<p class="tiny">有复习记录即“已学习”，不等于长期掌握。到期词会优先安排复习。</p></div></section><section><div class="card"><h2>每天，给自己一点时间</h2><p class="tiny">设置每天词汇量，再加 1 次达标语法练习。</p><div class="goal-options">${[3,5,10].map(g=>btn(`${g} 个词`,'goal',`data-goal="${g}"`,state.goal===g?'':'secondary')).join('')}</div><p class="tiny">当天首次学习时固定目标。今天开始学习后，调整目标对下一天生效。</p></div><div class="card"><h2>留住你的学习记录</h2><p class="tiny">数据只存在当前浏览器中，不与微信自动同步。清理浏览器或换设备前，请导出备份。</p><div class="backup-actions">${btn('导出备份','export','','small secondary')}${btn('导入备份','import','','small ghost')}</div></div></section></div><div class="section-head"><h2>词汇错词本</h2><span class="tiny">${wrong.length} 个待订正</span></div><div class="card">${wrong.length?wrong.map(w=>`<p><strong lang="es">${esc(w.spanish)}</strong> · ${esc(w.meaning)}<br><span class="tiny">你的答案：${esc(w.answer)}</span></p>`).join('')+btn('集中重练错词 →','word-quiz','data-wrong="1"','secondary'):'<p class="tiny">词汇测验中答错的词会保存在这里。</p>'}</div><div class="section-head"><h2>错题回顾</h2><span class="tiny">${errors.length} 题待订正</span></div>${errors.length ? errors.map(q=>`<article class="card mistake"><h3>${esc(q.prompt)}</h3><p>你的答案：${esc(q.options[q.selected])}</p><p>正确答案：${esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p>${btn('重练本课 →','lesson',`data-id="${q.lessonId}"`,'small secondary')}</article>`).join('') : '<div class="card empty">暂无待订正错题。练习中的错题会自动出现在这里。</div>'}`;
  }
  function startSession(packId = '') { session={packId,items:packId?L.packQueue(state,packId):L.queue(state),index:0,revealed:false,retries:new Set(),day:L.dateKey()}; }
  function openWordQuiz(wrongOnly = false, packId = '') {
    wordQuiz = { phase: 'setup', mode: 'meaning', wrongOnly, packId };
    navigate('word-quiz');
  }
  function beginWordQuiz() {
    if (!wordQuiz) wordQuiz = { mode: 'meaning', wrongOnly: false };
    const items = wordQuiz.wrongOnly ? L.wrongWords(state).filter(w => L.isWordUnlocked(state, w.id)) : wordQuiz.packId ? L.packQueue(state,wordQuiz.packId) : L.queue(state);
    Object.assign(wordQuiz, { phase: items.length ? 'quiz' : 'empty', items, originalCount: items.length, index: 0, firstCorrect: 0, retries: new Set(), answered: new Set(), input: '', selected:null, result: null, day: L.dateKey() });
    if (items.length) wordQuiz.question = L.wordQuestion(items[0].id, wordQuiz.mode);
    render();
  }
  function submitWordAnswer(answer) {
    if (!wordQuiz || wordQuiz.phase !== 'quiz' || wordQuiz.result) return;
    if (wordQuiz.day !== L.dateKey()) { wordQuiz.phase = 'setup'; render(); return notify('新的一天到了，请重新开始词汇测验。'); }
    if (!answer.trim()) return notify('请先填写答案。');
    const word = wordQuiz.items[wordQuiz.index];
    const result = commit(draft => L.practiceWord(draft, word.id, answer, wordQuiz.mode, wordQuiz.day));
    if (!result) return;
    if (!wordQuiz.answered.has(word.id)) { if (result.correct) wordQuiz.firstCorrect++; wordQuiz.answered.add(word.id); }
    if (!result.correct && !wordQuiz.retries.has(word.id)) { wordQuiz.items.push(word); wordQuiz.retries.add(word.id); }
    wordQuiz.result = result; wordQuiz.selected = answer; render();
  }
  function wordQuizPage() {
    if (!wordQuiz) wordQuiz = { phase: 'setup', mode: 'meaning', wrongOnly: false };
    const back = btn(`${icon('back')} 回到词汇`, 'words', '', 'back');
    const head = heading('PONTE A PRUEBA', '真的记住了吗？', wordQuiz.wrongOnly ? '集中重练待订正错词。' : '词义选择与拼写，让记忆不只停留在“眼熟”。');
    if (wordQuiz.phase === 'setup') return `<section class="reading">${back}${head}<div class="card"><h2>选择一种练法</h2><div class="practice-modes">${btn('看西语，选中文词义','word-mode','data-mode="meaning"',wordQuiz.mode==='meaning'?'':'secondary')}${btn('看中文，拼西语','word-mode','data-mode="spelling"',wordQuiz.mode==='spelling'?'':'secondary')}</div><p class="tiny">答对词计入每日词汇目标；答错不计数，错词本轮再出现一次。首答正确率不会因重练提高。</p>${btn('开始词汇测验 →','begin-word-quiz')}</div></section>`;
    if (wordQuiz.phase === 'empty') return `<section class="reading">${back}${head}<div class="card empty">${wordQuiz.wrongOnly?'暂无待订正错词。':'当前词包不存在或尚未解锁。'}</div></section>`;
    if (wordQuiz.phase === 'result') return `<section class="reading">${back}${head}<div class="card result-card"><div class="result-score">${Math.round(wordQuiz.firstCorrect/wordQuiz.originalCount*100)}%</div><h2>首答正确率</h2><p>首次答对 ${wordQuiz.firstCorrect} / ${wordQuiz.originalCount} 个词。未订正的词仍保留在错词本。</p><p>${L.summary(state).checkedIn?'✓ 今天已自动打卡。':'答对词汇已计入今日目标，接下来继续语法练习。'}</p><div class="actions">${btn('回到今日','home')}${btn('再练一次','word-again','','secondary')}</div></div></section>`;
    const q=wordQuiz.question, r=wordQuiz.result;
    return `<section class="session">${back}<div class="session-head"><span class="eyebrow">${wordQuiz.mode==='meaning'?'选择词义':'拼写练习'}</span>${pill(`${wordQuiz.index+1} / ${wordQuiz.items.length}`)}</div>${meter(percent(wordQuiz.index,wordQuiz.items.length))}<div class="card flashcard"><div class="flash-word" ${wordQuiz.mode==='meaning'?'lang="es"':''}>${esc(q.prompt)}</div>${wordQuiz.mode==='meaning'?q.options.map((option,i)=>`<button class="choice ${r&&option===r.answer?'correct':wordQuiz.selected===option?'wrong':''}" data-action="word-answer" data-index="${i}" ${r?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span>${esc(option)}</button>`).join(''):`<p class="tiny">${esc(q.hint)}</p><label class="sr-only" for="spelling-answer">输入本词卡所学的西班牙语词形</label><input id="spelling-answer" class="search-input spelling-input" placeholder="输入本词卡所学的西班牙语词形" value="${esc(wordQuiz.input)}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="200" ${r?'disabled':''}/><div class="accent-buttons">${['á','é','í','ó','ú','ü','ñ'].map(char=>`<button data-action="word-accent" data-char="${char}" ${r?'disabled':''} aria-label="添加 ${char}">${char}</button>`).join('')}</div>${r?'':btn('检查答案','word-submit')}<p class="tiny">有男女两种词形时任写一种。重音和 ñ 需正确；不把同义词当作本词卡答案。</p>`}${r?`<div class="feedback"><strong>${r.correct?'✓ 答对了':r.accentHint?'词形接近，注意重音符号或 ñ':'再记一遍这个词'}</strong><p>正确答案：${esc(r.answer)}</p><p>${esc(r.explanation)}</p></div>`:''}</div>${r?btn(wordQuiz.index+1===wordQuiz.items.length?'查看结果':'下一词 →','word-next'):''}</section>`;
  }
  function studyPage() {
    if (!session) startSession();
    const w=session.items[session.index];
    if (!w) { const s=L.summary(state); return `<section class="session card result-card"><div class="success-icon">${icon('check')}</div><div class="result-score">¡Muy bien!</div><h2>这一轮结束了。</h2><p>${!session.items.length?'当前词包不存在或尚未解锁。':s.checkedIn ? '今天的目标已完成，已自动打卡。' : '继续完成语法练习，让今天的词汇用起来。'}</p><div class="actions">${btn('去练语法 →','current-lesson')}${btn('再学一轮','study',`data-pack="${esc(session.packId)}"`,'secondary')}${btn('回到今日','home','','ghost')}</div></section>`; }
    return `<section class="session">${btn(`${icon('back')} 回到今日`,'home','','back')}<div class="session-head"><span class="eyebrow">UN POCO CADA DÍA</span>${pill(`词卡 ${session.index+1} / ${session.items.length}`)}</div>${meter(percent(session.index,session.items.length))}<article class="card flashcard"><div class="tiny">先回忆意思，再查看答案。</div><div class="word-top"><div class="flash-word" lang="es">${esc(w.spanish)}</div>${'speechSynthesis' in window ? `<button class="speech" data-action="speak" aria-label="用浏览器语音朗读${esc(w.spanish)}">${icon('volume')}</button>` : ''}</div><div class="word-pos">${esc(w.pos)}</div>${session.revealed ? `<div class="flash-answer"><div class="meaning">${esc(w.meaning)}</div>${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><div class="translation">${w.bank?'英文原义 · 中文为辅助释义，待人工校对':esc(w.translation)}</div>${w.note!=='通用'?`<div class="regional">${esc(w.note)}</div>`:''}</div>` : btn('查看释义与例句','reveal','','secondary reveal')}</article>${session.revealed ? `<div class="ratings">${btn('忘记了','rate','data-rating="again"','danger')}${btn('想起来了','rate','data-rating="remember"','secondary')}${btn('很熟悉','rate','data-rating="easy"','lime')}</div>` : ''}<p class="helper">忘记的词会在本轮再出现一次，并保留为今日待复习。<br>语音使用设备合成音，非真人录音；是否有西语语音取决于浏览器。</p></section>`;
  }
  function lessonPage(id) {
    const lesson=C.lessons.find(l=>l.id===id);
    if (!lesson || !L.isUnlocked(state,lesson.unitId)) return `<div class="card empty">课程不存在或尚未解锁。先学习前一单元至少 6 个词并通过语法练习。<p><a href="#grammar">返回课程路线 →</a></p></div>`;
    const unit=C.units.find(u=>u.id===lesson.unitId);
    const title=`${btn(`${icon('back')} 返回语法路线`,'roadmap','','back')}<div class="eyebrow">UNIDAD ${unit.number} · ${esc(unit.topic)}</div><h1>${esc(lesson.title)}</h1><p class="subtitle">${esc(lesson.summary)}</p>${lesson.extension ? `<div class="notice" style="margin-top:20px">${esc(lesson.extension)}</div>` : ''}`;
    if (!quiz || quiz.id!==id) return `<section class="reading">${title}<div class="section-head"><h2>先理解</h2>${pill('中文讲解')}</div><div class="card"><ol class="rules">${lesson.rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div><div class="section-head"><h2>在句子里练习</h2></div>${lesson.examples.map(([es,zh])=>`<div class="card"><p class="example" lang="es">${esc(es)}</p><div class="translation">${esc(zh)}</div></div>`).join('')}<div class="card"><h3>本课参考依据</h3>${lesson.references.map(r => { const source=C.sources.find(s=>s.id===r.sourceId); return `<p class="tiny"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a><br>${esc(r.section)}</p>`; }).join('')}</div><p class="tiny">原创讲解与例句 · 主要语法依据已核对 · 非官方教材</p><div class="actions">${btn('开始 4 道练习 →','begin-quiz',`data-id="${id}"`)}</div></section>`;
    if (quiz.result) return `<section class="reading">${title}<div class="card result-card"><div class="success-icon">${icon(quiz.result.passed?'check':'refresh')}</div><div class="result-score">${quiz.result.score}%</div><h2>${quiz.result.passed?'¡Muy bien! 本课已达标':'再练一次，会更清楚'}</h2><p>答对 ${quiz.result.correct} / ${quiz.result.total} 题。${quiz.result.passed?'已计入今天的语法目标。':'本次未计入打卡，错题已收进错题本。'}</p>${L.summary(state).checkedIn ? '<p>✓ 今日目标完成，已自动打卡。</p>' : ''}<div class="actions">${btn('回到今日','home')}${btn('重新练习','begin-quiz',`data-id="${id}"`,'secondary')}</div></div></section>`;
    const q=lesson.questions[quiz.index]; const selected=quiz.answers[quiz.index];
    return `<section class="reading">${title}<div class="section-head"><h2>练习 ${quiz.index+1} / ${lesson.questions.length}</h2>${pill('达标线 75%')}</div>${meter(percent(quiz.index,lesson.questions.length))}<h2 class="question-title">${esc(q.prompt)}</h2>${q.options.map((o,i)=>`<button class="choice ${selected!==undefined&&i===q.answer?'correct':selected===i?'wrong':''}" data-action="answer" data-index="${i}" ${selected!==undefined?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}${selected!==undefined?`<div class="feedback"><strong>${selected===q.answer?'✓ 答对了':'再看一下这里'}</strong><p>${esc(q.explanation)}</p></div><div class="actions">${btn(quiz.index+1===lesson.questions.length?'查看结果':'下一题 →','next-question')}</div>`:''}</section>`;
  }
  function render() {
    const page=route(); let content;
    if (page==='study') content=studyPage();
    else if (page==='word-quiz') content=wordQuizPage();
    else if(page.startsWith('noun/')) content=nounPage(page.slice(5));
    else if(page.startsWith('foundation/')) content=foundationPage(page.slice(11));
    else if(page.startsWith('expression/')) content=expressionPage(page.slice(11));
    else if(page.startsWith('lesson/')) content=lessonPage(page.slice(7));
    else content=({today:todayPage,words:wordsPage,bank:bankPage,nouns:nounsPage,foundations:foundationsPage,year:yearPage,grammar:grammarPage,library:libraryPage,progress:progressPage}[page] || todayPage)();
    root.innerHTML=shell(content,page);
  }
  function openLesson(id) {
    const lesson=C.lessons.find(l=>l.id===id);
    if (!lesson || !L.isUnlocked(state,lesson.unitId)) return notify('先学习前一单元至少 6 个词，并通过语法练习。');
    quiz=null; navigate(`lesson/${id}`);
  }
  function startQuiz(id) { const lesson=C.lessons.find(l=>l.id===id); if(!lesson||!L.isUnlocked(state,lesson.unitId))return; quiz={id,index:0,answers:[],day:L.dateKey(),result:null}; render(); }
  function speakText(text) {
    if(!('speechSynthesis' in window))return;const voice=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith('es'));if(!voice)return notify('设备暂无西班牙语音色，可在系统设置中安装西语语音包。');
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.8;window.speechSynthesis.speak(utterance);
  }
  function speak() {
    if(!session || !session.items[session.index] || !('speechSynthesis' in window))return;
    const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.startsWith('es'));
    if(!voices.length)return notify('设备暂无西班牙语合成语音，可在系统设置中安装西语语音包。');
    window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(session.items[session.index].spanish); utterance.lang=voices[0].lang; utterance.voice=voices[0]; utterance.rate=.8; window.speechSynthesis.speak(utterance);
  }
  function exportBackup() {
    const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
    const link=document.createElement('a'); link.href=url; link.download=`hola-${L.dateKey()}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function importBackup() {
    const input=document.createElement('input'); input.type='file'; input.accept='.json,application/json';
    input.onchange=async()=> {
      try {
        if(!input.files[0])return;
        if(input.files[0].size>8000000)throw new Error('备份文件过大');
        const raw=JSON.parse(await input.files[0].text());
        if(raw.version!==1||!raw.reviews||!raw.days||!raw.lessons)throw new Error('不是受支持的 Hola 备份');
        const imported=L.restore(raw);
        if(!window.confirm(`导入 ${Object.keys(imported.reviews).length} 个词汇的记录将替换当前浏览器进度。建议先导出当前备份。继续导入？`))return;
        localStorage.setItem(KEY,JSON.stringify(imported)); state=imported; session=null; quiz=null; render(); notify('学习记录已导入。');
      }catch(error){notify(`导入失败：${error.message}`);}
    }; input.click();
  }
  root.addEventListener('click',event=> {
    const element=event.target.closest('[data-action]'); if(!element||element.disabled)return;
    const action=element.dataset.action;
    if(action==='study'){startSession(element.dataset.pack||'');navigate('study');}
    else if(action==='nouns'){nounQuiz=null;navigate('nouns');}
    else if(action==='noun'){nounQuiz=null;navigate(`noun/${element.dataset.id}`);}
    else if(action==='noun-begin'){if(!L.nounLessons.some(n=>n.id===element.dataset.id))return;nounQuiz={id:element.dataset.id,index:0,answers:[],input:'',feedback:null,result:null};render();}
    else if(action==='noun-answer')submitNounAnswer(element.dataset.answer);
    else if(action==='noun-submit')submitNounAnswer(nounQuiz&&nounQuiz.input);
    else if(action==='noun-accent'){
      const input=document.getElementById('noun-answer');if(!input||!nounQuiz||nounQuiz.feedback)return;
      const start=input.selectionStart,end=input.selectionEnd;if(input.value.length-(end-start)>=200)return;
      nounQuiz.input=input.value.slice(0,start)+element.dataset.char+input.value.slice(end);render();
      const updated=document.getElementById('noun-answer');updated.focus();updated.setSelectionRange(start+1,start+1);
    }
    else if(action==='noun-next'){
      if(!nounQuiz||!nounQuiz.feedback||nounQuiz.result)return;
      if(nounQuiz.index===2){const r=commit(s=>L.gradeNoun(s,nounQuiz.id,nounQuiz.answers));if(!r)return;nounQuiz.result=r;}
      else{nounQuiz.index++;nounQuiz.input='';nounQuiz.feedback=null;}render();
    }
    else if(action==='foundations'){foundationQuiz=null;navigate('foundations');}
    else if(action==='foundation'){foundationQuiz=null;navigate(`foundation/${element.dataset.id}`);}
    else if(action==='foundation-begin'){foundationQuiz={id:element.dataset.id,index:0,answers:[],result:null};render();}
    else if(action==='foundation-answer'){if(!foundationQuiz||foundationQuiz.answers[foundationQuiz.index]!==undefined)return;foundationQuiz.answers[foundationQuiz.index]=Number(element.dataset.index);render();}
    else if(action==='foundation-next'){if(!foundationQuiz||foundationQuiz.answers[foundationQuiz.index]===undefined)return;const f=L.foundations.find(f=>f.id===foundationQuiz.id);if(foundationQuiz.index+1===f.questions.length){const r=commit(s=>L.gradeFoundation(s,f.id,foundationQuiz.answers));if(!r)return;foundationQuiz.result=r;}else foundationQuiz.index++;render();}
    else if(action==='foundation-speak')speakText(element.dataset.text);
    else if(action==='year'){yearWeek=0;navigate('year');}
    else if(action==='year-start'){if(commit(s=>L.startJourney(s,L.dateKey())))render();}
    else if(action==='year-current'){yearWeek=0;render();}
    else if(action==='library')navigate('library');
    else if(action==='bank')navigate('bank');
    else if(action==='bank-level'){bankLevel=element.dataset.level;bankPageIndex=0;packPageIndex=0;render();}
    else if(action==='bank-page'){bankPageIndex+=Number(element.dataset.step);render();}
    else if(action==='pack-page'){packPageIndex+=Number(element.dataset.step);render();}
    else if(action==='track'){if(commit(draft=>L.setTrack(draft,element.dataset.track))){render();notify('每日词汇范围已保存。');}}
    else if(action==='words')navigate('words');
    else if(action==='word-quiz')openWordQuiz(element.dataset.wrong==='1',element.dataset.pack||'');
    else if(action==='word-mode'){wordQuiz.mode=element.dataset.mode;render();}
    else if(action==='begin-word-quiz')beginWordQuiz();
    else if(action==='word-answer')submitWordAnswer(wordQuiz.question.options[Number(element.dataset.index)]);
    else if(action==='word-submit')submitWordAnswer(wordQuiz.input);
    else if(action==='word-accent'){
      const input=document.getElementById('spelling-answer'); if(!input||wordQuiz.result)return;
      const start=input.selectionStart, end=input.selectionEnd;
      wordQuiz.input=input.value.slice(0,start)+element.dataset.char+input.value.slice(end); render();
      const updated=document.getElementById('spelling-answer');updated.focus();updated.setSelectionRange(start+1,start+1);
    }
    else if(action==='word-again'){wordQuiz.phase='setup';render();}
    else if(action==='word-next'){
      if(!wordQuiz||!wordQuiz.result)return;
      wordQuiz.index++;wordQuiz.result=null;wordQuiz.selected=null;wordQuiz.input='';
      if(wordQuiz.index>=wordQuiz.items.length)wordQuiz.phase='result';
      else wordQuiz.question=L.wordQuestion(wordQuiz.items[wordQuiz.index].id,wordQuiz.mode);
      render();
    }
    else if(action==='home')navigate('today');
    else if(action==='roadmap')navigate('grammar');
    else if(action==='grammar-level'){grammarLevel=element.dataset.level;render();}
    else if(action==='expression'){expressionEditor=null;navigate(`expression/${element.dataset.id}`);}
    else if(action==='expression-save'||action==='expression-submit'){
      if(!expressionEditor||!L.expressionUnlocked(state,expressionEditor.id))return;
      const submit=action==='expression-submit';
      if(submit&&!expressionEditor.text.trim())return notify('请先写下你的表达。');
      const result=commit(draft=>L.saveExpression(draft,expressionEditor.id,expressionEditor.text,submit));
      if(!result)return;
      if(submit){expressionEditor.result=result;expressionEditor.showModel=false;render();}
      else document.getElementById('expression-status').textContent='草稿已保存。';
    }
    else if(action==='expression-model'){expressionEditor.showModel=!expressionEditor.showModel;render();}
    else if(action==='expression-accent'){
      const input=document.getElementById('expression-text');if(!input||input.disabled)return;
      const start=input.selectionStart,end=input.selectionEnd;
      if(input.value.length-(end-start)>=6000)return;
      expressionEditor.text=input.value.slice(0,start)+element.dataset.char+input.value.slice(end);expressionEditor.result=null;expressionEditor.showModel=false;render();
      const updated=document.getElementById('expression-text');updated.focus();updated.setSelectionRange(start+1,start+1);
    }
    else if(action==='lesson')openLesson(element.dataset.id);
    else if(action==='current-lesson')openLesson(C.lessons.find(l=>l.unitId===L.currentUnit(state).id).id);
    else if(action==='reveal'){session.revealed=true;render();}
    else if(action==='rate'){
      if(!session||!session.revealed)return;
      if(session.day!==L.dateKey()){startSession(session.packId);render();return notify('新的一天到了，已刷新学习计划。');}
      const w=session.items[session.index]; const rating=element.dataset.rating;
      if(!commit(draft=>L.review(draft,w.id,rating,session.day)))return;
      if(rating==='again'&&!session.retries.has(w.id)){session.items.push(w);session.retries.add(w.id);}
      session.index++;session.revealed=false;render();
    }
    else if(action==='begin-quiz')startQuiz(element.dataset.id);
    else if(action==='answer'){if(!quiz||quiz.answers[quiz.index]!==undefined)return;quiz.answers[quiz.index]=Number(element.dataset.index);render();}
    else if(action==='next-question'){
      if(!quiz||quiz.answers[quiz.index]===undefined)return;
      if(quiz.day!==L.dateKey()){startQuiz(quiz.id);return notify('跨日练习，请重新开始本课。');}
      const lesson=C.lessons.find(l=>l.id===quiz.id);
      if(quiz.index+1===lesson.questions.length){const result=commit(draft=>L.gradeLesson(draft,quiz.id,quiz.answers,quiz.day));if(!result)return;quiz.result=result;}
      else quiz.index++;
      render();
    }
    else if(action==='goal'){if(commit(draft=>L.setGoal(draft,Number(element.dataset.goal)))){render();notify('目标已保存；今日已开始的学习目标不变。');}}
    else if(action==='speak')speak();
    else if(action==='export')exportBackup();
    else if(action==='import')importBackup();
  });
  root.addEventListener('input',event=> { if(event.target.id==='noun-answer'&&nounQuiz&&!nounQuiz.feedback)nounQuiz.input=event.target.value; if(event.target.id==='expression-text'&&expressionEditor){expressionEditor.text=event.target.value;expressionEditor.result=null;expressionEditor.showModel=false;const feedback=document.querySelector('.expression-feedback');if(feedback)feedback.remove();document.getElementById('expression-status').textContent='修改尚未保存。';} if(event.target.id==='spelling-answer' && wordQuiz) wordQuiz.input=event.target.value; if(event.target.id==='bank-search'){const position=event.target.selectionStart;bankQuery=event.target.value;bankPageIndex=0;render();const input=document.getElementById('bank-search');input.focus();input.setSelectionRange(position,position);} if(event.target.id==='word-search'){const position=event.target.selectionStart;query=event.target.value;render();const input=document.getElementById('word-search');input.focus();input.setSelectionRange(position,position);} });
  root.addEventListener('keydown',event=>{if(event.target.id==='noun-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitNounAnswer(nounQuiz&&nounQuiz.input);}if(event.target.id==='spelling-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitWordAnswer(wordQuiz.input);}});
  root.addEventListener('change',event=> { if(event.target.id==='year-week'){yearWeek=Number(event.target.value);render();} if(event.target.dataset.skill){const checked=event.target.checked;if(!commit(s=>L.setWeekSkill(s,yearWeek,event.target.dataset.skill,checked,L.dateKey())))event.target.checked=!checked;else render();} if(event.target.id==='level-filter'){levelFilter=event.target.value;unitFilter='';render();} if(event.target.id==='unit-filter'){unitFilter=event.target.value;render();} if(event.target.id==='source-filter'){sourceFilter=event.target.value;render();} });
  window.addEventListener('hashchange',()=>{if(!route().startsWith('noun/'))nounQuiz=null;if(!route().startsWith('foundation/'))foundationQuiz=null;if(!route().startsWith('expression/'))expressionEditor=null;if(route()!=='study')session=null;if(route()!=='word-quiz')wordQuiz=null;if(!route().startsWith('lesson/'))quiz=null;render();window.scrollTo(0,0);});
  window.addEventListener('storage',event=>{if(event.key===KEY){try{state=L.restore(JSON.parse(event.newValue));render();}catch{notify('另一个窗口的学习记录无法读取。');}}});
  render();
  if(storageFailed)notify('原学习记录未能读取。旧记录尚未覆盖，请先检查浏览器存储。');
})();
