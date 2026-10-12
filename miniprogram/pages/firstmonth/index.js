const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: { selectedDay: 0 },
  onLoad(options = {}) { const day = Number(options.day); if (Number.isInteger(day) && day >= 1 && day <= 28) this.setData({ selectedDay: day }); this.refresh(); },
  onShow() { this.refresh(); },
  refresh() { const summary = L.firstMonthSummary(S.load(), L.dateKey(), this.data.selectedDay); this.setData({ ...summary, dayLabels: L.firstMonthDays.map(d => `第 ${d.day} 天 · ${d.title}`), pickerValue: summary.selectedDay - 1 }); },
  select(e) { this.setData({ selectedDay: Number(e.detail.value) + 1 }); this.refresh(); },
  current() { this.setData({ selectedDay: 0 }); this.refresh(); },
  start() { if (S.commit(s => L.startJourney(s, L.dateKey()))) this.refresh(); },
  check(e) { if (!this.data.canCheck) return; const item = this.data.tasks.find(t => t.id === e.currentTarget.dataset.id); if (item && S.commit(s => L.setMonthTask(s, this.data.selectedDay, item.id, !item.checked, L.dateKey()))) this.refresh(); },
  target() {
    const t = this.data.plan.target;
    if (t.kind === 'lesson' && !L.isUnlocked(S.load(), L.course.lessons.find(l => l.id === t.id).unitId)) return wx.showToast({ title: '先完成课程的词汇与语法前置', icon: 'none' });
    const pages = { foundation: 'foundations', lesson: 'lesson', drill: 'drills', nouns: 'nouns', review: 'drillreview', expression: 'expression' };
    wx.navigateTo({ url: `/pages/${pages[t.kind]}/index?id=${t.id}` });
  },
  study() { wx.navigateTo({ url: '/pages/session/index' }); },
  drills() { wx.navigateTo({ url: '/pages/drills/index' }); },
  year() { wx.navigateTo({ url: '/pages/year/index' }); },
  home() { wx.switchTab({ url: '/pages/today/index' }); }
});
