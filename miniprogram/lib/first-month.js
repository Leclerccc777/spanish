const firstMonthDays = require('../data/first-month');
const J = require('./journey');
const taskIds = new Set(['recall', 'focus', 'output']);
function firstMonthSummary(state, today, requestedDay = 0) {
  const year = J.yearSummary(state, today);
  if (!Number.isInteger(requestedDay) || requestedDay < 0 || requestedDay > 28) throw new Error('请选择前 28 天的任务');
  const suggestedDay = Math.max(1, Math.min(28, year.day));
  const selectedDay = requestedDay || suggestedDay, plan = firstMonthDays[selectedDay - 1];
  const record = state.monthChecks[selectedDay] || { tasks: [] };
  return { started: year.started, startDate: year.startDate, elapsed: year.day, suggestedDay, selectedDay, plan,
    canCheck: year.started && year.day >= selectedDay,
    tasks: plan.tasks.map(t => ({ ...t, checked: record.tasks.includes(t.id) })),
    completedDays: Object.values(state.monthChecks).filter(r => [...taskIds].every(id => r.tasks.includes(id))).length };
}
function setMonthTask(state, day, taskId, checked, today) {
  const summary = firstMonthSummary(state, today, day);
  if (!summary.canCheck || day < 1 || !taskIds.has(taskId) || typeof checked !== 'boolean') throw new Error('请在开始计划后记录当前或过去的任务');
  const tasks = new Set((state.monthChecks[day] || { tasks: [] }).tasks);
  if (checked) tasks.add(taskId); else tasks.delete(taskId);
  state.monthChecks[day] = { date: today, tasks: [...tasks] };
  return state.monthChecks[day];
}
function restoreMonthChecks(raw, journey) {
  const clean = {};
  if (!journey.startDate) return clean;
  for (const [key, r] of Object.entries(raw || {})) {
    const day = Number(key);
    if (!Number.isInteger(day) || day < 1 || day > 28 || String(day) !== key || !r || !J.validDate(r.date) || r.date < journey.startDate || !Array.isArray(r.tasks)) continue;
    const elapsed = Math.floor((Date.parse(r.date + 'T12:00:00Z') - Date.parse(journey.startDate + 'T12:00:00Z')) / 86400000) + 1;
    if (day > elapsed) continue;
    clean[key] = { date: r.date, tasks: [...new Set(r.tasks.filter(id => taskIds.has(id)))] };
  }
  return clean;
}
module.exports = { firstMonthDays, firstMonthSummary, setMonthTask, restoreMonthChecks };
