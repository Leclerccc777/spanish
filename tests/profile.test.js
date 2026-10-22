const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const TODAY = '2026-10-22';
function completeUnit(state, unit) {
  for (const word of L.course.curriculumWords.filter(w => w.unitId === unit.id).slice(0, 6)) L.review(state, word.id, 'remember', TODAY);
  const lesson = L.course.lessons.find(l => l.unitId === unit.id);
  L.gradeLesson(state, lesson.id, lesson.questions.map(q => q.answer), TODAY);
}
test('账号统计区分真实作答正确率、历史最佳和手工任务，空记录不虚构 0%', () => {
  const state = L.emptyState(); let p = L.profileSummary(state, TODAY);
  assert.equal(p.wordAccuracy, null); assert.equal(p.grammarBest, null); assert.equal(p.completed, 0);
  const word = L.course.words[0];
  L.practiceWord(state, word.id, 'wrong', 'spelling', TODAY);
  L.practiceWord(state, word.id, word.spanish, 'spelling', TODAY);
  const lesson = L.course.lessons[0];
  L.gradeLesson(state, lesson.id, lesson.questions.map((q, i) => i ? q.answer : (q.answer + 1) % q.options.length), TODAY);
  L.gradeLesson(state, lesson.id, lesson.questions.map(q => q.answer), TODAY);
  state.wordPractice.unknown = { attempts: 1, correct: 1 };
  const before = JSON.stringify(state); p = L.profileSummary(state, TODAY);
  assert.equal(p.wordAccuracy, 50); assert.equal(p.wordAttempts, 2); assert.equal(p.grammarBest, 100);
  assert.equal(p.completed, 0); assert.equal(p.learningDays, 1); assert.equal(p.checkins, 0);
  assert.equal(p.levels[0].units[0].attempts, 2); assert.equal(JSON.stringify(state), before);
  const failed = L.emptyState(); L.gradeLesson(failed, lesson.id, lesson.questions.map(q => (q.answer + 1) % q.options.length), TODAY);
  assert.equal(L.profileSummary(failed, TODAY).learningDays, 1); assert.equal(L.profileSummary(failed, TODAY).checkins, 0);
});
test('A 账号完成六关继续第七关，B 账号进入 A2；旧备份不依赖新增位置字段', () => {
  const a = L.emptyState(), b = L.emptyState();
  for (const u of L.course.units.slice(0, 6)) completeUnit(a, u);
  for (const u of L.course.units.slice(0, 8)) completeUnit(b, u);
  assert.equal(L.learningDestination(a, TODAY).id, 'g7'); assert.equal(L.learningDestination(b, TODAY).id, 'g9');
  assert.equal(L.profileSummary(a, TODAY).unit.levelCode, 'A1'); assert.equal(L.profileSummary(b, TODAY).unit.levelCode, 'A2');
  assert.ok(L.setLearningPosition(a, { kind: 'lesson', id: 'g6' }, TODAY));
  assert.equal(L.learningDestination(a, TODAY).id, 'g7');
  assert.equal(L.learningDestination(L.restore(JSON.parse(JSON.stringify(b))), TODAY).id, 'g9');
});
test('学习位置随备份保留草稿，锁定内容、未来任务与任意网址不能作为继续入口', () => {
  const state = L.emptyState();
  assert.equal(L.setLearningPosition(state, { kind: 'lesson', id: 'g9' }, TODAY), false);
  assert.equal(L.setLearningPosition(state, { kind: 'drill', id: 'b2-report' }, TODAY), false);
  assert.equal(L.setLearningPosition(state, { kind: 'month', day: 28 }, TODAY), false);
  assert.equal(L.setLearningPosition(state, { kind: 'url', id: 'https://evil.test' }, TODAY), false);
  L.saveDrillDraft(state, 'a1-place', 'Soy estudiante.');
  assert.ok(L.setLearningPosition(state, { kind: 'drill', id: 'a1-place' }, TODAY));
  const restored = L.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(L.learningDestination(restored, TODAY).route, 'drill/a1-place');
  assert.equal(restored.drillDrafts['a1-place'].text, 'Soy estudiante.');
  const forged = L.restore({ ...state, resume: { kind: 'lesson', id: 'g9', route: 'javascript:evil()' } });
  assert.equal(L.learningDestination(forged, TODAY).id, 'g1'); assert.equal(forged.resume.route, undefined);
  assert.equal(L.restore({ ...state, resume: { kind: 'url', id: 'bad' } }).resume, undefined);
  assert.equal(L.restore({ ...state, resume: { kind: '__proto__', id: 'bad' } }).resume, undefined);
  L.startJourney(state, TODAY); assert.equal(L.setLearningPosition(state, { kind: 'year', week: 52 }, TODAY), false);
  assert.ok(L.setLearningPosition(state, { kind: 'month', day: 1 }, TODAY));
  assert.equal(L.learningDestination(state, TODAY).day, 1); assert.equal(L.isUnlocked(state, 'u2'), false);
});
