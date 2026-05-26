const auth = require('../../utils/auth');
const api  = require('../../utils/api');
const NOTIF_TMPL_IDS = []; // add your WeChat subscribe message template IDs here

// Language-aware error strings
const ERR = {
  wxFail:      { en: 'WeChat login failed. Please try phone number.',  zh: '微信登录失败，请使用手机号' },
  loginFail:   { en: 'Login failed. Please retry.',                    zh: '登录失败，请重试' },
  wxUnavail:   { en: 'WeChat unavailable. Please try phone number.',   zh: '微信不可用，请使用手机号登录' },
  badPhone:    { en: 'Invalid phone number.',                          zh: '手机号格式不正确' },
  sendFail:    { en: 'Failed to send code. Check your connection.',    zh: '发送失败，请检查网络' },
  wrongCode:   { en: 'Wrong code, please try again.',                  zh: '验证码错误，请重试' },
};

Page({
  data: {
    lang:      'en',
    wxLoading: false,
    phone:     '',
    code:      '',
    codeSent:  false,
    sending:   false,
    countdown: 0,
    verifying: false,
    error:     '',
    // permissions screen
    showPermissions:  false,
    permAvatarUrl:    '',
    permAvatarLetter: 'E',
    permNickname:     '',
    locGranted:       false,
    notifGranted:     false,
  },
  _countdownTimer: null,

  onLoad() {
    if (auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/index/index' });
      return;
    }
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
  },

  onUnload() {
    if (this._countdownTimer) clearInterval(this._countdownTimer);
  },

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

    if (api.MOCK) {
      try {
        const user = await api.wxLogin('mock_code');
        auth.saveSession(user);
        this._showPermissions();
      } catch(e) {
        this.setData({ error: this._e('loginFail'), wxLoading: false });
      }
      return;
    }

    wx.login({
      success: async (res) => {
        if (!res.code) {
          this.setData({ error: this._e('wxFail'), wxLoading: false });
          return;
        }
        try {
          const user = await api.wxLogin(res.code);
          auth.saveSession(user);
          this._showPermissions();
        } catch(e) {
          this.setData({ error: this._e('loginFail'), wxLoading: false });
        }
      },
      fail: () => {
        this.setData({ error: this._e('wxUnavail'), wxLoading: false });
      },
    });
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
    if (api.MOCK || NOTIF_TMPL_IDS.length === 0) {
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

  // ── Phone: input handlers ─────────────────────────────────────────────
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value, error: '' });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value, error: '' });
  },

  // ── Phone: send SMS code ──────────────────────────────────────────────
  async onSendCode() {
    const { phone, countdown, sending } = this.data;
    if (phone.length < 11 || countdown > 0 || sending) return;
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      this.setData({ error: this._e('badPhone') });
      return;
    }
    this.setData({ sending: true, error: '' });
    try {
      await api.sendSms(phone);
      this.setData({ codeSent: true, sending: false });
      this._startCountdown(60);
    } catch(e) {
      this.setData({ error: this._e('sendFail'), sending: false });
    }
  },

  _startCountdown(secs) {
    this.setData({ countdown: secs });
    this._countdownTimer = setInterval(() => {
      const next = this.data.countdown - 1;
      if (next <= 0) {
        clearInterval(this._countdownTimer);
        this.setData({ countdown: 0 });
      } else {
        this.setData({ countdown: next });
      }
    }, 1000);
  },

  // ── Phone: verify code & log in ───────────────────────────────────────
  async onPhoneLogin() {
    const { code, verifying } = this.data;
    if (code.length < 4 || verifying) return;
    this.setData({ verifying: true, error: '' });
    try {
      const user = await api.verifySms(this.data.phone, code);
      auth.saveSession(user);
      getApp().globalData.userInfo = auth.getUserProfile();
      wx.reLaunch({ url: '/pages/index/index' });
    } catch(e) {
      const msg = e.message === 'wrong_code' ? this._e('wrongCode') : this._e('loginFail');
      this.setData({ error: msg, verifying: false });
    }
  },
});
