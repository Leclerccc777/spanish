const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
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
  begin() { if (!this.lesson) return; this.answers = []; this.index = 0; this.setData({ phase: 'quiz', question: this.lesson.questions[0], position: 1, input: '', feedback: null, result: null }); },
  input(e) { if (!this.data.feedback) this.setData({ input: e.detail.value }); },
  accent(e) { if (!this.data.feedback && this.data.input.length < 200) this.setData({ input: this.data.input + e.currentTarget.dataset.char }); },
  choose(e) { this.answer(e.currentTarget.dataset.answer); },
  submit() { this.answer(this.data.input); },
  answer(answer) {
    if (this.data.phase !== 'quiz' || this.data.feedback) return;
    if (typeof answer !== 'string' || !answer.trim()) return wx.showToast({ title: '请先填写答案', icon: 'none' });
    const feedback = L.evaluateNounAnswer(this.lesson.id, this.index, answer);
    this.answers[this.index] = answer;
    this.setData({ input: answer, feedback });
  },
  next() {
    if (this.data.phase !== 'quiz' || !this.data.feedback) return;
    if (this.index + 1 === this.lesson.questions.length) {
      const result = S.commit(s => L.gradeNoun(s, this.lesson.id, this.answers));
      if (result) { this.setData({ phase: 'result', result }); this.refresh(); }
      return;
    }
    this.index++;
    this.setData({ question: this.lesson.questions[this.index], position: this.index + 1, input: '', feedback: null });
  },
  menu() { this.setData({ phase: 'menu' }); this.refresh(); },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  foundations() { wx.navigateTo({ url: '/pages/foundations/index?id=agreement' }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
