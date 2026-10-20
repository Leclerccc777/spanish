const S = require('../../lib/storage');
const A = require('../../lib/account-runtime').getAccount;
Page({
  data: { username: '', password: '', busy: false, account: {} },
  onShow() { this.refresh(); },
  refresh() { this.setData({ account: A().status() }); },
  username(e) { this.setData({ username: e.detail.value }); },
  password(e) { this.setData({ password: e.detail.value }); },
  async run(action) {
    if (this.data.busy) return;
    this.setData({ busy: true });
    try { await action(); }
    catch (error) { wx.showToast({ title: error.message || '账号请求失败，请稍后重试', icon: 'none' }); }
    finally { this.setData({ busy: false }); this.refresh(); }
  },
  authenticate(e) {
    const mode = e.currentTarget.dataset.mode, password = this.data.password;
    this.setData({ password: '' });
    return this.run(async () => {
      const progress = mode === 'register' ? S.read() : undefined;
      await A().authenticate(mode, this.data.username, password, progress);
      await A().sync();
    });
  },
  sync() { return this.run(() => A().sync()); },
  logout() { return this.run(() => A().logout()); },
  resolve(e) {
    const choice = e.currentTarget.dataset.choice;
    wx.showModal({ title: choice === 'cloud' ? '使用云端进度' : '使用本机进度', content: '请先导出需要保留的备份。选择后会替换另一份进度；本机替换前记录会另存一份。是否继续？', success: result => { if (result.confirm) this.run(() => A().sync(choice)); } });
  },
  exportData(e) {
    try {
      const progress = e.currentTarget.dataset.previous ? A().previous() : S.read();
      if (!progress) throw new Error('没有替换前记录');
      wx.setClipboardData({ data: JSON.stringify(progress) });
    } catch (error) { wx.showToast({ title: error.message, icon: 'none' }); }
  }
});
