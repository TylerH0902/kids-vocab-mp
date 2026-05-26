const auth = require('./utils/auth');

App({
  onLaunch() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.globalData.lang = lang;
    this.globalData.userInfo = auth.getUserProfile();

    // Required by __usePrivacyVersion: surface WeChat's privacy consent dialog
    // before any sensitive API (location, subscription messages) is called.
    wx.onNeedPrivacyAuthorization((resolve) => {
      wx.showModal({
        title: '隐私保护提示 / Privacy Notice',
        content:
          '本应用会在您同意后，使用以下信息：\n' +
          '• 位置（可选，用于推荐附近学习活动）\n' +
          '• 订阅消息（可选，用于学习提醒）\n\n' +
          'This app may use:\n' +
          '• Location (optional – nearby activity suggestions)\n' +
          '• Subscription messages (optional – study reminders)',
        confirmText: '同意 / Agree',
        cancelText: '拒绝 / Decline',
        success(res) {
          resolve({ event: res.confirm ? 'agree' : 'disagree' });
        },
        fail() {
          resolve({ event: 'disagree' });
        },
      });
    });
  },
  globalData: {
    lang: 'en',
    userInfo: null,
  },
});
