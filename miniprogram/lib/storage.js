const learning = require('./learning');
const KEY = 'hola-learning-v1';
function load() {
  try { return learning.restore(wx.getStorageSync(KEY)); }
  catch (error) { wx.showToast({ title: '学习记录读取失败，请检查设备空间', icon: 'none' }); return learning.emptyState(); }
}
function save(state) {
  // 调用方只在保存成功后前进，避免显示实际上未保存的进度。
  wx.setStorageSync(KEY, state);
  return state;
}
function commit(action) {
  const state = load();
  const result = action(state);
  try { save(state); return result; }
  catch (error) { wx.showToast({ title: '记录未保存，请检查设备空间后重试', icon: 'none' }); return null; }
}
module.exports = { load, save, commit, KEY };
