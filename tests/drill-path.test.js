const { test } = require('node:test');
const assert = require('node:assert/strict');
const L = require('../miniprogram/lib/learning');
const path = require('../miniprogram/data/drill-path');

test('推荐路线能从空记录逐包完成，同级巩固先于升级，预览不写记录', () => {
  const state = L.emptyState(), visited = [];
  for (const id of path.order) {
    const before = structuredClone(state), pack = L.nextDrillPack(state);
    assert.equal(pack.id, id);
    assert.equal(L.drillUnlocked(state, id), true);
    L.drillProgress(state); assert.deepEqual(state, before);
    visited.push(id); L.gradeDrill(state, id, pack.questions.map(q => q.answers[0]));
    assert.deepEqual(L.restore(JSON.parse(JSON.stringify(state))), state);
  }
  assert.equal(new Set(visited).size, 24);
  assert.equal(L.nextDrillPack(state), null);
  assert.deepEqual(state.days, {});
});

test('全部阅读依据和词组能在原文定位，四篇文章逐级增长', () => {
  let previousWords = 0;
  for (const pack of L.drillPacks) {
    assert.equal(pack.readingGuide.length, 3);
    assert.ok(pack.reading.includes(pack.readingGuide[1]), pack.id);
    assert.ok(pack.levelGuide.preparation && pack.levelGuide.strategy && pack.levelGuide.milestone);
    if (!pack.article) continue;
    const a = pack.article, text = a.paragraphs.join(' '), words = text.split(/\s+/).length;
    assert.ok(words > previousWords); previousWords = words;
    assert.ok(a.paragraphs.length >= 2 && a.checks.length === 3 && a.response);
    for (const [word, meaning] of a.words) { assert.ok(text.toLowerCase().includes(word.toLowerCase()), word); assert.ok(meaning); }
    for (const [question, evidence, explanation] of a.checks) { assert.ok(question && explanation); assert.ok(text.includes(evidence), evidence); }
  }
  assert.equal(L.drillPacks.filter(p => p.article).length, 4);
});

test('旧核心路线的开放、草稿及上一版本在建议重排后保留', () => {
  const state = L.emptyState();
  for (const p of L.drillPacks.filter(p => p.branch === 'core')) L.gradeDrill(state, p.id, p.questions.map(q => q.answers[0]));
  L.saveDrillDraft(state, 'b2-report', 'Primera versión.');
  L.saveDrillDraft(state, 'b2-report', 'Otra versión.');
  L.setDrillChecks(state, 'b2-report', [0]);
  const restored = L.restore(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state);
  assert.equal(L.nextDrillPack(restored).id, 'a1-greetings');
  assert.equal(L.nextDrillPack(restored, 'b2-report').id, 'b2-specific');
  assert.ok(L.drillPacks.filter(p => p.branch === 'core').every(p => L.drillUnlocked(restored, p.id)));
});
