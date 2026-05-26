const auth = require('./utils/auth');

App({
  onLaunch() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.globalData.lang = lang;
    this.globalData.userInfo = auth.getUserProfile();
  },
  globalData: {
    lang: 'en',
    userInfo: null,
  },
});
