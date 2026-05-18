App({
  onLaunch() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.globalData.lang = lang;
  },
  globalData: {
    lang: 'en'
  }
});
