const { createAccountClient } = require('./account');
const config = require('../config');
let client;
function getAccount() {
  if (!client) client = createAccountClient({
    api: config.accountApi,
    get: key => wx.getStorageSync(key), set: (key, value) => wx.setStorageSync(key, value), remove: key => wx.removeStorageSync(key),
    request: (url, method, data, token) => new Promise((resolve, reject) => wx.request({ url, method, data, timeout: 12000,
      header: { 'content-type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      success: result => result.statusCode >= 200 && result.statusCode < 300 ? resolve(result.data) : reject(Object.assign(new Error(result.data?.error || '账号请求失败'), { status: result.statusCode })),
      fail: () => reject(new Error('网络暂不可用，本机记录仍保留，可稍后同步'))
    }))
  });
  return client;
}
module.exports = { getAccount };
