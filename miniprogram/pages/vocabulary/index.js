const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  ...require('../../lib/audio').audioPage(wx),
  data: { query: '', filter: 0, expanded: '', filters: ['全部单元', ...L.course.units.map(u => `${u.levelCode} · ${u.number} ${u.topic}`)] },
  onShow() { this.refresh(); },
  refresh() {
    const state = S.load(); const query = this.data.query.toLowerCase().trim();
    const rows = L.course.curriculumWords.filter(w => (!this.data.filter || w.unitId === L.course.units[this.data.filter - 1].id) && `${w.spanish} ${w.meaning}`.toLowerCase().includes(query)).map(w => ({ ...w, noun: L.nounLessons.find(n => n.id === w.id) || null, locked: !L.isUnlocked(state, w.unitId), status: state.reviews[w.id] ? (state.reviews[w.id].due <= L.dateKey() ? '待复习' : '已学习') : '未学习' }));
    this.setData({ words: rows, count: rows.length });
  },
  search(e) { this.stopAudio(); this.setData({ query: e.detail.value }); this.refresh(); },
  filter(e) { this.stopAudio(); this.setData({ filter: Number(e.detail.value) }); this.refresh(); },
  expand(e) { this.stopAudio(); const id = e.currentTarget.dataset.id; this.setData({ expanded: id === this.data.expanded ? '' : id }); },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); },
  bank() { wx.navigateTo({url:'/pages/bank/index'}); },
  quiz() { wx.navigateTo({ url: '/pages/wordquiz/index' }); },
  study() { wx.navigateTo({ url: '/pages/session/index' }); }
});
