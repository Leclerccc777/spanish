const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: { phase: 'menu', level: 'A1', input: '', feedback: null, text: '', dirty: false, saved: false, showModel: false },
  onLoad(options = {}) { this.refresh(); if (options.id) this.open({ currentTarget: { dataset: { id: options.id } } }); },
  onShow() { this.refresh(); },
  refresh() { const state = S.load(); this.setData({ packs: L.drillProgress(state).filter(p => p.level === this.data.level), wrongCount: L.drillWrongQuestions(state).length }); },
  review() { wx.navigateTo({ url: '/pages/drillreview/index' }); },
  select(e) { if (!['A1','A2','B1','B2'].includes(e.currentTarget.dataset.level)) return; this.setData({ level: e.currentTarget.dataset.level }); this.refresh(); },
  open(e) {
    const pack = L.drillPacks.find(p => p.id === e.currentTarget.dataset.id);
    if (!pack) return wx.showToast({ title: '没有找到练习包', icon: 'none' });
    const state = S.load(), draft = state.drillDrafts[pack.id];
    this.pack = pack;
    this.setData({ phase: 'read', pack, level: pack.level, unlocked: L.drillUnlocked(state, pack.id), previous: L.drillPacks.find(p => p.id === pack.previousId) || null,
      references: [...new Map(pack.references.map(r => [r.sourceId + r.section, { ...r, ...L.course.sources.find(s => s.id === r.sourceId) }])).values()],
      text: draft ? draft.text : '', hasText: !!draft && !!draft.text.trim(), saved: !!draft, revisions: draft ? draft.revisions : 0, checks: draft ? draft.checks : [], hasPrevious: !!draft && typeof draft.previousText === 'string', dirty: false, showModel: false, result: null });
    this.showChecks(draft ? draft.checks : []);
  },
  begin() {
    if (!this.pack || !L.drillUnlocked(S.load(), this.pack.id)) return wx.showToast({ title: '先完成前一包，正确率至少 75%', icon: 'none' });
    this.answers = []; this.index = 0;
    this.setData({ phase: 'quiz', question: this.pack.questions[0], position: 1, input: '', feedback: null, result: null });
  },
  input(e) { if (!this.data.feedback) this.setData({ input: e.detail.value }); },
  accent(e) { if (!this.data.feedback && this.data.input.length < 500) this.setData({ input: this.data.input + e.currentTarget.dataset.char }); },
  choose(e) { this.answer(e.currentTarget.dataset.answer); },
  submit() { this.answer(this.data.input); },
  answer(answer) {
    if (this.data.phase !== 'quiz' || this.data.feedback) return;
    if (typeof answer !== 'string' || !answer.trim()) return wx.showToast({ title: '请先填写答案', icon: 'none' });
    this.answers[this.index] = answer;
    this.setData({ input: answer, feedback: L.evaluateDrillAnswer(this.pack.id, this.index, answer) });
  },
  next() {
    if (this.data.phase !== 'quiz' || !this.data.feedback) return;
    if (!L.drillUnlocked(S.load(), this.pack.id)) return wx.showToast({ title: '请先完成前面的练习包', icon: 'none' });
    if (this.index === this.pack.questions.length - 1) {
      const result = S.commit(s => L.gradeDrill(s, this.pack.id, this.answers));
      if (result) { this.setData({ phase: 'result', result, nextPack: L.nextDrillPack(S.load(), this.pack.id) }); this.refresh(); }
      return;
    }
    this.index++;
    this.setData({ question: this.pack.questions[this.index], position: this.index + 1, input: '', feedback: null });
  },
  draft(e) { this.setData({ text: e.detail.value, hasText: !!e.detail.value.trim(), dirty: true, showModel: false }); },
  draftAccent(e) { if (this.data.unlocked && this.data.text.length < 3000) this.setData({ text: this.data.text + e.currentTarget.dataset.char, hasText: true, dirty: true, showModel: false }); },
  showChecks(checks) { this.setData({ checks, rubricRows: this.pack.output.rubric.map((label, index) => ({ label, index, checked: checks.includes(index) })) }); },
  save() {
    if (!this.pack || !L.drillUnlocked(S.load(), this.pack.id)) return;
    const draft = S.commit(s => L.saveDrillDraft(s, this.pack.id, this.data.text));
    if (draft) { this.setData({ saved: true, dirty: false, revisions: draft.revisions, hasPrevious: typeof draft.previousText === 'string' }); this.showChecks(draft.checks); }
  },
  checks(e) {
    if (this.data.dirty || !this.data.hasText) return;
    const draft = S.commit(s => L.setDrillChecks(s, this.pack.id, e.detail.value.map(Number)));
    this.showChecks(draft ? draft.checks : (S.load().drillDrafts[this.pack.id] || { checks: [] }).checks);
  },
  resetDraft() { const draft = S.load().drillDrafts[this.pack.id]; this.setData({ text: draft ? draft.text : '', hasText: !!draft && !!draft.text.trim(), dirty: false, showModel: false }); this.showChecks(draft ? draft.checks : []); },
  revertDraft() {
    if (this.data.dirty) return;
    const draft = S.commit(s => L.revertDrillDraft(s, this.pack.id));
    if (draft) { this.setData({ text: draft.text, hasText: !!draft.text.trim(), revisions: draft.revisions, hasPrevious: typeof draft.previousText === 'string', saved: true, dirty: false, showModel: false }); this.showChecks(draft.checks); }
  },
  model() {
    if (!this.data.saved || this.data.dirty || !this.data.text.trim()) return wx.showToast({ title: '先写自己的表达并保存草稿', icon: 'none' });
    this.setData({ showModel: !this.data.showModel });
  },
  output() { this.setData({ phase: 'read' }); },
  menu() { this.setData({ phase: 'menu' }); this.refresh(); },
  continuePack() { const next = L.nextDrillPack(S.load(), this.pack.id); if (next) this.open({ currentTarget: { dataset: { id: next.id } } }); },
  previous() { if (this.pack.previousId) this.open({ currentTarget: { dataset: { id: this.pack.previousId } } }); },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
