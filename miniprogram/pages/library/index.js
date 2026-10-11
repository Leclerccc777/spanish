const L = require('../../lib/learning');
Page({
  data: { sources: L.course.sources, selected: '全部', categories: ['全部', '课程体系', '能力框架', '语法参考', '词典', '用法参考', '开源词库'] },
  filter(e) { const selected = this.data.categories[Number(e.detail.value)]; this.setData({ selected, sources: L.course.sources.filter(s => selected === '全部' || s.kind === selected) }); },
  copy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.url }); }
});
