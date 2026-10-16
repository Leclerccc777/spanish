const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: { phase: 'setup', mode: 'meaning', input: '', result: null, accents: ['á', 'é', 'í', 'ó', 'ú', 'ü', 'ñ'] },
  onLoad(options = {}) { this.previousOptions = new Map(); this.wrongOnly = options.wrong === '1'; this.packId=options.pack; this.setData({ wrongOnly: this.wrongOnly }); },
  mode(e) { this.setData({ mode: e.currentTarget.dataset.mode }); },
  begin() {
    const state = S.load(); this.words = this.wrongOnly ? L.wrongWords(state).filter(w => L.isWordUnlocked(state, w.id)) : this.packId ? L.packQueue(state,this.packId) : L.queue(state);
    this.index = 0; this.firstCorrect = 0; this.answered = new Set(); this.retries = new Set(); this.day = L.dateKey();
    this.setData({ phase: this.words.length ? 'quiz' : 'empty', originalCount: this.words.length }); if (this.words.length) this.showQuestion();
  },
  showQuestion() {
    if (this.index >= this.words.length) return this.setData({ phase: 'result', score: this.data.originalCount ? Math.round(this.firstCorrect / this.data.originalCount * 100) : 0, firstCorrect: this.firstCorrect, summary: L.summary(S.load()) });
    const id=this.words[this.index].id, question=L.wordQuestion(id,this.data.mode,Math.random,this.previousOptions.get(id)||[]);
    if(this.data.mode==='meaning')this.previousOptions.set(id,question.options);
    this.setData({ question, position: this.index + 1, total: this.words.length, input: '', result: null, selected: null });
  },
  input(e) { this.setData({ input: e.detail.value }); },
  accent(e) { if (this.data.phase === 'quiz' && !this.data.result) this.setData({ input: (this.data.input + e.currentTarget.dataset.char).slice(0,200) }); },
  choose(e) { this.answer(this.data.question.options[Number(e.currentTarget.dataset.index)]); },
  submit() { this.answer(this.data.input); },
  answer(value) {
    if (this.data.phase !== 'quiz' || this.data.result) return;
    if (this.day !== L.dateKey()) { wx.showToast({ title: '新的一天到了，请重新开始测验', icon: 'none' }); return this.setData({ phase: 'setup' }); }
    if (typeof value !== 'string' || !value.trim()) return wx.showToast({ title: '请先填写答案', icon: 'none' });
    const word = this.words[this.index]; const result = S.commit(state => L.practiceWord(state, word.id, value, this.data.mode, this.day));
    if (!result) return;
    if (!this.answered.has(word.id)) { if (result.correct) this.firstCorrect++; this.answered.add(word.id); }
    if (!result.correct && !this.retries.has(word.id)) { this.words.push(word); this.retries.add(word.id); }
    this.setData({ result, selected: value, total: this.words.length });
  },
  next() { if (!this.data.result) return; this.index++; this.showQuestion(); },
  home() { wx.switchTab({ url: '/pages/today/index' }); },
  again() { this.setData({ phase: 'setup', result: null }); }
});
