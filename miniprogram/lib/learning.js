const course = require('../data/course');
const SCHEMA = 1;
const PASS_SCORE = 75;
const RATINGS = ['again', 'remember', 'easy'];

function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function addDays(key, days) {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days, 12));
}
function emptyState() { return { version: SCHEMA, goal: 5, reviews: {}, lessons: {}, days: {}, mistakes: {}, wordPractice: {}, wordMistakes: {}, expressions: {} }; }
function restore(raw) {
  const clean = emptyState();
  if (!raw || raw.version !== SCHEMA) return clean;
  if ([3, 5, 10].includes(raw.goal)) clean.goal = raw.goal;
  for (const word of course.words) {
    const r = raw.reviews && raw.reviews[word.id];
    if (r && Number.isInteger(r.interval) && r.interval >= 0 && r.interval <= 365 && /^\d{4}-\d{2}-\d{2}$/.test(r.due) && /^\d{4}-\d{2}-\d{2}$/.test(r.lastReviewed)) {
      clean.reviews[word.id] = { interval: r.interval, due: r.due, lastReviewed: r.lastReviewed, repetitions: Math.max(0, Number(r.repetitions) || 0), confirmed:r.confirmed===true||r.interval>0 };
    }
  }
  const wordIds = new Set(course.words.map(w => w.id));
  const lessonIds = new Set(course.lessons.map(l => l.id));
  for (const lesson of course.lessons) {
    const l = raw.lessons && raw.lessons[lesson.id];
    if (l && Number.isFinite(l.bestScore) && l.bestScore >= 0 && l.bestScore <= 100) clean.lessons[lesson.id] = { bestScore: l.bestScore, attempts: Math.max(1, Number(l.attempts) || 1) };
  }
  for (const [key, day] of Object.entries(raw.days || {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !day || ![3, 5, 10].includes(day.goal)) continue;
    clean.days[key] = { goal: day.goal, words: [...new Set((Array.isArray(day.words) ? day.words : []).filter(id => wordIds.has(id)))], grammar: [...new Set((Array.isArray(day.grammar) ? day.grammar : []).filter(id => lessonIds.has(id)))] };
  }
  const questions = new Set(course.lessons.flatMap(l => l.questions.map(q => q.id)));
  for (const [id, entry] of Object.entries(raw.mistakes || {})) {
    if (questions.has(id) && entry && Number.isInteger(entry.selected) && entry.selected >= 0 && entry.selected < 3) clean.mistakes[id] = entry;
  }
  for (const word of course.words) {
    const practice = raw.wordPractice && raw.wordPractice[word.id];
    if (practice && Number.isInteger(practice.attempts) && practice.attempts > 0 && Number.isInteger(practice.correct) && practice.correct >= 0 && practice.correct <= practice.attempts && /^\d{4}-\d{2}-\d{2}$/.test(practice.lastPracticed)) clean.wordPractice[word.id] = { attempts: practice.attempts, correct: practice.correct, lastPracticed: practice.lastPracticed };
    const mistake = raw.wordMistakes && raw.wordMistakes[word.id];
    if (mistake && ['meaning', 'spelling'].includes(mistake.mode) && typeof mistake.answer === 'string' && mistake.answer.length <= 200 && /^\d{4}-\d{2}-\d{2}$/.test(mistake.date)) clean.wordMistakes[word.id] = { mode: mistake.mode, answer: mistake.answer, date: mistake.date };
  }
  for (const task of course.tasks) {
    const entry = raw.expressions && raw.expressions[task.id];
    if (entry && typeof entry.text === 'string' && entry.text.length <= 6000 && /^\d{4}-\d{2}-\d{2}$/.test(entry.updated) && Number.isInteger(entry.attempts) && entry.attempts >= 0) {
      clean.expressions[task.id] = {text:entry.text, updated:entry.updated, attempts:entry.attempts};
      if(entry.attempts>0&&typeof entry.submittedText==='string'&&entry.submittedText.length<=6000)clean.expressions[task.id].submittedText=entry.submittedText;
    }
  }
  return clean;
}
function dayRecord(state, today) {
  if (!state.days[today]) state.days[today] = { goal: state.goal, words: [], grammar: [] };
  return state.days[today];
}
function unitProgress(state, unitId) {
  const words = course.words.filter(w => w.unitId === unitId);
  const learned = words.filter(w => state.reviews[w.id]).length;
  const lesson = course.lessons.find(l => l.unitId === unitId);
  const passed = !!(state.lessons[lesson.id] && state.lessons[lesson.id].bestScore >= PASS_SCORE);
  const ready = words.filter(w => state.reviews[w.id] && (state.reviews[w.id].confirmed || state.reviews[w.id].interval > 0)).length;
  return { learned, ready, total: words.length, passed, complete: passed && ready >= Math.ceil(words.length * 0.6) };
}
function isUnlocked(state, unitId) {
  const index = course.units.findIndex(u => u.id === unitId);
  return index >= 0 && course.units.slice(0, index).every(u => unitProgress(state, u.id).complete);
}
function currentUnit(state) {
  return course.units.find(u => isUnlocked(state, u.id) && !unitProgress(state, u.id).complete) || course.units[course.units.length - 1];
}
function queue(state, today = dateKey(), limit) {
  const day = state.days[today];
  const count = limit || (day && day.goal) || state.goal;
  const eligible = course.words.filter(w => isUnlocked(state, w.unitId));
  const due = eligible.filter(w => state.reviews[w.id] && state.reviews[w.id].due <= today).sort((a, b) => state.reviews[a.id].due.localeCompare(state.reviews[b.id].due));
  const fresh = eligible.filter(w => !state.reviews[w.id]);
  const practice = eligible.filter(w => state.reviews[w.id] && state.reviews[w.id].due > today).sort((a, b) => state.reviews[a.id].lastReviewed.localeCompare(state.reviews[b.id].lastReviewed));
  // 未完成每日目标时，优先选今天尚未计数的词；到期但答错的词仍保留在前面。
  const counted = new Set(day ? day.words : []);
  const prioritized = [...due, ...fresh, ...practice.filter(w => !counted.has(w.id)), ...practice.filter(w => counted.has(w.id))];
  return prioritized.slice(0, count);
}
function review(state, wordId, rating, today = dateKey(), credit = true) {
  const word = course.words.find(w => w.id === wordId);
  if (!word || !RATINGS.includes(rating) || !isUnlocked(state, word.unitId)) throw new Error('无效的词汇复习');
  const previous = state.reviews[wordId] || { interval: 0, repetitions: 0 };
  // 当天重复练习可订正遗忘，但不会靠反复点击拉长间隔。
  const sameDay = previous.lastReviewed === today && previous.interval > 0;
  let interval = rating === 'again' ? 0 : rating === 'easy' ? Math.max(3, previous.interval * 3) : Math.max(1, previous.interval * 2);
  if (sameDay && rating !== 'again') interval = previous.interval;
  interval = Math.min(365, interval);
  state.reviews[wordId] = { interval, due: addDays(today, interval), lastReviewed: today, repetitions: previous.repetitions + 1, confirmed:!!previous.confirmed||previous.interval>0||rating!=='again' };
  const day = dayRecord(state, today);
  if (credit && !day.words.includes(wordId)) day.words.push(wordId);
  return state;
}
function normalizeWord(text) { return text.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' '); }
function acceptedSpellings(word) { return word.spanish.split('/').map(normalizeWord); }
function wordQuestion(wordId, mode = 'meaning', random = Math.random) {
  const word = course.words.find(w => w.id === wordId);
  if (!word || !['meaning', 'spelling'].includes(mode)) throw new Error('无效的词汇题');
  if (mode === 'spelling') return { wordId, mode, prompt: word.meaning, hint: `本词卡首字母 ${acceptedSpellings(word)[0][0]} · ${word.pos}`, options: [] };
  const choices = [word.meaning];
  // 优先取同单元干扰项；去除重复释义，以免两项都正确。
  const candidates = [...course.words.filter(w => w.unitId === word.unitId), ...course.words.filter(w => w.unitId !== word.unitId)].filter(w => w.meaning !== word.meaning);
  for (const candidate of candidates) { if (!choices.includes(candidate.meaning)) choices.push(candidate.meaning); if (choices.length === 4) break; }
  for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
  return { wordId, mode, prompt: word.spanish, options: choices };
}
function practiceWord(state, wordId, answer, mode, today = dateKey()) {
  const word = course.words.find(w => w.id === wordId);
  if (!word || !isUnlocked(state, word.unitId) || !['meaning', 'spelling'].includes(mode) || typeof answer !== 'string' || !answer.trim() || answer.length > 200) throw new Error('请作答已解锁的词汇');
  const normalized = normalizeWord(answer);
  const forms = acceptedSpellings(word);
  const correct = mode === 'meaning' ? normalized === normalizeWord(word.meaning) : forms.includes(normalized);
  const stripAccents = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const accentHint = mode === 'spelling' && !correct && forms.some(form => stripAccents(form) === stripAccents(normalized));
  const prior = state.wordPractice[wordId] || { attempts: 0, correct: 0 };
  state.wordPractice[wordId] = { attempts: prior.attempts + 1, correct: prior.correct + (correct ? 1 : 0), lastPracticed: today };
  review(state, wordId, correct ? 'remember' : 'again', today, correct);
  if (correct) delete state.wordMistakes[wordId];
  else state.wordMistakes[wordId] = { mode, answer: answer.trim(), date: today };
  return { correct, accentHint, answer: mode === 'meaning' ? word.meaning : word.spanish, explanation: `${word.example} — ${word.translation}` };
}
function wrongWords(state) { return course.words.filter(w => state.wordMistakes[w.id]).map(w => ({ ...w, ...state.wordMistakes[w.id] })); }
function gradeLesson(state, lessonId, answers, today = dateKey()) {
  const lesson = course.lessons.find(l => l.id === lessonId);
  if (!lesson || !isUnlocked(state, lesson.unitId) || !Array.isArray(answers) || answers.length !== lesson.questions.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= lesson.questions[i].options.length)) throw new Error('请完整作答已解锁课程');
  const correct = lesson.questions.filter((q, i) => q.answer === answers[i]).length;
  const score = Math.round(100 * correct / lesson.questions.length);
  const previous = state.lessons[lessonId] || { bestScore: 0, attempts: 0 };
  const day = dayRecord(state, today);
  state.lessons[lessonId] = { bestScore: Math.max(previous.bestScore, score), attempts: previous.attempts + 1 };
  lesson.questions.forEach((q, i) => {
    if (q.answer === answers[i]) delete state.mistakes[q.id];
    else state.mistakes[q.id] = { lessonId, selected: answers[i], date: today };
  });
  if (score >= PASS_SCORE) {
    if (!day.grammar.includes(lessonId)) day.grammar.push(lessonId);
  }
  return { score, correct, total: lesson.questions.length, passed: score >= PASS_SCORE };
}
function isCheckedIn(day) { return !!day && day.words.length >= day.goal && day.grammar.length >= 1; }
function streak(state, today = dateKey()) {
  let key = isCheckedIn(state.days[today]) ? today : addDays(today, -1);
  let result = 0;
  while (isCheckedIn(state.days[key])) { result++; key = addDays(key, -1); }
  return result;
}
function levelProgress(state) {
  return course.levels.map(level => {
    const units = course.units.filter(u=>u.levelCode===level.id), words=course.words.filter(w=>w.level===level.id);
    return {...level, learned:words.filter(w=>state.reviews[w.id]).length,total:words.length, completed:units.filter(u=>unitProgress(state,u.id).complete).length, unitTotal:units.length, expressions:course.tasks.filter(t=>t.level===level.id&&!t.final&&state.expressions[t.id]&&typeof state.expressions[t.id].submittedText==='string'&&evaluateExpression(t.id,state.expressions[t.id].submittedText).complete).length};
  });
}
function expressionUnlocked(state, taskId) {
  const task=course.tasks.find(t=>t.id===taskId);
  return !!task && (task.final ? course.units.every(u=>unitProgress(state,u.id).complete) : isUnlocked(state,task.unitId));
}
function evaluateExpression(taskId,text) {
  const task=course.tasks.find(t=>t.id===taskId);
  if(!task||typeof text!=='string'||text.length>6000) throw new Error('无效的表达练习');
  const tokens=text.normalize('NFC').toLowerCase().match(/[a-záéíóúüñ]+(?:[-’'][a-záéíóúüñ]+)*/g)||[];
  // 严格按完整西语词/短语匹配，避免“sol”误命中“solución”。保留重音。
  const normalized=` ${tokens.join(' ')} `;
  const contains=form=>normalized.includes(` ${(form.normalize('NFC').toLowerCase().match(/[a-záéíóúüñ]+/g)||[]).join(' ')} `);
  const targets=[...task.targets,...(task.recycled?[{...task.recycled,recycled:true}]:[])].map(t=>({...t,used:t.forms.some(contains)}));
  const sentenceCount=text.split(/[.!?]+/).filter(s=>(s.match(/[a-záéíóúüñ]+/gi)||[]).length>=3).length;
  const paragraphCount=text.trim().split(/\n\s*\n/).filter(p=>p.trim()).length;
  const usedConnectors=task.connectors.filter(contains);
  const checks=[{label:`至少 ${task.minimumWords} 个西语词`,passed:tokens.length>=task.minimumWords},{label:`至少 ${task.minimumSentences} 句（每句至少 3 词）`,passed:sentenceCount>=task.minimumSentences},{label:'使用全部目标词和复习词',passed:targets.every(t=>t.used)}];
  if(task.connectors.length)checks.push({label:'使用至少一个本阶段连接语',passed:usedConnectors.length>0});
  if(task.minimumParagraphs)checks.push({label:`至少 ${task.minimumParagraphs} 段（空行分段）`,passed:paragraphCount>=task.minimumParagraphs});
  return {targets,wordCount:tokens.length,sentenceCount,paragraphCount,usedConnectors,checks,complete:checks.every(c=>c.passed)};
}
function saveExpression(state,taskId,text,submit=false,today=dateKey()) {
  if(!expressionUnlocked(state,taskId))throw new Error('请先完成前面的单元再提交本任务');
  const result=evaluateExpression(taskId,text);
  if(submit&&!text.trim())throw new Error('请先写下你的表达');
  const previous=state.expressions[taskId]||{attempts:0};
  state.expressions[taskId]={text,updated:today,attempts:previous.attempts+(submit?1:0)};
  if(submit)state.expressions[taskId].submittedText=text;
  else if(typeof previous.submittedText==='string')state.expressions[taskId].submittedText=previous.submittedText;
  return result;
}
function summary(state, today = dateKey()) {
  const day = state.days[today] || { goal: state.goal, words: [], grammar: [] };
  const unit = currentUnit(state);
  const learned = Object.keys(state.reviews).length;
  const due = course.words.filter(w => isUnlocked(state, w.unitId) && state.reviews[w.id] && state.reviews[w.id].due <= today).length;
  const grammarPassed = course.lessons.filter(l => state.lessons[l.id] && state.lessons[l.id].bestScore >= PASS_SCORE).length;
  const checkins = Object.values(state.days).filter(isCheckedIn).length;
  return { today, day, unit, learned, due, grammarPassed, checkins, streak: streak(state, today), checkedIn: isCheckedIn(day), wordPercent: Math.min(100, Math.round(day.words.length / day.goal * 100)), wordTotal: course.words.length, lessonTotal: course.lessons.length };
}
function setGoal(state, goal) {
  if (![3, 5, 10].includes(goal)) throw new Error('不支持的每日目标');
  state.goal = goal;
  return state;
}
function mistakes(state) {
  return course.lessons.flatMap(l => l.questions.filter(q => state.mistakes[q.id]).map(q => ({ ...q, lessonId: l.id, lessonTitle: l.title, selected: state.mistakes[q.id].selected })));
}
module.exports = { course, PASS_SCORE, emptyState, restore, dateKey, addDays, unitProgress, isUnlocked, currentUnit, queue, review, gradeLesson, summary, streak, setGoal, mistakes, isCheckedIn, wordQuestion, practiceWord, wrongWords, acceptedSpellings, levelProgress, expressionUnlocked, evaluateExpression, saveExpression };
