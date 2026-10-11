const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: {},
  onShow() { const state = S.load(); const summary = L.summary(state); this.setData({ ...summary, unitProgress: L.unitProgress(state, summary.unit.id) }); },
  study() { wx.navigateTo({ url: '/pages/session/index' }); },
  grammar() { wx.navigateTo({ url: `/pages/lesson/index?id=${L.course.lessons.find(l => l.unitId === this.data.unit.id).id}` }); },
  expression() { wx.navigateTo({url: `/pages/expression/index?id=${L.course.tasks.find(t=>t.unitId===this.data.unit.id).id}`}); },
  roadmap() { wx.switchTab({ url: '/pages/grammar/index' }); }
});
