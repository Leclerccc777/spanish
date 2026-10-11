const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: { phase: 'read', selected: null },
  onLoad(options) { this.lesson = L.course.lessons.find(l => l.id === options.id); if (!this.lesson || !L.isUnlocked(S.load(), this.lesson.unitId)) return this.setData({ unavailable: true }); this.setData({ lesson: this.lesson, references: this.lesson.references.map(r => ({ ...r, ...L.course.sources.find(s => s.id === r.sourceId) })) }); },
  begin() { if (!this.lesson || this.data.unavailable) return; this.answers = []; this.index = 0; this.day = L.dateKey(); this.setData({ phase: 'quiz', question: this.lesson.questions[0], index: 1, selected: null, result: null }); },
  choose(e) { if (this.data.selected !== null) return; const selected = Number(e.currentTarget.dataset.index); this.answers[this.index] = selected; this.setData({ selected, correct: selected === this.data.question.answer }); },
  next() {
    if (this.data.selected === null) return;
    if (this.day !== L.dateKey()) { wx.showToast({ title: '跨日练习，请重新开始本课', icon: 'none' }); return this.begin(); }
    if (this.index + 1 >= this.lesson.questions.length) {
      const result = S.commit(state => L.gradeLesson(state, this.lesson.id, this.answers, this.day));
      if (result) this.setData({ phase: 'result', result, summary: L.summary(S.load()) });
      return;
    }
    this.index++; this.setData({ question: this.lesson.questions[this.index], index: this.index + 1, selected: null });
  },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
