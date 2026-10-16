const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: { phase: 'setup', level: '', input: '', feedback: null },
  onLoad(options = {}) { if (['A1','A2','B1','B2'].includes(options.level)) this.setData({ level: options.level }); this.refresh(); },
  refresh() { this.setData({ count: L.drillWrongQuestions(S.load(), this.data.level).length }); },
  select(e) { this.setData({ level: e.currentTarget.dataset.level }); this.refresh(); },
  begin() {
    this.items = L.drillReviewQueue(S.load(), this.data.level); this.index = 0; this.retries = new Set(); this.answered = new Set(); this.firstCorrect = 0;
    this.setData({ original: this.items.length, phase: this.items.length ? 'quiz' : 'empty' });
    if (this.items.length) this.show();
  },
  show() { this.setData({ question: this.items[this.index], position: this.index + 1, total: this.items.length, input: '', feedback: null, showHint: false }); },
  hint() { if (this.data.phase === 'quiz' && !this.data.feedback) this.setData({ showHint: !this.data.showHint }); },
  input(e) { if (!this.data.feedback) this.setData({ input: e.detail.value }); },
  accent(e) { if (!this.data.feedback && this.data.input.length < 500) this.setData({ input: this.data.input + e.currentTarget.dataset.char }); },
  choose(e) { this.answer(e.currentTarget.dataset.answer); },
  submit() { this.answer(this.data.input); },
  answer(answer) {
    if (this.data.phase !== 'quiz' || this.data.feedback) return;
    if (typeof answer !== 'string' || !answer.trim()) return wx.showToast({ title: '请先填写答案', icon: 'none' });
    const q = this.items[this.index];
    if (!L.drillUnlocked(S.load(), q.packId)) return wx.showToast({ title: '练习进度已变化，请重新开始', icon: 'none' });
    const result = S.commit(s => L.reviewDrillMistake(s, q.id, answer, q.form || 0));
    if (!result) return;
    if (!this.answered.has(q.id)) { this.answered.add(q.id); if (result.correct) this.firstCorrect++; }
    if (!result.correct && !this.retries.has(q.id)) { this.items.push(L.nextDrillReviewQuestion(q)); this.retries.add(q.id); }
    this.setData({ input: answer, feedback: result, total: this.items.length });
  },
  next() {
    if (this.data.phase !== 'quiz' || !this.data.feedback) return;
    this.index++;
    if (this.index === this.items.length) { this.setData({ phase: 'result', score: Math.round(this.firstCorrect / this.data.original * 100), firstCorrect: this.firstCorrect }); this.refresh(); }
    else this.show();
  },
  setup() { this.setData({ phase: 'setup' }); this.refresh(); },
  back() { wx.redirectTo({ url: '/pages/drills/index' }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
