const S = require('./lib/storage');
const { getAccount } = require('./lib/account-runtime');
App({
  globalData: { name: 'Hola' },
  onLaunch() { S.configureAccount(getAccount()); },
  onShow() { getAccount().sync().catch(() => {}); }
});
