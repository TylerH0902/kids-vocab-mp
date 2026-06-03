const auth = require('../../utils/auth');
const api  = require('../../utils/api');
const NOTIF_TMPL_IDS = []; // add your WeChat subscribe message template IDs here

// Language-aware error strings
const ERR = {
  loginFail:  { en: 'Login failed. Please retry.',   zh: '登录失败，请重试' },
  phoneDeny:  { en: 'Phone access denied.',           zh: '未授权手机号，无法登录' },
};

Page({
  data: {
    lang:         'en',
    wxLoading:    false,
    phoneLoading: false,
    error:        '',
    // permissions screen
    showPermissions:  false,
    permAvatarUrl:    '',
    permAvatarLetter: 'E',
    permNickname:     '',
    locGranted:       false,
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
    const lang = this.data.lang;
    const confirmed = await new Promise(resolve => {
      wx.showModal({
        title:       lang === 'en' ? 'Sign in with WeChat' : '微信登录确认',
        content:     lang === 'en' ? 'Continue with your WeChat account?' : '使用当前微信账号登录？',
        confirmText: lang === 'en' ? 'Continue' : '继续',
        cancelText:  lang === 'en' ? 'Cancel'   : '取消',
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
    const profile = auth.getUserProfile();
    const nickname = (profile && profile.nickname) || 'Explorer';
    this.setData({
      showPermissions:  true,
      wxLoading:        false,
      permNickname:     nickname,
      permAvatarLetter: nickname.charAt(0).toUpperCase(),
      permAvatarUrl:    (profile && profile.avatarUrl) || '',
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
      permAvatarLetter: nickname.charAt(0).toUpperCase() || 'E',
    });
    if (nickname) auth.updateProfile({ nickname });
  },

  onAllowLocation() {
    wx.authorize({
      scope: 'scope.userLocation',
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

  // ── Phone one-tap login ───────────────────────────────────────────────
  async onGetPhone(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      this.setData({ error: this._e('phoneDeny') });
      return;
    }
    this.setData({ phoneLoading: true, error: '' });
    try {
      const user = await api.getPhoneNumber(e.detail.code);
      auth.saveSession(user);
      getApp().globalData.userInfo = auth.getUserProfile();
      this._showPermissions();
    } catch (err) {
      this.setData({ error: this._e('loginFail'), phoneLoading: false });
    }
  },
});
