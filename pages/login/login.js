const auth = require('../../utils/auth');
const api  = require('../../utils/api');
const NOTIF_TMPL_IDS = []; // add WeChat subscribe message template IDs when available
// TODO: add phone login when business account (企业认证) is verified

// Language-aware error strings
const ERR = {
  loginFail: { en: 'Login failed. Please retry.', zh: '登录失败，请重试' },
};

Page({
  data: {
    lang:      'en',
    wxLoading: false,
    error:     '',
    // permissions screen
    showPermissions:  false,
    permAvatarUrl:    '',
    permAvatarLetter: 'E',
    permNickname:     '',
    notifGranted:     false,
  },

  onLoad() {
    if (auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/index/index' });
      return;
    }
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
  },

  onUnload() {},

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this.setData({ lang, error: '' });
  },

  _e(key) {
    const lang = this.data.lang;
    return ERR[key][lang] || ERR[key].en;
  },

  // ── WeChat login ──────────────────────────────────────────────────────
  async onWxLogin() {
    if (this.data.wxLoading) return;
    this.setData({ wxLoading: true, error: '' });
    try {
      // wx.getUserProfile triggers WeChat's native confirmation page
      // showing the user's avatar + nickname before authorising the mini program
      const lang = this.data.lang;
      const profileRes = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: lang === 'en'
            ? 'Used to set up your reading profile'
            : '用于建立您的阅读档案',
          success: resolve,
          fail:    reject,
        });
      });
      const { nickName: nickname, avatarUrl } = profileRes.userInfo;

      // Log in via cloud function (gets OPENID server-side)
      const user = await api.wxLogin();
      // Persist WeChat profile so permissions screen is pre-filled
      auth.saveSession({ ...user, nickname, avatarUrl });
      auth.updateProfile({ nickname, avatarUrl });
      this._showPermissions();
    } catch(e) {
      // User cancelled the WeChat confirmation page, or API unavailable
      this.setData({ error: '', wxLoading: false });
    }
  },

  _showPermissions() {
    const profile  = auth.getUserProfile();
    const nickname = (profile && profile.nickname) || 'Explorer';
    const avatar   = (profile && profile.avatarUrl) || '';
    this.setData({
      showPermissions:  true,
      wxLoading:        false,
      permNickname:     nickname,
      permAvatarLetter: nickname.charAt(0).toUpperCase(),
      permAvatarUrl:    avatar,
      notifGranted:     false,
    });
  },

  // ── Permissions handlers ──────────────────────────────────────────────
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl;
    this.setData({ permAvatarUrl: avatarUrl });
    auth.updateProfile({ avatarUrl });
  },

  onNicknameInput(e) {
    const nickname = e.detail.value || '';
    this.setData({
      permNickname:     nickname,
      permAvatarLetter: nickname.charAt(0).toUpperCase() || 'E',
    });
    if (nickname) auth.updateProfile({ nickname });
  },

  onAllowNotification() {
    if (NOTIF_TMPL_IDS.length === 0) {
      this.setData({ notifGranted: true });
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds:  NOTIF_TMPL_IDS,
      success:  () => this.setData({ notifGranted: true }),
      fail:     () => {},
    });
  },

  onContinue() {
    getApp().globalData.userInfo = auth.getUserProfile();
    wx.reLaunch({ url: '/pages/index/index' });
  },

});
