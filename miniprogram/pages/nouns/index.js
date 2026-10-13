const L = require('../../lib/learning');
const S = require('../../lib/storage');
const exercisePage = require('../../lib/exercise-page');
Page({
  ...exercisePage({
    storage: S, platform: wx, itemKey: 'lesson', maxLength: 200,
    evaluate: L.evaluateNounAnswer, grade: L.gradeNoun
  }),
  data: { phase: 'menu', input: '', feedback: null },
  onLoad(options = {}) { this.refresh(); if (options.id) this.open({ currentTarget: { dataset: { id: options.id } } }); },
  onShow() { this.refresh(); },
  refresh() { this.setData({ lessons: L.nounProgress(S.load()) }); },
  open(e) {
    const lesson = L.nounLessons.find(n => n.id === e.currentTarget.dataset.id);
    if (!lesson) return wx.showToast({ title: '没有找到名词练习', icon: 'none' });
    this.lesson = lesson;
    this.setData({ phase: 'read', lesson, dictionaryUrl: L.findWord(lesson.id).dictionaryUrl, references: lesson.references.map(r => ({ ...r, ...L.course.sources.find(s => s.id === r.sourceId) })), result: null });
  },
  menu() { this.setData({ phase: 'menu' }); this.refresh(); },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  foundations() { wx.navigateTo({ url: '/pages/foundations/index?id=agreement' }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
