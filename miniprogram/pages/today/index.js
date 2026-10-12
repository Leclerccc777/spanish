const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  data: {},
  onShow() { const state = S.load(); const summary = L.summary(state); this.setData({ ...summary, practice:L.practiceSummary(state), foundationPassed:L.foundationProgress(state).filter(f=>f.passed).length, year:L.yearSummary(state,L.dateKey()), unitProgress: L.unitProgress(state, summary.unit.id) }); },
  foundations(){wx.navigateTo({url:'/pages/foundations/index'});},
  nouns(){wx.navigateTo({url:'/pages/nouns/index'});},
  drills(){wx.navigateTo({url:'/pages/drills/index'});},
  month(){wx.navigateTo({url:'/pages/firstmonth/index'});},
  continuePractice(){const p=L.practiceSummary(S.load());wx.navigateTo({url:p.wrong?'/pages/drillreview/index':p.next?`/pages/drills/index?id=${p.next.id}`:'/pages/drills/index'});},
  year(){wx.navigateTo({url:'/pages/year/index'});},
  bank() {wx.navigateTo({url:'/pages/bank/index'});},
  study() { wx.navigateTo({ url: '/pages/session/index' }); },
  grammar() { wx.navigateTo({ url: `/pages/lesson/index?id=${L.course.lessons.find(l => l.unitId === this.data.unit.id).id}` }); },
  expression() { wx.navigateTo({url: `/pages/expression/index?id=${L.course.tasks.find(t=>t.unitId===this.data.unit.id).id}`}); },
  roadmap() { wx.switchTab({ url: '/pages/grammar/index' }); }
});
