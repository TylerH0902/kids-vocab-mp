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
    lang:      'zh',
    wxLoading: false,
    error:     '',
    // permissions screen
    showPermissions:  false,
    permAvatarUrl:    '',
    permAvatarLetter: '探',
    permNickname:     '',
    locGranted:       false,
    notifGranted:     false,
  },

  onLoad() {
    if (auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/index/index' });
      return;
    }
    const lang = wx.getStorageSync('lang') || 'zh';
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
    const lang = this.data.lang;
    const confirmed = await new Promise(resolve => {
      wx.showModal({
        title:       lang === 'en' ? '微信登录 / WeChat Sign In' : '微信登录',
        content:     lang === 'en'
          ? 'Sign in using the WeChat account on this device. You can set your name and photo on the next screen.'
          : '使用本设备上的微信账号登录。您可以在下一页设置昵称和头像。',
        confirmText: lang === 'en' ? 'Sign in' : '登录',
        cancelText:  lang === 'en' ? 'Cancel'  : '取消',
        success:     res => resolve(res.confirm),
        fail:        ()  => resolve(false),
      });
    });
    if (!confirmed) return;
    this.setData({ wxLoading: true, error: '' });
    try {
      const user = await api.wxLogin();
      auth.saveSession(user);
      this._showPermissions();
    } catch(e) {
      this.setData({ error: this._e('loginFail'), wxLoading: false });
    }
  },

  _showPermissions() {
    const profile  = auth.getUserProfile();
    const nickname = (profile && profile.nickname) || (this.data.lang === 'en' ? 'Explorer' : '小探险家');
    const avatar   = (profile && profile.avatarUrl) || '';
    this.setData({
      showPermissions:  true,
      wxLoading:        false,
      permNickname:     nickname,
      permAvatarLetter: nickname.charAt(0).toUpperCase(),
      permAvatarUrl:    avatar,
      locGranted:       false,
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
      permAvatarLetter: nickname.charAt(0).toUpperCase() || '探',
    });
    if (nickname) auth.updateProfile({ nickname });
  },

  onAllowLocation() {
    wx.authorize({
      scope:   'scope.userLocation',
      success: () => this.setData({ locGranted: true }),
      fail:    () => {},
    });
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
