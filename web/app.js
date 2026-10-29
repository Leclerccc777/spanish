/* global HolaLearning, HolaExerciseUI */
(() => {
  'use strict';
  const L = window.HolaLearning;
  const C = L.course;
  const UI = window.HolaExerciseUI;
  const KEY = 'hola-learning-v1';
  const account = window.HolaAccount.createAccountClient({
    api: location.protocol === 'file:' ? '' : window.HolaAccountApi,
    get: key => JSON.parse(localStorage.getItem(key) || 'null'),
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
    remove: key => localStorage.removeItem(key),
    changed: status => { document.querySelectorAll('[data-account-status]').forEach(el => { el.textContent = status.message; }); },
    request: async (url, method, body, token) => {
      const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal, credentials: 'omit' });
        const result = await response.json();
        if (!response.ok) throw Object.assign(new Error(result.error || '账号请求失败'), { status: response.status });
        return result;
      } catch (error) { if (error.status) throw error; throw new Error('网络暂不可用，本机记录仍保留，可稍后同步'); }
      finally { clearTimeout(timer); }
    }
  });
  let syncTimer;
  function queueSync() { clearTimeout(syncTimer); syncTimer = setTimeout(() => account.sync().catch(() => {}), 800); }

  const root = document.getElementById('app');
  let storageFailed = false;
  let state;
  function readStored(text) {
    const raw = text === undefined ? account.read() : JSON.parse(text || 'null');
    if (raw !== null && raw.version !== L.emptyState().version) throw new Error('Unsupported record version');
    return L.restore(raw);
  }
  try { state = readStored(); }
  catch { state = L.emptyState(); storageFailed = true; }
  let levelFilter = '', grammarLevel = 'A1', expressionEditor = null;
  const wordOptions = new Map();
  function nextWordQuestion(id,mode){const q=L.wordQuestion(id,mode,Math.random,wordOptions.get(id)||[]);if(mode==='meaning')wordOptions.set(id,q.options);return q;}
  let query = '', unitFilter = '', sourceFilter = '', session = null, quiz = null, wordQuiz = null;
  let bankLevel='A1', bankQuery='', bankPageIndex=0, packPageIndex=0;
  let foundationQuiz=null, yearWeek=0;
  let nounQuiz=null;
  let drillLevel='A1', drillQuiz=null, drillEditor=null, drillReview=null;
  let monthDay=0;
  let toastTimer;
  const esc = UI.escape;
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
  const btn = UI.button;
  const pill = (label, warm = false) => `<span class="pill${warm ? ' warm' : ''}">${esc(label)}</span>`;
  const percent = (value, total) => Math.min(100, Math.round(value / total * 100));
  const meter = value => `<div class="meter"><span style="width:${value}%"></span></div>`;
  function notify(message) { const element = document.getElementById('toast'); element.textContent = message; element.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('show'), 4000); }
  function commit(action) {
    if (storageFailed) { reloadRecords(); return null; }
    let draft;
    try { draft = readStored(); } catch { storageFailed = true; notify('记录暂未读取，旧记录不会被覆盖。'); return null; }
    const result = action(draft);
    try { account.write(draft); }
    catch { notify('学习记录未保存，请检查浏览器存储权限或空间后重试。'); return null; }
    state = draft;
    queueSync();
    return result;
  }
  function reloadRecords() {
    try { state = readStored(); storageFailed = false; render(); notify('原记录已读取，请重新确认这次操作。'); return true; }
    catch { storageFailed = true; notify('记录暂未读取，旧记录不会被覆盖。可重读或导入兼容备份。'); return false; }
  }
  const route = () => location.hash.slice(1) || 'today';
  function navigate(to) { if (route() === to) render(); else location.hash = to; }
  const heading = (overline, title, subtitle, trailing = '') => `<div class="page-head"><div><div class="eyebrow">${esc(overline)}</div><h1>${esc(title)}</h1><p class="subtitle">${esc(subtitle)}</p></div>${trailing}</div>`;
  function shell(body, active) {
    const items = [['today','home','今日学习'],['words','book','词汇练习'],['grammar','layers','语法路线'],['library','library','资料库'],['progress','chart','学习进度']];
    const current = active === 'account' ? 'progress' : ['study', 'word-quiz', 'bank', 'nouns'].includes(active) || active.startsWith('noun/') ? 'words' : (active.startsWith('lesson/') || active.startsWith('expression/') || active.startsWith('foundation/') || active==='foundations' || active==='year' || active==='first-month' || active==='drills' || active==='drill-review' || active.startsWith('drill/')) ? 'grammar' : active;
    const s = L.summary(state), a = account.status();
    return `<div class="shell"><aside class="sidebar"><a href="#today" class="brand" aria-label="Hola 首页"><span class="brand-mark">h</span><span><span class="brand-word">hola<span style="color:#1cb0f6">.</span></span><span class="brand-sub">每天一点西语</span></span></a><nav class="nav" aria-label="主导航">${items.map(([key,i,title]) => `<a href="#${key}" class="${current === key ? 'active' : ''}" ${current === key ? 'aria-current="page"' : ''}>${icon(i)}<span>${title}</span></a>`).join('')}</nav><div class="sidebar-bottom"><div class="mini-note"><strong>Un poco cada día.</strong>每天一点点，<br>让语言成为你的新日常。<div style="margin-top:13px">${pill('A1 → B2 · 通用西语')}</div></div><div class="side-footer">HECHO CON CALMA · 慢慢学</div></div></aside><main class="main"><header class="topbar"><span class="crumb">我的西语旅程 / ${esc(active === 'account' ? '账号详情' : (items.find(x => x[0] === current) || items[0])[2])}</span><div class="top-actions"><span class="level">${`${s.unit.levelCode} · ${s.checkedIn ? '✓ 今日已打卡' : '分级学习'}`}</span><div class="account-avatar-wrap"><button type="button" id="account-trigger" class="avatar account-trigger" data-action="account-toggle" aria-label="${a.user ? '账号菜单：' + esc(a.user.username) : a.broken ? '账号菜单' : '登录或注册账号'}" aria-haspopup="${a.user || a.broken ? 'menu' : 'dialog'}" aria-expanded="false" aria-controls="${a.user || a.broken ? 'account-menu' : 'account-dialog'}">${esc(a.user ? a.user.username.slice(0,1).toUpperCase() : '学')}</button><div id="account-menu" class="account-dropdown" role="menu" aria-labelledby="account-trigger" hidden><p class="account-menu-name">${esc(a.user?.username || '账号记录需要恢复')}</p><button type="button" role="menuitem" data-action="account-details">账号详情</button><button type="button" role="menuitem" data-action="account-logout">退出登录</button></div></div></div></header><div class="content">${body}<footer class="footer-note"><span>以 Cervantes / CEFR / RAE 为参考方向 · 参考页面已核验</span><span>${window.HolaAndroid ? '离线学习 · 本机保存 · 记得导出备份' : '本机保存 · 可选账号同步'}</span></footer></div></main></div>`;
  }
  function stat(value, label, i, unit = '') { return `<div class="stat"><div class="stat-icon">${icon(i)}</div><div><div class="stat-value">${value}<small>${esc(unit)}</small></div><div class="stat-label">${esc(label)}</div></div></div>`; }
  function beginnerPath() {
    const rows = L.foundationProgress(state), next = rows.find(f => !f.passed);
    return `<section class="card beginner-start" aria-label="建议学习路径"><div class="eyebrow">你的下一小步 · ${rows.filter(f=>f.passed).length} / ${rows.length} 节规则练习达标</div><h2>${next ? esc(next.title) : '把学过的词，说成自己的句子'}</h2><p>${next ? esc(next.goal) : '先复习到期词，再练本单元规则，最后完成一个表达任务。'}</p><ol class="learning-rhythm"><li><strong>听与模仿</strong><span>听一句，慢速跟读，再正常读。</span></li><li><strong>理解与回忆</strong><span>一次学一个规则；每天先复习，再加 3–5 个新词。</span></li><li><strong>开口与迁移</strong><span>遮住例句，换成自己的信息说一句；明天再回忆。</span></li></ol><div class="actions">${next ? btn('开始这节微课 →','foundation',`data-id="${next.id}"`) : btn('复习今天的词汇 →','study')}${btn('查看四步入门','foundations','','secondary')}</div><p class="tiny">每天约 10–15 分钟，按掌握情况重复。打卡是练习记录，不是学习的先决条件。</p></section>`;
  }
  function todayPage() {
    const s = L.summary(state), lesson = C.lessons.find(l => l.unitId === s.unit.id);
    const task = C.tasks.find(t => t.unitId === s.unit.id);
    return heading('UN POCO CADA DÍA', '今天，学会说一点。', '从听懂一句，到自己说一句。') + beginnerPath() +
      `<section class="card daily-checkin" aria-label="今日打卡"><div class="task-header"><h2>日常巩固</h2>${pill(s.checkedIn ? '今日已打卡 ✓' : '按自己的节奏')}</div><div class="daily-goals"><section><h3>1 · 复习与词汇</h3><p>到期复习 ${s.due} 个 · 今日 ${s.day.words.length} / ${s.day.goal} 个词</p>${meter(s.wordPercent)}<p class="tiny">先回忆意思再翻卡；忘记了就如实标记。</p>${btn('开始词汇练习','study')}</section><section><h3>2 · 理解与表达</h3><p>${esc(lesson.title)}</p>${meter(s.day.grammar.length?100:0)}<p class="tiny">规则题答对至少 3 / 4，再用自己的信息造句。</p>${btn('学习本课','lesson',`data-id="${lesson.id}"`,'secondary')}</section></div><div class="actions">${btn('用本课词汇说一句','expression',`data-id="${task.id}"`,'secondary')}<a class="text-link" href="#grammar">全部课程 →</a></div><p class="checkin-note tiny">${s.checkedIn?'今日两项练习已完成，记录已保存。':'词汇目标和语法达标后自动打卡。入门微课单独记录，不必为打卡跳过基础。'}</p></section>
      <section class="stats" aria-label="学习统计">${stat(s.streak,'连续打卡','flame','天')}${stat(s.learned,'已学习词汇','book','词')}${stat(s.due,'到期复习','refresh','词')}${stat(s.grammarPassed,'语法已达标','layers','课')}</section>
      <details class="card learning-more"><summary>更多练习与学习计划</summary><p class="tiny">先完成建议的小步骤，再按需要补充。词库规模和计划日期不代表语言等级。</p>${practiceAdvice()}<div class="actions">${btn('前四周每日任务','month','','secondary')}${btn('一年学习计划','year','','secondary')}${btn('名词搭配练习','nouns','','secondary')}${btn('分级综合练习','drills','','secondary')}${btn('查阅扩展词库','bank','','secondary')}</div></details>`;
  }
  function practiceAdvice() {
    const p=L.practiceSummary(state);
    const title=p.wrong?`先订正 ${p.wrong} 个错项`:p.next?`${p.next.level} · ${p.next.title}`:'回顾已经练过的内容';
    return `<section class="card beginner-start practice-advice"><h2>补充练习 · 下一小步</h2><p>${esc(title)}</p><p class="tiny">规则题达标 ${p.passed} / ${p.total} 包 · 表达草稿 ${p.drafts} 份。各自记录，不认定语言等级。</p>${btn(p.wrong?'去集中订正 →':p.next?'继续建议练习 →':'回顾练习 →','practice-continue')}</section>`;
  }
  function practiceProgressPanel() {
    const p=L.practiceSummary(state);
    return `<section class="practice-progress"><div class="section-head"><h2>补充练习的进度</h2></div><div class="card"><p>规则题达标 ${p.passed} / ${p.total} 包 · 待订正 ${p.wrong} 项 · 已保存表达 ${p.drafts} 份</p><p class="tiny">表达自查已勾选完整 ${p.selfChecked} 份；前四周三个小任务已勾选 ${p.monthCompleted} / 28 天。手工自查与任务不算能力评分或打卡。</p><div class="actions">${btn('集中订正','drill-review','','secondary')}${btn('查看每日小任务','month','','secondary')}</div></div><div class="lesson-grid">${p.levels.map(l=>`<article class="card practice-level-card" data-level="${l.level}"><h3>${l.level}</h3><p>规则题达标 ${l.passed} / ${l.total} 包</p>${meter(percent(l.passed,l.total))}<p class="tiny">已练 ${l.practiced} 包 · 已开放 ${l.available} 包 · 待订正 ${l.wrong} 项</p><p class="tiny">已保存表达 ${l.drafts} 份 · 自查勾选完整 ${l.selfChecked} 份</p>${btn('查看本级练习','practice-level',`data-level="${l.level}"`,'small secondary')}</article>`).join('')}</div><p class="tiny">主课程、补充练习和手工任务分别统计；规则正确率不能证明完整听说读写能力。</p></section>`;
  }
  function firstMonthPage() {
    const s=L.firstMonthSummary(state,L.dateKey(),monthDay);monthDay=s.selectedDay;
    return heading('PRIMER MES · A1','今天，先完成这一小步。','前四周 28 天：先复习，再理解，最后开口与表达。中断后从薄弱处继续。')+`<div class="card"><h2>${s.started?'沿用一年计划的起点':'先设一个学习起点'}</h2><p>${s.started?`开始日：${esc(s.startDate)} · 已经过 ${s.elapsed} 天`:'开始后才能记录今天的小任务；所有内容仍可预览。'}</p><p class="tiny">已勾选三个任务 ${s.completedDays} / 28 天。这是手工练习记录，不是打卡或掌握证明。</p><div class="actions">${s.started?'':btn('从今天开始计划','month-start')}${btn('查看一年计划','year','','secondary')}</div></div><div class="notice">按实际进度调整，不强求赶日历。课程与分级包仍按前置学习开放；未来天可预览，不能提前勾选。手工任务不改变词量、课程得分或自动打卡。本页未提供音频与发音评分。</div><div class="toolbar"><label for="month-day">查看任务日</label><select id="month-day">${L.firstMonthDays.map(d=>`<option value="${d.day}" ${d.day===s.selectedDay?'selected':''}>第 ${d.day} 天 · ${esc(d.title)}</option>`).join('')}</select>${btn('回到建议的今天','month-current','','small secondary')}</div><div class="card month-plan">${pill(`第 ${s.plan.week} 周 · 第 ${s.selectedDay} 天 · 约 ${s.plan.minutes} 分钟`)}<h2>${esc(s.plan.title)}</h2>${s.tasks.map(t=>`<section><h3>${esc(t.label)}</h3><p>${esc(t.text)}</p><label class="week-check"><input type="checkbox" data-month-task="${t.id}" ${t.checked?'checked':''} ${s.canCheck?'':'disabled'}/> 做完后勾选 · ${esc(t.label)}</label></section>`).join('')}<div class="actions">${btn('打开本日配套内容 →','month-target',`data-kind="${s.plan.target.kind}" data-id="${s.plan.target.id}"`)}${btn('练今日词卡','study','','secondary')}${btn('查看独立分级练习','drills','','secondary')}</div></div><p class="tiny">记录可反选；过去任务在实际勾选当天记录日期。建议新词不等于已经学会的词，缺少反馈时先保留需要改进的问题。</p>`;
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
    L.answerExercise(nounQuiz,answer,L.evaluateNounAnswer);render();
  }
  function nounPage(id) {
    const n=L.nounLessons.find(n=>n.id===id);
    if(!n)return '<div class="card empty">没有找到名词练习。<a href="#nouns">返回名词列表</a></div>';
    const head=`${btn(`${icon('back')} 返回名词列表`,'nouns','','back')}${heading('PALABRAS EN ACCIÓN · A1',n.singular,n.meaning+' · '+n.gender)}`;
    if(!nounQuiz||nounQuiz.id!==id)return `<section class="reading">${head}<div class="card"><h2>把冠词一起记</h2><p class="example" lang="es">${esc(n.singular)} → ${esc(n.plural)}</p><div class="actions audio-controls">${btn('听单数','audio-play',`data-text="${esc(n.singular)}"`,'small secondary')}${btn('听复数','audio-play',`data-text="${esc(n.plural)}"`,'small secondary')}</div><p class="example" lang="es">${esc(n.phrase)}</p><p>${esc(n.phraseTranslation)}</p>${audioButtons(n.phrase)}<p>${esc(n.rule)}</p><div class="notice">${esc(n.note)}</div><p class="example" lang="es">${esc(n.sentence)}</p><p>${esc(n.translation)}</p>${audioButtons(n.sentence)}</div><p class="tiny">${esc(n.reviewScope)}</p><div class="card"><h2>本组参考</h2><p><a href="${esc(L.findWord(n.id).dictionaryUrl)}" target="_blank" rel="noopener noreferrer">查原词典义项 ↗</a></p>${n.references.map(r=>{const s=C.sources.find(s=>s.id===r.sourceId);return `<p class="tiny"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br>${esc(r.section)}</p>`;}).join('')}</div>${btn('开始三步练习 →','noun-begin',`data-id="${id}"`)}</section>`;
    if(nounQuiz.result){const r=nounQuiz.result;return `<section class="reading">${head}<div class="card result-card"><div class="result-score">${r.score}%</div><h2>三步练习已保存</h2><p>答对 ${r.correct} / ${r.total} 题。错项保留在名词列表，下次答对即可移除。</p><p class="tiny">仅检查本题指定答案，不判断自由表达能力；不计每日打卡或词汇掌握。</p><div class="actions">${btn('再练这三步','noun-begin',`data-id="${id}"`)}${btn('换一个名词 →','nouns','','secondary')}</div></div></section>`;}
    const q=nounQuiz.questions[nounQuiz.index],f=nounQuiz.feedback;
    return `<section class="reading">${head}${pill(`${nounQuiz.index+1} / 3`)}<h2 class="question-title">${esc(q.title)}</h2><p>${esc(q.prompt)}</p>${UI.hint(q,nounQuiz,'noun')}${UI.controls({question:q,session:nounQuiz,prefix:'noun',limit:200,note:'重音和 ñ 也是拼写的一部分。可以用重音按钮输入。'})}${UI.feedback(f,{action:'noun-next',label:nounQuiz.index+1===nounQuiz.total?'保存并查看结果':'下一步 →'})}</section>`;
  }
  function drillsPage() {
    const packs=L.drillProgress(state).filter(p=>p.level===drillLevel), guide=packs[0].levelGuide;
    return heading('PASO A PASO · A1 → B2','一层一层，练到能用。','每级 3 个核心包 + 3 个巩固包：辨析 → 填空 → 纠错 → 短阅读 → 自己表达。')+`<div class="notice">建议按下方顺序学完同级核心与巩固，再进入下一级；每包 4 题至少答对 3 题即可达标；后续内容可预览。补充路线单独保存，不计每日打卡、词汇确认或自动提升等级。</div>${btn(`集中订正 · ${L.drillWrongQuestions(state).length} 项 →`,'drill-review','','secondary')}<div class="level-tabs" role="group" aria-label="分级练习等级">${['A1','A2','B1','B2'].map(level=>btn(level,'drills-level',`data-level="${level}" aria-pressed="${level===drillLevel}"`,level===drillLevel?'':'secondary')).join('')}</div><div class="card level-overview"><h2>${esc(drillLevel)} · ${esc(guide.title)}</h2><p>${esc(guide.preparation)}</p><p>${esc(guide.strategy)}</p><p><strong>本级读到哪里：</strong>${esc(guide.milestone)}</p>${drillLevel==='A1'?btn('先学四步入门','foundations','','secondary'):''}</div><div class="lesson-grid">${packs.map((p,i)=>`<article class="card drill-card ${p.unlocked?'':'locked'}"><div class="card-head">${pill(`${p.level} · ${p.branch==='core'?'核心练习':'巩固练习'}`)}<span class="tiny">${p.unlocked?'可练习':'可预览'}</span></div><h2>${i+1}. ${esc(p.title)}</h2><p>${esc(p.goal)}</p>${p.article?'<p class="tiny">含本级进阶文章 · 读后复述与迁移</p>':''}<p class="tiny">${p.bestScore===null?'尚未练习':`最佳正确率 ${p.bestScore}%`} · 待订正 ${p.mistakes.length} 项</p>${p.mistakes.map(q=>`<p class="tiny">${esc(q.title)} · 上次：${esc(q.previousAnswer)}</p>`).join('')}${btn(p.unlocked?'进入学习包 →':'预览与查看前置 →','drill',`data-id="${p.id}"`,'secondary')}</article>`).join('')}</div>`;
  }
  function drillReviewPage() {
    if(!drillReview)drillReview={phase:'setup',level:''};
    const back=btn(`${icon('back')} 返回分级练习`,'drills','','back');
    const head=heading('REPASO · A1 → B2','把错项练明白。','只重练尚未订正的题，保留原学习包的完整作答成绩。');
    const count=L.drillWrongQuestions(state,drillReview.level).length;
    if(drillReview.phase==='setup')return `<section class="reading">${back}${head}<div class="level-tabs">${['','A1','A2','B1','B2'].map(level=>btn(level||'全部','review-level',`data-level="${level}"`,level===drillReview.level?'':'secondary')).join('')}</div><div class="card"><h2>待订正 ${count} 项</h2><p>每轮最多 12 项；答错本轮再出现一次，首次正确率不因订正而提高。</p><p class="tiny">订正仅移除错项，不提升原包最佳分，也不开放下一包。完整包未达标时请回去重练。</p>${btn('开始集中订正 →','review-begin',count?'':'disabled')}</div></section>`;
    if(drillReview.phase==='empty')return `<section class="reading">${back}${head}<div class="card empty">当前范围没有待订正项。</div>${btn('查看其他等级','review-setup','','secondary')}</section>`;
    if(drillReview.phase==='result')return `<section class="reading">${back}${head}<div class="card result-card"><div class="result-score">${Math.round(drillReview.firstCorrect/drillReview.original*100)}%</div><h2>本轮首次正确率</h2><p>首次答对 ${drillReview.firstCorrect} / ${drillReview.original} 项；还剩 ${count} 项待订正。</p><p class="tiny">重练后的正确答案不改变首次统计，原包分数与打卡保持原值。</p>${btn('再看待订正项','review-setup')}</div></section>`;
    const q=drillReview.items[drillReview.index],f=drillReview.feedback;
    return `<section class="reading">${back}${head}${pill(`${q.level} · ${drillReview.index+1} / ${drillReview.items.length}`)}<p class="tiny">${esc(q.packTitle)} · ${esc(q.title)}</p>${q.position===3?`<div class="card"><p class="example" lang="es">${esc(q.reading)}</p><p class="tiny">${esc(q.glossary)}</p></div>`:''}<h2 class="question-title">${esc(q.prompt)}</h2>${UI.hint(q,drillReview,'review')}${UI.controls({question:q,session:drillReview,prefix:'review',limit:500,label:'订正答案',submitLabel:'检查订正',accents:'áéíóúüñ¿¡'})}${UI.feedback(f,{action:'review-next',correctLabel:'✓ 答对了，错项已移除',wrongLabel:'再看一下，本轮稍后再试一次',label:drillReview.index+1===drillReview.items.length?'查看订正结果':'下一项 →'})}</section>`;
  }
  function beginDrillReview() {
    const items=L.drillReviewQueue(state,drillReview.level);
    Object.assign(drillReview,{phase:items.length?'quiz':'empty',items,original:items.length,index:0,firstCorrect:0,answered:new Set(),retries:new Set(),input:'',feedback:null,showHint:false});render();
  }
  function submitDrillReview(answer) {
    if(!drillReview||drillReview.phase!=='quiz'||drillReview.feedback)return;
    if(typeof answer!=='string'||!answer.trim())return notify('请先填写答案。');
    const q=drillReview.items[drillReview.index];
    if(!L.drillUnlocked(state,q.packId))return notify('练习进度已变化，请重新开始。');
    const result=commit(s=>L.reviewDrillMistake(s,q.id,answer,q.form||0));if(!result)return;
    if(!drillReview.answered.has(q.id)){drillReview.answered.add(q.id);if(result.correct)drillReview.firstCorrect++;}
    if(!result.correct&&!drillReview.retries.has(q.id)){drillReview.items.push(L.nextDrillReviewQuestion(q));drillReview.retries.add(q.id);}
    drillReview.input=answer;drillReview.feedback=result;render();
  }
  function drillSteps() {
    return `<nav class="study-steps" aria-label="本包学习步骤">${[['prepare','1 · 看例句'],['read','2 · 读短文'],['practice','3 · 做四题'],['express','4 · 自己表达']].map(([id,label])=>btn(label,'drill-section',`data-section="${id}"`,'secondary')).join('')}</nav><p class="tiny">可按步骤阅读，也可直接回到需要的部分。跳转不会提交答案或保存草稿。</p>`;
  }
  function readingEvidence(guide) {
    return `<blockquote lang="es">${esc(guide[1])}</blockquote><p>${esc(guide[2])}</p>`;
  }
  function drillWords(p) {
    const shown = !!drillEditor.showWords;
    return `${btn(shown?'收起词组解释':'看词组解释','drill-words',`aria-expanded="${shown}"`,'secondary')}${shown?`<div class="reading-words">${p.words.map(([es,zh,note])=>`<div class="phrase-item"><strong lang="es">${esc(es)}</strong> · ${esc(zh)}<br><span class="tiny">${esc(note)}</span>${audioButtons(es)}</div>`).join('')}<p class="tiny">回到原文找这三组词，再收起提示重读一次。</p></div>`:''}`;
  }
  function drillReading(p) {
    const e=drillEditor;
    return `<div class="card study-section" id="drill-read" tabindex="-1"><h2>2 · 先读一小段</h2><p class="reading-task"><strong>带着问题读：</strong>${esc(p.readingGuide[0])}</p><p class="example" lang="es">${esc(p.reading)}</p>${audioButtons(p.reading)}<p class="tiny">词语提示：${esc(p.glossary)}</p><div class="reading-support">${drillWords(p)}<p class="tiny">先找原文，再看词组；仍读不懂时展开大意，最后收起重读。</p>${btn(e.showMeaning?'收起中文大意':'看中文大意','drill-meaning',`aria-expanded="${!!e.showMeaning}"`,'secondary')}${e.showMeaning?`<p class="reading-meaning">${esc(p.meaning)}</p>`:''}${btn(e.showEvidence?'收起原文依据':'我想好了，看原文依据','drill-evidence',`aria-expanded="${!!e.showEvidence}"`,'secondary')}${e.showEvidence?`<div class="reading-evidence">${readingEvidence(p.readingGuide)}</div>`:''}</div></div>`;
  }
  function drillArticle(p) {
    if(!p.article)return '';
    const a=p.article,e=drillEditor;
    return `<div class="card article-bridge"><h2>从短文再往前一步</h2><p>${esc(a.goal)}</p>${btn(e.showArticle?'收起本级文章':'试读本级长一点的文章','drill-article',`aria-expanded="${!!e.showArticle}"`,'secondary')}${e.showArticle?`<div class="bridge-reading"><h3>${esc(a.title)}</h3><p class="tiny">先通读抓主题，再逐段找依据，最后合上文章复述。不必一次读完。</p>${a.paragraphs.map(t=>`<div><p class="example" lang="es">${esc(t)}</p>${audioButtons(t)}</div>`).join('')}<dl class="article-words">${a.words.map(([es,zh])=>`<dt lang="es">${esc(es)}</dt><dd>${esc(zh)}${audioButtons(es)}</dd>`).join('')}</dl><h3>读懂了吗？先自己回答</h3><ol class="rules">${a.checks.map(c=>`<li>${esc(c[0])}</li>`).join('')}</ol>${btn(e.showArticleEvidence?'收起文章参考':'看文章依据与解释','drill-article-evidence',`aria-expanded="${!!e.showArticleEvidence}"`,'secondary')}${e.showArticleEvidence?`<div class="article-evidence">${a.checks.map((c,i)=>`<h3>${i+1}. ${esc(c[0])}</h3>${readingEvidence(c)}`).join('')}</div>`:''}<h3>合上文章，换成自己的表达</h3><p>${esc(a.response)}</p><p class="tiny">这是阅读与表达自练，不计入四题成绩；可写在本包草稿中，原写作自查仍只对应原任务。</p>${btn('去写自己的回答','drill-section','data-section="express"','secondary')}</div>`:''}</div>`;
  }
  function drillDialogue(p) {
    const shown = !!drillEditor.showDialogue;
    return `${btn(shown?'收起个人对话':'练一段自己的对话','drill-dialogue',`aria-expanded="${shown}"`,'secondary')}${shown?`<div class="personal-dialogue"><h3>先理解对方，再接一句</h3><p>${esc(p.dialogue.scene)}</p>${p.dialogue.turns.map(t=>`<p class="dialogue-turn">${esc(t)}</p>`).join('')}<h3>把回答换成你自己的</h3><p>${esc(p.dialogue.personalize)}</p><h3>换个情景，再自己说</h3><p>${esc(p.newScene.prompt)}</p><p class="tiny">说完检查：${esc(p.newScene.check)}</p><p class="tiny">先补上自己的回答，再收起对话，用自己的话说一遍。可在下方草稿中记下对话或新情景表达；手工自查仍对应原写作任务，不自动评分。</p></div>`:''}`;
  }
  function drillOutput(p, unlocked) {
    const e=drillEditor;
    return `<div class="card study-section" id="drill-express" tabindex="-1"><h2>4 · 先开口试一句</h2><p>${esc(p.transfer)}</p>${drillDialogue(p)}<h3 class="writing-title">再写自己的表达</h3><p>${esc(p.output.prompt)}</p><ol class="rules">${p.output.starters.map(t=>`<li lang="es">${esc(t)}</li>`).join('')}</ol><label for="drill-draft">个人表达草稿</label><textarea id="drill-draft" class="expression-input" maxlength="3000" placeholder="先用自己的经历写短句，再按提示连接。" ${unlocked?'':'disabled'}>${esc(e.text)}</textarea><div class="accent-buttons">${['á','é','í','ó','ú','ü','ñ','¿','¡'].map(c=>`<button data-action="drill-draft-accent" data-char="${c}" aria-label="草稿添加 ${c}" ${unlocked?'':'disabled'}>${c}</button>`).join('')}</div>${btn('保存表达草稿','drill-save',unlocked?'':'disabled')}<p id="drill-draft-status" class="tiny" role="status">${e.dirty?'修改尚未保存':e.saved?'草稿已保存':'尚无已保存草稿'}。保存版本 ${e.revisions}，此处不自动评分。</p><div class="actions">${e.dirty?btn('撤销未保存修改','drill-reset','','secondary'):''}${!e.dirty&&e.hasPrevious?btn('恢复上一保存版本','drill-revert','','secondary'):''}</div><h3>自己检查，再修改</h3><p class="tiny">完成后自行勾选；修改文字并保存后重新自查，不是能力评分。</p>${p.output.rubric.map((r,i)=>`<label class="week-check"><input type="checkbox" data-drill-check="${i}" ${e.checks.includes(i)?'checked':''} ${!unlocked||e.dirty||!e.saved||!e.text.trim()?'disabled':''}/> ${esc(r)}</label>`).join('')}${btn(e.showModel?'收起参考范文':'对照参考范文','drill-model',!unlocked||!e.saved||e.dirty||!e.text.trim()?'disabled':'','secondary')}${e.showModel?`<p class="example expression-model" lang="es">${esc(p.output.model)}</p>`:''}</div>`;
  }
  function drillPage(id) {
    const p=L.drillPacks.find(p=>p.id===id);
    if(!p)return '<div class="card empty">没有找到练习包。<a href="#drills">返回分级练习</a></div>';
    if(!drillEditor||drillEditor.id!==id){const d=state.drillDrafts[id];drillEditor={id,text:d?d.text:'',saved:!!d,revisions:d?d.revisions:0,checks:d?d.checks:[],hasPrevious:!!d&&typeof d.previousText==='string',dirty:false,showModel:false,showMeaning:false};}
    const unlocked=L.drillUnlocked(state,id),previous=L.drillPacks.find(d=>d.id===p.previousId);
    const head=`${btn(`${icon('back')} 返回分级练习`,'drills','','back')}${heading(`${p.level} · ${p.branch==='core'?'核心练习':'巩固练习'}`,p.title,p.goal)}`;
    if(!unlocked||!drillQuiz||drillQuiz.id!==id)return `<section class="reading">${head}${drillSteps()}${unlocked?'':`<div class="notice">按前置关系练习，前一包“${esc(previous.title)}”最佳正确率至少 75%。${btn('查看前一包','drill',`data-id="${p.previousId}"`,'secondary')}</div>`}<div class="card study-section" id="drill-prepare" tabindex="-1"><h2>1 · 先想清楚要表达什么</h2><p>${esc(p.approach)}</p><ol class="rules">${p.rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol><p class="tiny">复用旧词：${esc(p.recycled.join(' · '))}</p></div>${p.examples.map(([es,zh])=>`<div class="card"><p class="example" lang="es">${esc(es)}</p><p>${esc(zh)}</p>${audioButtons(es)}</div>`).join('')}${drillReading(p)}<div class="card study-section practice-entry" id="drill-practice" tabindex="-1"><h2>3 · 用四题检查理解</h2><p>辨析 → 填空 → 纠错 → 阅读。每题先回答再看解析，最后保存整包结果。</p>${btn('开始四步练习 →','drill-begin',`data-id="${id}" ${unlocked?'':'disabled'}`)}</div>${drillOutput(p,unlocked)}${drillArticle(p)}<div class="card"><h2>课程与依据</h2>${p.lessonIds.map(id=>`<p><a href="#lesson/${id}">${esc(C.lessons.find(l=>l.id===id).title)} ↗</a></p>`).join('')}${[...new Map(p.references.map(r=>[r.sourceId+r.section,r])).values()].map(r=>{const s=C.sources.find(s=>s.id===r.sourceId);return `<p class="tiny"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br>${esc(r.section)}</p>`;}).join('')}<p class="tiny">新增短文、题目与范文为原创，待教师审稿；等级是本站练习顺序。</p></div></section>`;
    if(drillQuiz.result){const r=drillQuiz.result,next=L.nextDrillPack(state,id);return `<section class="reading">${head}<div class="card result-card"><div class="result-score">${r.score}%</div><h2>${r.passed?'基础练习已达标':'再巩固一次'}</h2><p>答对 ${r.correct} / ${r.total} 题；错项保留在列表，重新练习答对后移除。</p><p class="tiny">75% 是本包继续练习的门槛，不能证明语言等级；个人表达需自行检查与反馈。</p><div class="actions">${btn('写自己的表达 →','drill-output')}${btn('换题重练四步','drill-begin',`data-id="${id}"`,'secondary')}${r.passed&&next?btn('继续下一包 →','drill',`data-id="${next.id}"`,'secondary'):''}</div></div></section>`;}
    const q=drillQuiz.questions[drillQuiz.index],f=drillQuiz.feedback;
    return `<section class="reading">${head}${pill(`${drillQuiz.index+1} / 4`)}<h2 class="question-title">${esc(q.title)}</h2>${drillQuiz.index===3?`<div class="card"><p class="example" lang="es">${esc(q.reading)}</p><p class="tiny">${esc(q.glossary)}</p></div>`:''}<p>${esc(q.prompt)}</p>${UI.hint(q,drillQuiz,'drill')}${UI.controls({question:q,session:drillQuiz,prefix:'drill',limit:500,note:'重音和 ñ 也是拼写的一部分。可以用重音按钮输入。'})}${UI.feedback(f,{action:'drill-next',label:drillQuiz.index+1===drillQuiz.total?'保存并查看结果':'下一步 →'})}</section>`;
  }
  function submitDrillAnswer(answer) {
    if(!drillQuiz||drillQuiz.feedback||drillQuiz.result)return;
    if(!L.drillUnlocked(state,drillQuiz.id))return notify('请先完成前面的练习包。');
    if(typeof answer!=='string'||!answer.trim())return notify('请先填写答案。');
    L.answerExercise(drillQuiz,answer,L.evaluateDrillAnswer);render();
  }
  function foundationPage(id) {
    const f=L.foundations.find(f=>f.id===id);
    if(!f)return '<div class="card empty">没有找到基础课。</div>';
    const head=`${btn(`${icon('back')} 返回四步入门`,'foundations','','back')}${heading('PRIMEROS PASOS',f.title,f.goal)}`;
    if(!foundationQuiz||foundationQuiz.id!==id)return `<section class="reading">${head}<div class="card"><ol class="rules">${f.rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div><div class="card"><h2>听一遍，再跟读</h2><p class="tiny">先听正常速度，听不清再慢速听。读完遮住例词，从中文回忆西语。</p>${f.examples.map(([es,zh])=>`<section class="example-row"><p class="example" lang="es">${esc(es)}</p><p>${esc(zh)}</p>${audioButtons(es.split(' → ')[0])}</section>`).join('')}</div><div class="card"><h2>现在开口试一试</h2><p>${esc(f.practice)}</p><p class="tiny">内置西班牙西语合成音，可正常或慢速听；跟读不自动评分。</p></div><details class="card"><summary>本课参考</summary>${f.references.map(r=>{const s=C.sources.find(s=>s.id===r.sourceId);return `<p class="tiny"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a><br>${esc(r.section)}</p>`;}).join('')}</details>${btn('做 4 道小练习 →','foundation-begin',`data-id="${id}"`)}</section>`;
    if(foundationQuiz.result){const r=foundationQuiz.result;const next=L.foundationProgress(state).find(item=>!item.passed);const mistakes=foundationQuiz.questions.filter((q,i)=>foundationQuiz.answers[i]!==q.answer);return `<section class="reading">${head}<div class="card result-card"><div class="result-score">${r.score}%</div><h2>${r.passed?'这一步的规则练习已达标':'慢慢来，再练一次'}</h2><p>答对 ${r.correct} / ${r.total} 题。选择题检查规则知识，口头发音仍需要模仿和反馈。</p><p class="tiny">基础课进度单独保存，不计每日词汇或语法打卡。</p>${mistakes.length?`<section class="mistake-review"><h3>先把这几处弄明白</h3>${mistakes.map(q=>`<div class="example-row"><strong>${esc(q.prompt)}</strong><p>正确答案：${esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p></div>`).join('')}</section>`:''}<p>离开前：不看例句，${esc(f.practice)}</p><div class="actions">${r.passed ? (next ? btn('继续下一微课 →','foundation',`data-id="${next.id}"`) : btn('进入日常巩固 →','today')) : btn('回看讲解并跟读','foundation-relearn',`data-id="${id}"`)}${btn('重新练习','foundation-begin',`data-id="${id}"`,'secondary')}${btn('开始今天的词汇','study','','secondary')}</div></div></section>`;}
    const q=foundationQuiz.questions[foundationQuiz.index],selected=foundationQuiz.answers[foundationQuiz.index];
    return `<section class="reading">${head}<div class="pill">${foundationQuiz.index+1} / ${f.questions.length}</div><h2 class="question-title">${esc(q.prompt)}</h2>${q.options.map((option,i)=>`<button class="choice ${selected!==undefined&&i===q.answer?'correct':selected===i?'wrong':''}" data-action="foundation-answer" data-index="${i}" ${selected!==undefined?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span>${esc(option)}</button>`).join('')}${selected!==undefined?`<div class="feedback"><strong>${selected===q.answer?'✓ 答对了':'再看一遍这个规则'}</strong><p>${esc(q.explanation)}</p></div>${btn(foundationQuiz.index+1===f.questions.length?'查看结果':'下一题 →','foundation-next')}`:''}</section>`;
  }
  function yearPage() {
    const summary=L.yearSummary(state,L.dateKey());if(!yearWeek)yearWeek=summary.weekNumber;
    const w=L.yearPlan.weeks[yearWeek-1],record=state.journey.weekChecks[yearWeek]||{skills:[]},editable=summary.started&&summary.day>0&&yearWeek<=summary.weekNumber;
    return heading('UN AÑO, PASO A PASO','一年，慢慢走向 B1。','52 周 + 第 365 天复盘。每周六天练习、一天回顾或休息，按实际掌握情况调整。')+`<div class="card"><h2>${summary.started?'你的学习计划':'从今天设一个起点'}</h2><p>${summary.started?`开始日期：${esc(summary.startDate)} · 经过 ${summary.day} 天 · 建议第 ${summary.weekNumber} 周`:'先用第一周建立习惯，不用追赶日历。'}</p><p class="tiny">周自检已勾选 ${summary.completedWeeks} / 52；入门规则练习 ${summary.foundationPassed} / 4 达标。</p><div class="actions">${summary.started?'':btn('开始一年计划','year-start')}${btn('四步入门','foundations','','secondary')}${btn('前四周每日小任务 →','month','','secondary')}</div></div><div class="notice">一年是学习安排，不是等级保证。听说读写需要持续练习与反馈；日历不会自动解锁课程，周自检是你的练习记录。中断后从实际薄弱处继续。</div><div class="roadmap">${L.yearPlan.stages.map(s=>`<article class="card"><h3>${s.level||s.id} · 第 ${s.start}–${s.end} 周</h3><p>${esc(s.focus)}</p><p class="tiny">建议每天 ${s.minutes} 分钟 · ${s.newWords?`新词 ${s.newWords} 个，另加旧词复习`:'少学新词，优先回顾'}</p><p class="tiny">${esc(s.output)}</p></article>`).join('')}</div><div class="toolbar"><label for="year-week">查看周次</label><select id="year-week">${L.yearPlan.weeks.map(w=>`<option value="${w.number}" ${w.number===yearWeek?'selected':''}>第 ${w.number} 周 · ${w.level} · ${esc(w.title)}</option>`).join('')}</select>${btn('回到建议的本周','year-current','','small secondary')}</div><div class="card"><h2>第 ${w.number} 周 · ${w.level} · ${esc(w.title)}</h2><p>语法重点：${esc(w.focus)}</p><p>输出目标：${esc(w.output)}</p><p class="tiny">${esc(w.listening)}</p><p class="tiny">新词建议不是当前每日打卡目标；词卡计划仍按你的设置安排到期复习和练习。</p><div class="actions">${btn(L.isUnlocked(state,w.unitId)?'进入配套语法':'查看课程前置要求','lesson',`data-id="${w.lessonId}"`,'secondary')}${btn('进入配套表达','expression',`data-id="${w.taskId}"`,'secondary')}${btn('寻找本周学习资料','library','','ghost')}</div></div><div class="two-column"><div class="card"><h2>一周怎么练？</h2><ol class="rules">${L.weekGuide(yearWeek).map(d=>`<li><strong>第 ${d.day} 天 · ${esc(d.title)}</strong>${d.steps.map(s=>`<p>${esc(s)}</p>`).join('')}${btn(d.target.label+' →','week-guide',`data-kind="${d.target.kind}" data-id="${d.target.id}"`,'small secondary')}</li>`).join('')}</ol></div><div class="card"><h2>本周自检</h2><p class="tiny">完成后自行勾选，可反选。只记录练习，不自动判断语言能力；未来周只可预览。</p>${L.yearPlan.skills.map(s=>`<label class="week-check"><input type="checkbox" data-skill="${s.id}" ${record.skills.includes(s.id)?'checked':''} ${editable?'':'disabled'}/> ${esc(s.label)}</label>`).join('')}</div></div><div class="notice">${esc(L.yearPlan.finalDay)}</div>`;
  }
  function wordsPage() {
    const rows = C.curriculumWords.filter(w => (!levelFilter || w.level === levelFilter) && (!unitFilter || w.unitId === unitFilter) && `${w.spanish} ${w.meaning}`.toLowerCase().includes(query.trim().toLowerCase()));
    return heading('VOCABULARIO', '每个词，都有语境。', '320 个 A1–B2 分级词条，连同例句、词性与地区用法一起记忆。', `<div class="practice-modes">${btn(`词卡复习 ${icon('arrow')}`,'study')}${btn('词义与拼写测验','word-quiz','','secondary')}</div>`) + `<div class="card"><h2>从入门走向 6,500 词</h2><p>按阶段学习扩展词库，再把新词放进自己的表达。</p>${btn('进入 6500 词库 →','bank','','secondary')}</div><div class="toolbar"><label class="sr-only" for="word-search">搜索西语或中文释义</label><input id="word-search" class="search-input" placeholder="搜索西语或中文释义，例如 hola / 你好" value="${esc(query)}" autocomplete="off" /><label class="sr-only" for="level-filter">筛选等级</label><select id="level-filter"><option value="">全部等级</option>${C.levels.map(l=>`<option value="${l.id}" ${levelFilter===l.id?'selected':''}>${l.id} · ${esc(l.title)}</option>`).join('')}</select><label class="sr-only" for="unit-filter">筛选单元</label><select id="unit-filter"><option value="">全部单元</option>${C.units.filter(u=>!levelFilter||u.levelCode===levelFilter).map(u => `<option value="${u.id}" ${unitFilter===u.id?'selected':''}>${u.levelCode} · ${u.number} · ${esc(u.topic)}</option>`).join('')}</select><span class="tiny">${rows.length} 个词条</span></div><div class="word-grid">${rows.map(w => { const r = state.reviews[w.id]; return `<article class="card word-card"><div class="word-top"><span class="word-title" lang="es">${esc(w.spanish)}</span>${pill(!L.isUnlocked(state,w.unitId) ? '后续预览' : r ? r.due <= L.dateKey() ? '待复习' : '已学习' : '未学习')}</div><div class="word-meaning">${esc(w.meaning)}</div><div class="word-pos">${esc(w.pos)} · ${w.level} · 单元 ${w.unitId.slice(1)}</div><details><summary>查看例句与用法</summary>${audioButtons(w.spanish)}${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><div class="translation">${w.bank?'英文原义 · 中文为辅助释义，待人工校对':esc(w.translation)}</div>${w.note !== '通用' ? `<div class="regional">${esc(w.note)}</div>` : ''}<p class="tiny">${w.verification.status==='reviewed'?`${esc(w.verification.reference)}<br>词义与词性核验 ${esc(w.verification.date)}`:'新增词条：待逐条词典复核'} · 例句为原创<br><a href="${esc(w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">查官方词条 ↗</a></p></details></article>`; }).join('') || '<div class="card empty">没有找到这个词，试试其他关键词。</div>'}</div>`;
  }
  function bankPage() {
    const levels=L.bankProgress(state), unlocked=new Set(levels.filter(l=>l.unlocked).map(l=>l.id));
    const term=bankQuery.normalize('NFC').trim().toLowerCase();
    const all=C.lexicon.catalogue.filter(w=>(!bankLevel||w.level===bankLevel)&&`${w.spanish} ${w.meaning} ${w.definition||''}`.toLowerCase().includes(term));
    const pages=Math.max(1,Math.ceil(all.length/30));bankPageIndex=Math.max(0,Math.min(bankPageIndex,pages-1));
    const packs=C.lexicon.packs.filter(p=>!bankLevel||p.level===bankLevel),packPages=Math.max(1,Math.ceil(packs.length/6));packPageIndex=Math.max(0,Math.min(packPageIndex,packPages-1));
    return heading('VOCABULARIO EN ESPIRAL','6,500 个词，从认识到表达。','6,483 个单词 + 17 个表达；词形和重复语境不计为新词。')+`<div class="card"><h2>选择每天学习的词汇范围</h2><p class="tiny">当前：${state.track==='bank'?'扩展词库':'课内词汇'}。到期复习优先，单词答对后计入每日目标；语法仍按 32 单元学习。</p><div class="actions">${btn('启用扩展词库','track','data-track="bank"',state.track==='bank'?'':'secondary')}${btn('使用课内词汇','track','data-track="course"',state.track==='course'?'':'secondary')}</div></div><div class="level-tabs">${btn('全部','bank-level','data-level=""',bankLevel===''?'':'secondary')}${levels.map(l=>btn(l.id,'bank-level',`data-level="${l.id}"`,bankLevel===l.id?'':'secondary')).join('')}</div><div class="roadmap">${levels.map(l=>`<div class="card"><h3>${l.id} · ${l.total} 词</h3><p class="tiny">累计 ${l.cumulative} · 记忆确认 ${l.confirmed} / ${l.total}</p>${meter(percent(l.confirmed,l.total))}<p class="tiny">${l.unlocked?'可训练':esc(l.unlockReason)}</p></div>`).join('')}</div><div class="notice">等级为参考 PCIC 方向与字幕词频的学习阶段，不是官方逐词 CEFR 定级。扩展词条的中文为辅助释义，英语中转可能存在义项差异，需结合英文原义核对；尚待人工校对。名词性别请查原词典。</div><div class="toolbar"><label class="sr-only" for="bank-search">搜索扩展词库</label><input id="bank-search" class="search-input" maxlength="100" placeholder="搜索西语、中文或英文原义" value="${esc(bankQuery)}"/><span id="bank-count" class="tiny">${all.length} 个去重条目 · 第 ${bankPageIndex+1} / ${pages} 页</span></div><div class="word-grid">${all.slice(bankPageIndex*30,(bankPageIndex+1)*30).map(w=>{const available=w.bank?unlocked.has(w.level):L.isUnlocked(state,w.unitId);return `<article class="card word-card"><div class="word-top"><strong class="word-title" lang="es">${esc(w.spanish)}</strong>${pill(available?'可训练':'后续预览')}</div><p class="word-meaning">${esc(w.meaning)}</p><p class="tiny">${w.level} · ${esc(w.pos)}${w.bank?' · 中文辅助释义待校对':''}</p><details><summary>${w.bank?'听发音、查看原义与来源':'听发音、查看例句与来源'}</summary>${audioButtons(w.spanish)}${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><p class="tiny">${w.bank?`中文对应英语：${esc(w.pivot)} · ${esc(w.verification.reference)}`:esc(w.translation)}</p><a href="${esc(w.bank?w.sourceUrl:w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">${w.bank?'Wiktionary 原词条':'RAE 查询'} ↗</a>${w.bank?`<p class="tiny">派生词库 CC BY-SA 4.0 · <a href="${esc(w.dictionaryUrl)}" target="_blank" rel="noopener noreferrer">RAE 查询 ↗</a></p>`:''}</details></article>`;}).join('')||'<div class="card empty">没有找到这个词，试试其他关键词。</div>'}</div><div class="actions">${btn('上一页','bank-page',`data-step="-1" ${bankPageIndex===0?'disabled':''}`,'secondary')}${btn('下一页','bank-page',`data-step="1" ${bankPageIndex+1===pages?'disabled':''}`,'secondary')}</div><div class="section-head"><h2>词包训练 → 词汇串联</h2><span class="tiny">${packs.length} 个词包 · 第 ${packPageIndex+1} / ${packPages} 页</span></div><div class="lesson-grid">${packs.slice(packPageIndex*6,(packPageIndex+1)*6).map(p=>{const locked=!unlocked.has(p.level);return `<article class="card pack-card"><h3>${p.level} · 词包 ${p.number}</h3><p class="tiny">${p.wordIds.length} 词 · ${esc(p.wordIds.slice(0,4).map(id=>L.findWord(id).spanish).join(' · '))}</p><div class="actions">${btn('词卡训练','study',`data-pack="${p.id}" ${locked?'disabled':''}`,'small secondary')}${btn('词义与拼写','word-quiz',`data-pack="${p.id}" ${locked?'disabled':''}`,'small secondary')}${btn(locked?'预览表达':'串联表达','expression',`data-id="${p.id}"`,'small ghost')}</div></article>`;}).join('')}</div><div class="actions">${btn('前一组词包','pack-page',`data-step="-1" ${packPageIndex===0?'disabled':''}`,'secondary')}${btn('后一组词包','pack-page',`data-step="1" ${packPageIndex+1===packPages?'disabled':''}`,'secondary')}</div>`;
  }
  function grammarPage() {
    const levels=L.levelProgress(state), active=levels.find(l=>l.id===grammarLevel);
    return heading('PASO A PASO','从一句话，到一个世界。','A1 → A2 → B1 → B2 · 32 单元 · 320 词条 · 128 道语法题') + `<div class="card beginner-start"><h2>从规则到真实表达</h2><p>每级六包，复用旧知识，逐步增加语境与篇幅。</p>${btn('A1 → B2 递进练习 →','drills')}</div><div class="level-tabs" role="group" aria-label="分级课程">${levels.map(l=>btn(l.id,'grammar-level',`data-level="${l.id}" aria-pressed="${grammarLevel===l.id}"`,grammarLevel===l.id?'':'secondary')).join('')}</div><div class="card level-overview"><h2>${active.id} · ${esc(active.title)}</h2><p>${esc(active.goal)}</p><p class="tiny">词汇 ${active.learned} / ${active.total} · 完成 ${active.completed} / ${active.unitTotal} 单元 · 输出形式完成 ${active.expressions} 次</p><p class="tiny">表达目标：${esc(active.target)}</p></div><div class="notice">前一单元至少 6 个词完成记忆确认，且语法达 75%，解锁下一单元。每单元都有表达任务。课内 320 张词卡配有原创例句；扩展词库提供 6,500 个去重条目。阶段编排供练习使用，单元完成不代表通过等级考试。<p><a href="#bank">进入 6500 词库 →</a></p></div><div class="lesson-grid">${C.units.filter(u=>u.levelCode===grammarLevel).map(u => { const p=L.unitProgress(state,u.id); const unlocked=L.isUnlocked(state,u.id); const lesson=C.lessons.find(l=>l.unitId===u.id), task=C.tasks.find(t=>t.unitId===u.id); return `<article class="card unit-card ${unlocked?'':'locked'}"><div class="card-head"><span class="eyebrow">${u.levelCode} · UNIDAD ${u.number}</span>${pill(p.complete ? '已完成 ✓' : unlocked ? '可学习' : '待解锁')}</div><h2>${esc(u.title)}</h2><p>${esc(u.goal)}</p>${meter(percent(p.learned,p.total))}<div class="tiny">已学习 ${p.learned} / ${p.total} · 记忆确认 ${p.ready} / ${p.total} · 语法${p.passed?'已达标':'待练习'}</div><div class="actions">${btn(unlocked ? '进入课程 →' : '查看解锁条件','lesson',`data-id="${lesson.id}"`,'small secondary')}${btn('词汇串联 →','expression',`data-id="${task.id}"`,'small ghost')}</div></article>`; }).join('')}</div><div class="card"><h2>综合任务：给城市写一份学习提案</h2><p>跨 A1–B2 复用词汇，把背景、目标、措施、局限和结论写成一篇文字。</p>${btn(L.expressionUnlocked(state,'final')?'开始综合任务 →':'预览最终任务 →','expression','data-id="final"','secondary')}</div>`;
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
  const authDialog = document.createElement('dialog');
  authDialog.id = 'account-dialog'; authDialog.className = 'account-dialog';
  authDialog.setAttribute('aria-labelledby', 'account-dialog-title');
  document.body.append(authDialog);
  let authBusy = false;
  function closeAccountMenu(focus = false) {
    const menu = document.getElementById('account-menu'), trigger = document.getElementById('account-trigger');
    if (menu) menu.hidden = true;
    trigger?.setAttribute('aria-expanded', 'false');
    if (focus) trigger?.focus();
  }
  function closeLoginDialog() {
    if (authBusy) return;
    authDialog.close(); authDialog.innerHTML = '';
    document.getElementById('account-trigger')?.focus();
  }
  function openLoginDialog() {
    closeAccountMenu();
    const a = account.status();
    if (a.user || a.broken) { navigate('account'); return; }
    authDialog.innerHTML = `<div class="account-dialog-head"><div><div class="eyebrow">MI CUENTA</div><h2 id="account-dialog-title">登录，继续你的西语学习</h2></div><button type="button" class="account-close" data-action="account-close" aria-label="关闭登录框">×</button></div><p>一个账号，一份自己的学习记录。换设备登录后，继续已同步的课程、错题和草稿。</p><p id="account-auth-status" data-account-status role="status">${esc(a.message)}</p><form id="account-form"><fieldset ${a.enabled ? '' : 'disabled'}><label for="account-username">账号</label><input id="account-username" name="username" autocomplete="username" minlength="4" maxlength="32" pattern="[A-Za-z0-9_]{4,32}" required autofocus><p class="tiny">4–32 位字母、数字或下划线，不区分大小写。</p><label for="account-password">密码</label><input id="account-password" name="password" type="password" autocomplete="current-password" minlength="10" maxlength="128" required><p class="tiny">10–128 个字符，请妥善保管。目前暂不支持忘记密码找回。</p><p id="account-auth-error" class="account-auth-error" role="alert"></p><div class="actions"><button type="submit" name="mode" value="login" class="btn">登录并继续学习</button><button type="submit" name="mode" value="register" class="btn secondary">注册新账号</button></div></fieldset><p class="tiny">注册会复制当前本机进度，原记录和 JSON 备份仍保留。</p></form>`;
    authDialog.showModal();
  }
  function accountPanel() {
    const a = account.status();
    return `<section class="card account-panel"><h2>学习账号${a.user ? ' · ' + esc(a.user.username) : ''}</h2><p id="account-status" data-account-status role="status">${esc(a.message)}</p><div class="actions">${a.user ? btn('账号详情与学习状况','account-details','','secondary') : a.broken ? btn('退出登录','account-logout','','secondary') : btn('登录 / 注册','account-login','','secondary')}</div><p class="tiny">账号记录与本机记录分别保留。换设备前，请确认同步成功并保留备份。</p></section>`;
  }
  const scoreText = score => score === null ? '尚未练习' : `${score}%`;
  function accountPage() {
    const a = account.status();
    const head = heading('MI CUENTA', '账号详情', '看清已经完成的内容，也知道下一步从哪里继续。');
    if (storageFailed) return head + accountPanel() + `<div class="notice">原学习记录暂未读取，统计暂不可用，旧记录不会被覆盖。${btn('重新读取记录','reload-records','','secondary')}</div>`;
    const p = L.profileSummary(state), completedPercent = percent(p.completed, C.units.length);
    return head + `<section class="card account-identity"><div class="profile-avatar" aria-hidden="true">${esc(a.user ? a.user.username.slice(0, 1).toUpperCase() : '学')}</div><div><h2>${esc(a.user?.username || '本机学习者')}</h2><p>${a.user ? '固定用户编号' : '当前记录保存在这台设备上'}${a.user ? `<code class="account-user-id">${esc(a.user.id)}</code>` : ''}</p><p id="account-status" data-account-status role="status">${esc(a.message)}</p></div>${a.user ? btn('立即同步','account-sync','','secondary') : btn('登录 / 注册','account-login','','secondary')}</section><section class="card account-resume"><div class="eyebrow">继续学习</div><h2>${esc(p.resume.label)}</h2><p>已完成 ${p.completed} / ${C.units.length} 个课程单元，当前学习位置为 ${esc(p.unit.levelCode)}。关卡依据词汇确认和语法练习开放。</p>${meter(completedPercent)}<div class="actions">${btn('接着上次的位置学习 →','account-continue')}${btn('查看课程路线','roadmap','','secondary')}</div></section><section class="stats" aria-label="账号学习概览">${stat(p.learned,'有学习记录的词汇','book','词')}${stat(p.checkins,'累计真实打卡','calendar','天')}${stat(p.due,'到期词汇复习','refresh','词')}${stat(p.grammarPassed,'语法练习达标','layers','课')}</section><div class="two-column"><section class="card account-accuracy"><h2>正确率与练习表现</h2><dl><div><dt>词汇作答正确率</dt><dd>${scoreText(p.wordAccuracy)}</dd></div><div><dt>语法历史最佳均分</dt><dd>${scoreText(p.grammarBest)}</dd></div><div><dt>分级规则题历史最佳均分</dt><dd>${scoreText(p.drillBest)}</dd></div></dl><p class="tiny">词汇累计答对 ${p.wordCorrect} / ${p.wordAttempts} 次，包含订正与重练；历史最佳均分按已练课程或题包计算，不是全部作答正确率。尚未作答时不显示为 0%。</p><p class="tiny">这些记录帮助安排复习，不认定完整听说读写能力或 CEFR 等级。</p></section><section class="card"><h2>当前学习状况</h2><p>词汇或语法有实际记录 ${p.learningDays} 天 · 连续打卡 ${p.streak} 天</p><p>待订正：词汇 ${p.wordMistakes} 个 · 语法 ${p.grammarMistakes} 题 · 分级练习 ${p.practice.wrong} 项</p><p>已保存表达：课内 / 词库 ${p.expressionDrafts} 份 · 分级 ${p.practice.drafts} 份</p><p>四步入门达标 ${p.foundationPassed} / 4 · 前四周任务完整记录 ${p.practice.monthCompleted} / 28 天</p><p>${p.year.started ? `计划开始于 ${esc(p.year.startDate)}，按日历已进行 ${p.year.day} 天；这不是已学天数或等级。` : '还没有设置年度计划起点，可以按实际时间开始。'}</p><div class="actions">${btn('集中订正分级错项','drill-review','','small secondary')}${btn('查看年度计划','year','','small secondary')}</div></section></div><section class="account-levels" aria-label="各级课程完成情况"><div class="section-head"><h2>A1 → B2 · 课程进度</h2></div>${p.levels.map(level => `<details class="card" ${level.level === p.unit.levelCode ? 'open' : ''}><summary><strong>${level.level}</strong> · 完成 ${level.completed} / ${level.total} 关 · 已开放 ${level.available} 关</summary><p class="tiny">本级已练语法历史最佳均分：${scoreText(level.bestScore)}</p>${level.units.map((unit, index) => `<div class="account-unit"><div><strong>第 ${index + 1} 关 · ${esc(unit.title)}</strong><p class="tiny">${unit.complete ? '✓ 已完成' : unit.unlocked ? '可以继续学习' : '等待前一关达标'} · 已确认词汇 ${unit.ready} / ${unit.total} · 语法最佳 ${scoreText(unit.bestScore)}${unit.attempts ? ` · 完整练习 ${unit.attempts} 次` : ''}</p></div>${btn(unit.complete ? '回顾' : '继续','lesson',`data-id="${unit.lessonId}" ${unit.unlocked ? '' : 'disabled'}`,'small secondary')}</div>`).join('')}</details>`).join('')}</section>${practiceProgressPanel()}<section class="card"><h2>保留备份，安心继续</h2><p class="tiny">同步成功后可在另一台设备恢复同一账号的进度。离线先保存本机；多设备同时修改时，两份记录先保留，再由你选择。</p><div class="actions">${btn('导出备份','export','','small secondary')}${btn('导入备份','import','','small ghost')}</div>${a.user ? `<details class="account-conflict"><summary>两台设备的进度不一致？</summary><p>先导出本机备份，再选择使用哪份进度。</p><div class="actions">${btn('使用云端进度','account-cloud','','secondary')}${btn('使用本机进度','account-local','','secondary')}${btn('导出替换前记录','account-previous','','ghost')}</div></details>` : ''}</section>`;
  }
  function resetAccountView() { state = readStored(); storageFailed = false; session = quiz = wordQuiz = foundationQuiz = nounQuiz = drillQuiz = drillEditor = drillReview = expressionEditor = null; render(); }
  function hasUnsavedWork() {
    return !!(drillEditor?.dirty || (expressionEditor && expressionEditor.text !== (state.expressions[expressionEditor.id]?.text || '')) || (quiz && !quiz.result && quiz.answers.length) || (drillQuiz && !drillQuiz.result && drillQuiz.answers.length) || (nounQuiz && !nounQuiz.result && nounQuiz.answers.length));
  }
  function canSwitchAccount() { return !hasUnsavedWork() || window.confirm('当前有未保存的练习或草稿。切换账号前建议先保存，仍要继续吗？'); }
  // Android handles history only after the current editor/dialog has had a chance to stay open.
  window.HolaNativeBack = () => {
    if (authDialog.open) { closeLoginDialog(); return true; }
    const menu = document.getElementById('account-menu');
    if (menu && !menu.hidden) { closeAccountMenu(true); return true; }
    return hasUnsavedWork() && !window.confirm('当前有未保存的练习或草稿。先取消返回并保存，或继续返回放弃本次修改。继续返回？');
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (window.HolaAndroid?.openReference && link?.href.startsWith('https://') && new URL(link.href).origin !== location.origin) {
      event.preventDefault(); window.HolaAndroid.openReference(link.href);
    }
  });
  function continueLearning() {
    const target = L.learningDestination(state);
    if (target.kind === 'month') monthDay = target.day;
    if (target.kind === 'year') yearWeek = target.week;
    if (target.kind === 'study') startSession();
    navigate(target.route);
  }
  async function accountAction(action) {
    try {
      if (action === 'account-toggle') {
        const a = account.status(); if (!a.user && !a.broken) return openLoginDialog();
        const menu = document.getElementById('account-menu'), trigger = document.getElementById('account-trigger');
        if (menu.hidden) { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); menu.querySelector('[role="menuitem"]')?.focus(); }
        else closeAccountMenu(true);
        return;
      }
      if (action === 'account-close') return closeLoginDialog();
      if (action === 'account-login') return openLoginDialog();
      if (action === 'account-details') { closeAccountMenu(); navigate('account'); return; }
      if (action === 'account-continue') return continueLearning();
      if (action === 'account-logout') {
        if (!canSwitchAccount()) return;
        closeAccountMenu(); clearTimeout(syncTimer);
        const exiting = account.logout(); resetAccountView(); navigate('today'); await exiting;
        notify('已退出登录，账号记录仍保留；现在显示原来的本机进度。'); return;
      }
      if (action === 'account-previous') { const old = account.previous(); if (!old) return notify('没有替换前记录。'); downloadBackup(old, 'before-replace'); return; }
      const choice = action === 'account-cloud' ? 'cloud' : action === 'account-local' ? 'local' : undefined;
      if (choice && !window.confirm(choice === 'cloud' ? '使用云端进度替换本机显示？建议先导出备份，替换前的记录也会在本机保留。' : '使用本机进度替换云端进度？请先确认已导出需要保留的备份。')) return;
      const result = await account.sync(choice);
      if (result?.downloaded) resetAccountView();
      render(); notify(account.status().message);
    } catch (error) { notify(error.message); }
  }
  function rememberLearningPosition() {
    if (!account.status().user || storageFailed) return;
    const page = route(); let position;
    for (const kind of ['lesson', 'drill', 'expression', 'foundation', 'noun']) if (page.startsWith(kind + '/')) position = { kind, id: page.slice(kind.length + 1) };
    if (page === 'study') position = { kind: 'study' };
    if (page === 'first-month') position = { kind: 'month', day: monthDay || L.firstMonthSummary(state, L.dateKey()).selectedDay };
    if (page === 'year') position = { kind: 'year', week: yearWeek || L.yearSummary(state, L.dateKey()).weekNumber };
    if (!position || JSON.stringify(state.resume) === JSON.stringify(position)) return;
    try {
      const draft = readStored();
      if (!L.setLearningPosition(draft, position)) return;
      account.write(draft); state = draft; queueSync();
    } catch { notify('学习位置暂未保存，已有学习记录仍保留。'); }
  }
  authDialog.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (button && !button.disabled) accountAction(button.dataset.action);
    if (event.target === authDialog) { const bounds = authDialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeLoginDialog(); }
  });
  authDialog.addEventListener('cancel', event => { event.preventDefault(); closeLoginDialog(); });
  authDialog.addEventListener('submit', async event => {
    if (event.target.id !== 'account-form') return;
    event.preventDefault(); if (authBusy || !canSwitchAccount()) return;
    const form = event.target, username = form.elements.username.value, password = form.elements.password.value;
    const mode = event.submitter?.value || 'login'; form.elements.password.value = '';
    authBusy = true; form.querySelector('fieldset').disabled = true; authDialog.querySelector('.account-close').disabled = true;
    const errorText = authDialog.querySelector('#account-auth-error'); errorText.textContent = '';
    try {
      await account.authenticate(mode, username, password, mode === 'register' ? readStored() : undefined);
      resetAccountView();
      let warning = '';
      try { await account.sync(); state = readStored(); } catch { warning = account.status().message; }
      authBusy = false; closeLoginDialog();
      if (warning) navigate('account'); else continueLearning();
      notify(warning || '已读取这个账号的学习记录，接着上次的位置继续。');
    } catch (error) { errorText.textContent = error.message; }
    finally { authBusy = false; if (authDialog.open) { form.querySelector('fieldset').disabled = !account.status().enabled; authDialog.querySelector('.account-close').disabled = false; } }
  });
  function progressPage() {
    const s=L.summary(state); const errors=L.mistakes(state); const wrong=L.wrongWords(state);
    const calendar=Array.from({length:14},(_,i)=> { const key=L.addDays(s.today,i-13); return `<div class="calendar-day ${L.isCheckedIn(state.days[key])?'done':''} ${key===s.today?'today':''}" aria-label="${key} ${L.isCheckedIn(state.days[key])?'已打卡':'未打卡'}">${key.slice(5)}</div>`; }).join('');
    return heading('MI CAMINO','每一步，都算数。','真正的进步，是今天比昨天多懂一点。') + accountPanel() + `${storageFailed?`<div class="notice">原记录暂未读取，旧数据不会被覆盖。可重读或导入兼容备份。${btn('重新读取记录','reload-records','','secondary')}</div>`:''}<div class="stats">${stat(s.streak,'连续打卡','flame','天')}${stat(s.checkins,'累计打卡','calendar','天')}${stat(s.learned,'已学习词汇','book',`/ ${C.lexicon.catalogue.length}`)}${stat(s.grammarPassed,'语法已达标','layers',`/ ${C.lessons.length}`)}</div>${practiceProgressPanel()}<div class="progress-columns"><section><div class="card"><div class="card-head"><h2>最近 14 天</h2>${pill('学习日历')}</div><div class="calendar">${calendar}</div><p class="tiny">深绿色：当日完成词汇目标 + 至少一次达标语法练习。按设备本地日期记录。</p></div><div class="card"><div class="card-head"><h2>词汇积累</h2><span>${s.learned} / ${C.lexicon.catalogue.length}</span></div>${meter(percent(s.learned,C.lexicon.catalogue.length))}<p class="tiny">有复习记录即“已学习”，不等于长期掌握。到期词会优先安排复习。</p></div></section><section><div class="card"><h2>每天，给自己一点时间</h2><p class="tiny">设置每天词汇量，再加 1 次达标语法练习。</p><div class="goal-options">${[3,5,10].map(g=>btn(`${g} 个词`,'goal',`data-goal="${g}"`,state.goal===g?'':'secondary')).join('')}</div><p class="tiny">当天首次学习时固定目标。今天开始学习后，调整目标对下一天生效。</p></div><div class="card"><h2>留住你的学习记录</h2><p class="tiny">未登录时保存在当前浏览器；登录后请确认同步成功。清理缓存或换设备前，仍建议导出备份。</p><div class="backup-actions">${btn('导出备份','export','','small secondary')}${btn('导入备份','import','','small ghost')}</div></div></section></div><div class="section-head"><h2>词汇错词本</h2><span class="tiny">${wrong.length} 个待订正</span></div><div class="card">${wrong.length?wrong.map(w=>`<p><strong lang="es">${esc(w.spanish)}</strong> · ${esc(w.meaning)}<br><span class="tiny">你的答案：${esc(w.answer)}</span></p>`).join('')+btn('集中重练错词 →','word-quiz','data-wrong="1"','secondary'):'<p class="tiny">词汇测验中答错的词会保存在这里。</p>'}</div><div class="section-head"><h2>错题回顾</h2><span class="tiny">${errors.length} 题待订正</span></div>${errors.length ? errors.map(q=>`<article class="card mistake"><h3>${esc(q.prompt)}</h3><p>你的答案：${esc(q.options[q.selected])}</p><p>正确答案：${esc(q.options[q.answer])}</p><p>${esc(q.explanation)}</p>${btn('重练本课 →','lesson',`data-id="${q.lessonId}"`,'small secondary')}</article>`).join('') : '<div class="card empty">暂无待订正错题。练习中的错题会自动出现在这里。</div>'}`;
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
    if (items.length) wordQuiz.question = nextWordQuestion(items[0].id, wordQuiz.mode);
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
    return `<section class="session">${btn(`${icon('back')} 回到今日`,'home','','back')}<div class="session-head"><span class="eyebrow">UN POCO CADA DÍA</span>${pill(`词卡 ${session.index+1} / ${session.items.length}`)}</div>${meter(percent(session.index,session.items.length))}<article class="card flashcard"><div class="tiny">先回忆意思，再查看答案。</div><div class="word-top"><div class="flash-word" lang="es">${esc(w.spanish)}</div>${audioButtons(w.spanish)}</div><div class="word-pos">${esc(w.pos)}</div>${session.revealed ? `<div class="flash-answer"><div class="meaning">${esc(w.meaning)}</div>${nounInfo(w.id)}<p class="example" lang="${w.bank?'en':'es'}">${esc(w.bank?w.definition:w.example)}</p><div class="translation">${w.bank?'英文原义 · 中文为辅助释义，待人工校对':esc(w.translation)}</div>${w.note!=='通用'?`<div class="regional">${esc(w.note)}</div>`:''}</div>` : btn('查看释义与例句','reveal','','secondary reveal')}</article>${session.revealed ? `<div class="ratings">${btn('忘记了','rate','data-rating="again"','danger')}${btn('想起来了','rate','data-rating="remember"','secondary')}${btn('很熟悉','rate','data-rating="easy"','lime')}</div>` : ''}<p class="helper">忘记的词会在本轮再出现一次，并保留为今日待复习。<br>课内词卡使用内置西语合成音；尚未收录的扩展词尝试设备朗读。跟读不自动评分。</p></section>`;
  }
  function lessonPage(id) {
    const lesson=C.lessons.find(l=>l.id===id);
    if (!lesson || !L.isUnlocked(state,lesson.unitId)) return `<div class="card empty">课程不存在或尚未解锁。先学习前一单元至少 6 个词并通过语法练习。<p><a href="#grammar">返回课程路线 →</a></p></div>`;
    const unit=C.units.find(u=>u.id===lesson.unitId);
    const title=`${btn(`${icon('back')} 返回语法路线`,'roadmap','','back')}<div class="eyebrow">UNIDAD ${unit.number} · ${esc(unit.topic)}</div><h1>${esc(lesson.title)}</h1><p class="subtitle">${esc(lesson.summary)}</p>${lesson.extension ? `<div class="notice" style="margin-top:20px">${esc(lesson.extension)}</div>` : ''}`;
    if (!quiz || quiz.id!==id) return `<section class="reading">${title}<div class="section-head"><h2>先理解</h2>${pill('中文讲解')}</div><div class="card"><ol class="rules">${lesson.rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol></div><div class="section-head"><h2>在句子里练习</h2></div>${lesson.examples.map(([es,zh])=>`<div class="card"><p class="example" lang="es">${esc(es)}</p><div class="translation">${esc(zh)}</div>${audioButtons(es)}</div>`).join('')}<div class="card"><h3>本课参考依据</h3>${lesson.references.map(r => { const source=C.sources.find(s=>s.id===r.sourceId); return `<p class="tiny"><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)} ↗</a><br>${esc(r.section)}</p>`; }).join('')}</div><p class="tiny">原创讲解与例句 · 主要语法依据已核对 · 非官方教材</p><div class="actions">${btn('开始 4 道练习 →','begin-quiz',`data-id="${id}"`)}</div></section>`;
    if (quiz.result) return `<section class="reading">${title}<div class="card result-card"><div class="success-icon">${icon(quiz.result.passed?'check':'refresh')}</div><div class="result-score">${quiz.result.score}%</div><h2>${quiz.result.passed?'¡Muy bien! 本课已达标':'再练一次，会更清楚'}</h2><p>答对 ${quiz.result.correct} / ${quiz.result.total} 题。${quiz.result.passed?'已计入今天的语法目标。':'本次未计入打卡，错题已收进错题本。'}</p>${L.summary(state).checkedIn ? '<p>✓ 今日目标完成，已自动打卡。</p>' : ''}<div class="actions">${btn('回到今日','home')}${btn('换一组同类题','begin-quiz',`data-id="${id}"`,'secondary')}</div></div></section>`;
    const q=quiz.questions[quiz.index]; const selected=quiz.answers[quiz.index];
    return `<section class="reading">${title}<div class="section-head"><h2>练习 ${quiz.index+1} / ${lesson.questions.length}</h2>${pill('达标线 75%')}</div><p class="tiny">${quiz.form?'同知识点换题练习 · 先理解句意，再选择。':'每次重练轮换题组，考查相同知识点。'}</p>${meter(percent(quiz.index,lesson.questions.length))}<h2 class="question-title">${esc(q.prompt)}</h2>${q.options.map((o,i)=>`<button class="choice ${selected!==undefined&&i===q.answer?'correct':selected===i?'wrong':''}" data-action="answer" data-index="${i}" ${selected!==undefined?'disabled':''}><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join('')}${selected!==undefined?`<div class="feedback"><strong>${selected===q.answer?'✓ 答对了':'再看一下这里'}</strong><p>${esc(q.explanation)}</p></div><div class="actions">${btn(quiz.index+1===lesson.questions.length?'查看结果':'下一题 →','next-question')}</div>`:''}</section>`;
  }
  function render() {
    const page=route(); let content;
    if (page==='study') content=studyPage();
    else if (page==='word-quiz') content=wordQuizPage();
    else if(page.startsWith('drill/')) content=drillPage(page.slice(6));
    else if(page.startsWith('noun/')) content=nounPage(page.slice(5));
    else if(page.startsWith('foundation/')) content=foundationPage(page.slice(11));
    else if(page.startsWith('expression/')) content=expressionPage(page.slice(11));
    else if(page.startsWith('lesson/')) content=lessonPage(page.slice(7));
    else content=({today:todayPage,words:wordsPage,bank:bankPage,'first-month':firstMonthPage,drills:drillsPage,'drill-review':drillReviewPage,nouns:nounsPage,foundations:foundationsPage,year:yearPage,grammar:grammarPage,library:libraryPage,progress:progressPage,account:accountPage}[page] || todayPage)();
    root.innerHTML=shell(content,page);
  }
  function openLesson(id) {
    const lesson=C.lessons.find(l=>l.id===id);
    if (!lesson || !L.isUnlocked(state,lesson.unitId)) return notify('先学习前一单元至少 6 个词，并通过语法练习。');
    quiz=null; navigate(`lesson/${id}`);
  }
  function openLearningTarget(kind, id) {
    if(kind==='session'){startSession();navigate('study');}
    else if(kind==='lesson')openLesson(id);
    else if(kind==='foundation'){foundationQuiz=null;navigate(`foundation/${id}`);}
    else if(kind==='drill'){drillQuiz=null;drillEditor=null;navigate(`drill/${id}`);}
    else if(kind==='nouns'){nounQuiz=null;navigate(`noun/${id}`);}
    else if(kind==='review'){drillReview={phase:'setup',level:''};navigate('drill-review');}
    else if(kind==='expression'){expressionEditor=null;navigate(`expression/${id}`);}
  }
  function startQuiz(id) { const lesson=C.lessons.find(l=>l.id===id); if(!lesson||!L.isUnlocked(state,lesson.unitId))return; const form=L.practiceForm(state.lessons[id]?.attempts); quiz={id,form,questions:L.lessonQuestions(id,form),index:0,answers:[],day:L.dateKey(),result:null}; render(); }
  function audioButtons(text){return `<div class="actions audio-controls">${btn('听发音','audio-play',`data-text="${esc(text)}"`,'small secondary')}${btn('慢速听','audio-play',`data-text="${esc(text)}" data-rate="0.75"`,'small secondary')}</div>`;}
  function speakText(text,rate=1){window.HolaAudio.play(text,rate);}
  function speak(){if(session?.items[session.index])speakText(session.items[session.index].spanish);}
  function exportBackup() {
    if (storageFailed) return notify('记录暂未读取，暂不导出空备份。');
    downloadBackup(state);
  }
  function downloadBackup(value, suffix = '') {
    const filename = `hola-${L.dateKey()}${suffix ? '-' + suffix : ''}.json`;
    if (window.HolaAndroid?.saveBackup) {
      try { window.HolaAndroid.saveBackup(JSON.stringify(value, null, 2), filename); }
      catch { notify('备份未能导出，请重试。'); }
      return;
    }
    const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
    const link=document.createElement('a'); link.href=url; link.download=`hola-${L.dateKey()}${suffix ? "-" + suffix : ""}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
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
        if(!window.confirm(`导入 ${Object.keys(imported.reviews).length} 个词汇的记录将替换当前设备的进度。建议先导出当前备份。继续导入？`))return;
        account.write(imported, true); queueSync(); state=imported; storageFailed=false; session=null; quiz=null; render(); notify('学习记录已导入。');
      }catch(error){notify(`导入失败：${error.message}`);}
    }; input.click();
  }
  root.addEventListener('click',event=> {
    const element=event.target.closest('[data-action]'); if(!element||element.disabled)return;
    const action=element.dataset.action;
    if(['begin-quiz','foundation-begin','drill-begin','noun-begin','begin-word-quiz','drill-words','drill-article','bank-level','bank-page'].includes(action))window.HolaAudio.stop();
    if(action.startsWith('account-')){accountAction(action);return;}
    if(action==='study'){startSession(element.dataset.pack||'');navigate('study');}
    else if(action==='practice-continue'){const p=L.practiceSummary(state);if(p.wrong){drillReview={phase:'setup',level:''};navigate('drill-review');}else{drillQuiz=null;drillEditor=null;navigate(p.next?`drill/${p.next.id}`:'drills');}}
    else if(action==='practice-level'){drillLevel=element.dataset.level;drillQuiz=null;drillEditor=null;navigate('drills');}
    else if(action==='today'){navigate('today');}
    else if(action==='month'){monthDay=0;navigate('first-month');}
    else if(action==='month-start'){if(commit(s=>L.startJourney(s,L.dateKey())))render();}
    else if(action==='month-current'){monthDay=0;render();}
    else if(action==='week-guide'||action==='month-target')openLearningTarget(element.dataset.kind,element.dataset.id);
    else if(action==='drill-review'){drillReview={phase:'setup',level:''};navigate('drill-review');}
    else if(action==='review-level'){drillReview.level=element.dataset.level;render();}
    else if(action==='review-begin')beginDrillReview();
    else if(action==='review-answer')submitDrillReview(element.dataset.answer);
    else if(action==='review-submit')submitDrillReview(drillReview&&drillReview.input);
    else if(action==='review-accent'){const input=document.getElementById('review-answer');if(!input||input.disabled)return;const start=input.selectionStart,end=input.selectionEnd;if(input.value.length-(end-start)>=500)return;drillReview.input=input.value.slice(0,start)+element.dataset.char+input.value.slice(end);render();const updated=document.getElementById('review-answer');updated.focus();updated.setSelectionRange(start+1,start+1);}
    else if(action==='review-next'){if(!drillReview||drillReview.phase!=='quiz'||!drillReview.feedback)return;drillReview.index++;drillReview.feedback=null;drillReview.input='';drillReview.showHint=false;if(drillReview.index===drillReview.items.length)drillReview.phase='result';render();}
    else if(action==='review-setup'){drillReview.phase='setup';render();}
    else if(action==='drills'){if(drillEditor)drillLevel=L.drillPacks.find(p=>p.id===drillEditor.id).level;drillQuiz=null;drillEditor=null;navigate('drills');}
    else if(action==='drills-level'){drillLevel=element.dataset.level;render();}
    else if(action==='drill'){drillQuiz=null;drillEditor=null;navigate(`drill/${element.dataset.id}`);}
    else if(action==='drill-begin'){
      const id=element.dataset.id;if(!L.drillUnlocked(state,id))return notify('先完成前一包，正确率至少 75%。');
      const form=L.practiceForm(state.drills[id]?.attempts);drillQuiz=L.createExerciseSession(id,L.drillQuestions(id,form),form);render();window.scrollTo(0,0);
    }
    else if(action==='drill-answer')submitDrillAnswer(element.dataset.answer);
    else if(action==='drill-submit')submitDrillAnswer(drillQuiz&&drillQuiz.input);
    else if(action==='drill-accent'||action==='drill-draft-accent'){
      const draft=action==='drill-draft-accent',input=document.getElementById(draft?'drill-draft':'drill-answer');
      if(!input||input.disabled||!drillEditor||!L.drillUnlocked(state,drillEditor.id))return;
      const start=input.selectionStart,end=input.selectionEnd,limit=draft?3000:500;
      if(input.value.length-(end-start)>=limit)return;
      const value=input.value.slice(0,start)+element.dataset.char+input.value.slice(end);
      if(draft){drillEditor.text=value;drillEditor.dirty=true;drillEditor.showModel=false;}else drillQuiz.input=value;
      render();const updated=document.getElementById(draft?'drill-draft':'drill-answer');updated.focus();updated.setSelectionRange(start+1,start+1);
    }
    else if(action==='drill-hint'||action==='noun-hint'||action==='review-hint'){
      const active=action==='drill-hint'?drillQuiz:action==='noun-hint'?nounQuiz:drillReview;
      if(!active||active.feedback||active.result)return;
      active.showHint=!active.showHint;render();
    }
    else if(action==='drill-next'){
      if(!drillQuiz||!drillQuiz.feedback||drillQuiz.result)return;
      if(!L.drillUnlocked(state,drillQuiz.id))return notify('请先完成前面的练习包。');
      if(L.advanceExercise(drillQuiz,(id,answers)=>commit(s=>L.gradeDrill(s,id,answers,drillQuiz.form))))render();
    }
    else if(action==='drill-output'){drillQuiz=null;render();document.getElementById('drill-draft').focus();}
    else if(action==='drill-save'){
      if(!drillEditor||!L.drillUnlocked(state,drillEditor.id))return;
      const d=commit(s=>L.saveDrillDraft(s,drillEditor.id,drillEditor.text));if(d){Object.assign(drillEditor,{saved:true,dirty:false,revisions:d.revisions,checks:d.checks,hasPrevious:typeof d.previousText==='string'});render();}
    }
    else if(action==='drill-reset'){const d=state.drillDrafts[drillEditor.id];Object.assign(drillEditor,{text:d?d.text:'',dirty:false,showModel:false,checks:d?d.checks:[]});render();}
    else if(action==='drill-revert'){if(!drillEditor||drillEditor.dirty)return;const d=commit(s=>L.revertDrillDraft(s,drillEditor.id));if(d){Object.assign(drillEditor,{text:d.text,revisions:d.revisions,checks:d.checks,hasPrevious:typeof d.previousText==='string',dirty:false,showModel:false});render();}}
    else if(action==='drill-section'){
      const section=document.getElementById('drill-'+element.dataset.section);if(section){section.focus({preventScroll:true});section.scrollIntoView({block:'start'});}
    }
    else if(['drill-words','drill-dialogue','drill-meaning','drill-evidence','drill-article','drill-article-evidence'].includes(action)){
      if(!drillEditor)return;
      const key={'drill-words':'showWords','drill-dialogue':'showDialogue','drill-meaning':'showMeaning','drill-evidence':'showEvidence','drill-article':'showArticle','drill-article-evidence':'showArticleEvidence'}[action];
      drillEditor[key]=!drillEditor[key];render();root.querySelector(`[data-action="${action}"]`).focus({preventScroll:true});
    }
    else if(action==='drill-model'){if(!drillEditor||drillEditor.dirty||!drillEditor.saved||!drillEditor.text.trim()||!L.drillUnlocked(state,drillEditor.id))return;drillEditor.showModel=!drillEditor.showModel;render();}
    else if(action==='nouns'){nounQuiz=null;navigate('nouns');}
    else if(action==='noun'){nounQuiz=null;navigate(`noun/${element.dataset.id}`);}
    else if(action==='noun-begin'){if(!L.nounLessons.some(n=>n.id===element.dataset.id))return;const id=element.dataset.id,form=L.practiceForm(state.nounPractice[id]?.attempts);nounQuiz=L.createExerciseSession(id,L.nounQuestions(id,form),form);render();}
    else if(action==='noun-answer')submitNounAnswer(element.dataset.answer);
    else if(action==='noun-submit')submitNounAnswer(nounQuiz&&nounQuiz.input);
    else if(action==='noun-accent'){
      const input=document.getElementById('noun-answer');if(!input||!nounQuiz||nounQuiz.feedback)return;
      const start=input.selectionStart,end=input.selectionEnd;if(input.value.length-(end-start)>=200)return;
      nounQuiz.input=input.value.slice(0,start)+element.dataset.char+input.value.slice(end);render();
      const updated=document.getElementById('noun-answer');updated.focus();updated.setSelectionRange(start+1,start+1);
    }
    else if(action==='noun-next'){
      if(L.advanceExercise(nounQuiz,(id,answers)=>commit(s=>L.gradeNoun(s,id,answers,nounQuiz.form))))render();
    }
    else if(action==='foundations'){foundationQuiz=null;navigate('foundations');}
    else if(action==='foundation'){foundationQuiz=null;navigate(`foundation/${element.dataset.id}`);}
    else if(action==='foundation-relearn'){foundationQuiz=null;navigate('foundation/'+element.dataset.id);}
    else if(action==='foundation-begin'){const id=element.dataset.id,form=L.practiceForm(state.foundations[id]?.attempts);foundationQuiz={id,form,questions:L.foundationQuestions(id,form),index:0,answers:[],result:null};render();}
    else if(action==='foundation-answer'){if(!foundationQuiz||foundationQuiz.answers[foundationQuiz.index]!==undefined)return;foundationQuiz.answers[foundationQuiz.index]=Number(element.dataset.index);render();}
    else if(action==='foundation-next'){if(!foundationQuiz||foundationQuiz.answers[foundationQuiz.index]===undefined)return;const f=L.foundations.find(f=>f.id===foundationQuiz.id);if(foundationQuiz.index+1===f.questions.length){const r=commit(s=>L.gradeFoundation(s,f.id,foundationQuiz.answers,foundationQuiz.form));if(!r)return;foundationQuiz.result=r;}else foundationQuiz.index++;render();}
    else if(action==='foundation-speak'||action==='audio-play')speakText(element.dataset.text,Number(element.dataset.rate)||1);
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
      else wordQuiz.question=nextWordQuestion(wordQuiz.items[wordQuiz.index].id,wordQuiz.mode);
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
      window.HolaAudio.stop();session.index++;session.revealed=false;render();
    }
    else if(action==='begin-quiz')startQuiz(element.dataset.id);
    else if(action==='answer'){if(!quiz||quiz.answers[quiz.index]!==undefined)return;quiz.answers[quiz.index]=Number(element.dataset.index);render();}
    else if(action==='next-question'){
      if(!quiz||quiz.answers[quiz.index]===undefined)return;
      if(quiz.day!==L.dateKey()){startQuiz(quiz.id);return notify('跨日练习，请重新开始本课。');}
      const lesson=C.lessons.find(l=>l.id===quiz.id);
      if(quiz.index+1===lesson.questions.length){const result=commit(draft=>L.gradeLesson(draft,quiz.id,quiz.answers,quiz.day,quiz.form));if(!result)return;quiz.result=result;}
      else quiz.index++;
      render();
    }
    else if(action==='goal'){if(commit(draft=>L.setGoal(draft,Number(element.dataset.goal)))){render();notify('目标已保存；今日已开始的学习目标不变。');}}
    else if(action==='speak')speak();
    else if(action==='reload-records')reloadRecords();
    else if(action==='export')exportBackup();
    else if(action==='import')importBackup();
  });
  root.addEventListener('input',event=> {if(event.target.id==='review-answer'&&drillReview&&!drillReview.feedback)drillReview.input=event.target.value;
    if(event.target.id==='drill-answer'&&drillQuiz&&!drillQuiz.feedback)drillQuiz.input=event.target.value;
    if(event.target.id==='drill-draft'&&drillEditor){drillEditor.text=event.target.value;drillEditor.dirty=true;drillEditor.showModel=false;document.getElementById('drill-draft-status').textContent='修改尚未保存。此处不自动评分。';const model=root.querySelector('[data-action="drill-model"]');if(model)model.disabled=true;root.querySelectorAll('[data-drill-check]').forEach(c=>c.disabled=true);const actions=root.querySelector('#drill-draft-status + .actions');if(actions)actions.innerHTML=btn('撤销未保存修改','drill-reset','','secondary');const text=root.querySelector('.expression-model');if(text)text.remove();}
 if(event.target.id==='noun-answer'&&nounQuiz&&!nounQuiz.feedback)nounQuiz.input=event.target.value; if(event.target.id==='expression-text'&&expressionEditor){expressionEditor.text=event.target.value;expressionEditor.result=null;expressionEditor.showModel=false;const feedback=document.querySelector('.expression-feedback');if(feedback)feedback.remove();document.getElementById('expression-status').textContent='修改尚未保存。';} if(event.target.id==='spelling-answer' && wordQuiz) wordQuiz.input=event.target.value; if(event.target.id==='bank-search'){window.HolaAudio.stop();const position=event.target.selectionStart;bankQuery=event.target.value;bankPageIndex=0;render();const input=document.getElementById('bank-search');input.focus();input.setSelectionRange(position,position);} if(event.target.id==='word-search'){window.HolaAudio.stop();const position=event.target.selectionStart;query=event.target.value;render();const input=document.getElementById('word-search');input.focus();input.setSelectionRange(position,position);} });
  root.addEventListener('keydown',event=>{if(event.target.id==='review-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitDrillReview(drillReview&&drillReview.input);}if(event.target.id==='drill-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitDrillAnswer(drillQuiz&&drillQuiz.input);}if(event.target.id==='noun-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitNounAnswer(nounQuiz&&nounQuiz.input);}if(event.target.id==='spelling-answer'&&event.key==='Enter'&&!event.isComposing){event.preventDefault();submitWordAnswer(wordQuiz.input);}});
  root.addEventListener('change',event=> {
    if(event.target.id==='month-day'){monthDay=Number(event.target.value);render();rememberLearningPosition();}
    if(event.target.dataset.monthTask){const checked=event.target.checked;const s=L.firstMonthSummary(state,L.dateKey(),monthDay);if(!s.canCheck||!commit(d=>L.setMonthTask(d,monthDay,event.target.dataset.monthTask,checked,L.dateKey())))event.target.checked=!checked;else render();}

    if(event.target.dataset.drillCheck!==undefined&&drillEditor){if(drillEditor.dirty)return;const checks=new Set(drillEditor.checks),i=Number(event.target.dataset.drillCheck);if(event.target.checked)checks.add(i);else checks.delete(i);const d=commit(s=>L.setDrillChecks(s,drillEditor.id,[...checks]));if(d){drillEditor.checks=d.checks;render();}else event.target.checked=!event.target.checked;}
 if(event.target.id==='year-week'){yearWeek=Number(event.target.value);render();rememberLearningPosition();} if(event.target.dataset.skill){const checked=event.target.checked;if(!commit(s=>L.setWeekSkill(s,yearWeek,event.target.dataset.skill,checked,L.dateKey())))event.target.checked=!checked;else render();} if(event.target.id==='level-filter'){window.HolaAudio.stop();levelFilter=event.target.value;unitFilter='';render();} if(event.target.id==='unit-filter'){window.HolaAudio.stop();unitFilter=event.target.value;render();} if(event.target.id==='source-filter'){sourceFilter=event.target.value;render();} });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.account-avatar-wrap')) closeAccountMenu(); });
  document.addEventListener('focusin', event => { if (!event.target.closest('.account-avatar-wrap')) closeAccountMenu(); });
  document.addEventListener('keydown', event => {
    const menu = document.getElementById('account-menu');
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeAccountMenu(true); }
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault(); const items = [...menu.querySelectorAll('[role="menuitem"]')], index = items.indexOf(document.activeElement);
      items[event.key === 'Home' ? 0 : event.key === 'End' ? items.length-1 : (index + (event.key === 'ArrowUp' ? -1 : 1) + items.length) % items.length].focus();
    }
  });
  window.addEventListener('hashchange',()=>{if(route()!=='drill-review')drillReview=null;if(!route().startsWith('drill/')){drillQuiz=null;drillEditor=null;}if(!route().startsWith('noun/'))nounQuiz=null;if(!route().startsWith('foundation/'))foundationQuiz=null;if(!route().startsWith('expression/'))expressionEditor=null;if(route()!=='study')session=null;if(route()!=='word-quiz')wordQuiz=null;if(!route().startsWith('lesson/'))quiz=null;render();rememberLearningPosition();window.scrollTo(0,0);});
  window.addEventListener('storage',event=>{try{if(event.key===window.HolaAccount.SESSION){location.reload();return;}if(event.key===account.key()){state=event.key===KEY?readStored(event.newValue):readStored();storageFailed=false;render();}}catch{storageFailed=true;render();notify('另一个窗口的记录未能读取，旧记录不会被覆盖。');}});
  window.addEventListener('online', () => account.sync().then(result => { if (result?.downloaded) resetAccountView(); }).catch(() => {}));
  render();
  if (!storageFailed) account.sync().then(result => { if (result?.downloaded) resetAccountView(); }).catch(() => {});
  if(storageFailed)notify('原学习记录未能读取。旧记录尚未覆盖，请先检查浏览器存储。');
})();
