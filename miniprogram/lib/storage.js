const learning = require('./learning');
const KEY = 'hola-learning-v1';
let readable = true;
function read() {
  try {
    const raw = wx.getStorageSync(KEY);
    if (raw !== undefined && raw !== null && raw !== '' && raw.version !== learning.emptyState().version) throw new Error('Unsupported record version');
    const state = learning.restore(raw);
    readable = true;
    return state;
  } catch (error) { readable = false; throw error; }
}
function load() {
  try { return read(); }
  catch (error) { wx.showToast({ title: '学习记录读取失败，旧记录未覆盖', icon: 'none' }); return learning.emptyState(); }
}
function save(state) {
  // 调用方只在保存成功后前进，避免显示实际上未保存的进度。
  wx.setStorageSync(KEY, state);
  readable = true;
  return state;
}
function commit(action) {
  let state;
  try { state = read(); }
  catch (error) { wx.showToast({ title: '记录未读取，旧记录不会被覆盖', icon: 'none' }); return null; }
  const result = action(state);
  try { save(state); return result; }
  catch (error) { wx.showToast({ title: '记录未保存，请检查设备空间后重试', icon: 'none' }); return null; }
}
module.exports = { read, load, save, commit, isReadable: () => readable, KEY };
