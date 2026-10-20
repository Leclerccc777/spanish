const L = require('../../lib/learning');
const S = require('../../lib/storage');
Page({
  onShow() { this.refresh(); },
  refresh() { const state = S.load(); const today = L.dateKey(); this.setData({ ...L.summary(state), practice:L.practiceSummary(state), readFailed: !S.isReadable(), goal: state.goal, mistakes: L.mistakes(state), wrongWords: L.wrongWords(state), calendar: Array.from({ length: 14 }, (_, i) => { const key = L.addDays(today, i - 13); return { key, label: key.slice(5), done: L.isCheckedIn(state.days[key]), today: key === today }; }) }); },
  account() { wx.navigateTo({ url: '/pages/account/index' }); },
  wordRetry() { wx.navigateTo({ url: '/pages/wordquiz/index?wrong=1' }); },
  drills(e) { wx.navigateTo({ url: `/pages/drills/index?level=${e.currentTarget.dataset.level}` }); },
  drillReview() { wx.navigateTo({ url: '/pages/drillreview/index' }); },
  month() { wx.navigateTo({ url: '/pages/firstmonth/index' }); },
  goal(e) { if (S.commit(state => L.setGoal(state, Number(e.currentTarget.dataset.goal)))) { this.refresh(); wx.showToast({ title: '已保存；今日已开始的目标不变', icon: 'none' }); } },
  retry(e) { wx.navigateTo({ url: `/pages/lesson/index?id=${e.currentTarget.dataset.id}` }); },
  exportData() { let state; try { state = S.read(); } catch (error) { return wx.showToast({ title: '记录未读取，暂不导出空备份', icon: 'none' }); } wx.setClipboardData({ data: JSON.stringify(state), success() { wx.showToast({ title: '已复制学习记录，请自行保管', icon: 'none' }); } }); },
  importData() {
    wx.getClipboardData({ success: response => {
      let imported;
      try { const raw = JSON.parse(response.data); if (raw.version !== 1 || !raw.reviews || !raw.days || !raw.lessons) throw new Error('invalid'); imported = L.restore(raw); }
      catch (error) { return wx.showToast({ title: '剪贴板不是受支持的 Hola 备份', icon: 'none' }); }
      wx.showModal({ title: '导入学习记录', content: `备份含 ${Object.keys(imported.reviews).length} 个词的记录，将替换当前进度。建议先复制备份。是否继续？`, success: result => {
        if (!result.confirm) return;
        try { S.save(imported, true); this.refresh(); wx.showToast({ title: '导入成功' }); }
        catch (error) { wx.showToast({ title: '保存失败，请检查设备空间', icon: 'none' }); }
      } });
    }, fail() { wx.showToast({ title: '未能读取剪贴板，请允许访问后重试', icon: 'none' }); } });
  }
});
