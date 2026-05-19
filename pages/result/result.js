const { t } = require('../../utils/i18n');

Page({
  data: {
    lang: 'en',
    emoji: '🎉', title: '', scoreText: '', pct: 0,
    playAgainLabel: '', homeLabel: '',
  },

  _opts: null,

  onLoad(options) {
    this._opts = options;
    const lang = options.lang || wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  _render(lang) {
    const o      = this._opts;
    const correct = parseInt(o.correct) || 0;
    const total   = parseInt(o.total)   || 1;
    const pct     = Math.round((correct / total) * 100);
    const emoji   = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪';
    const titleKey = o.gameType === 'spell'
      ? (pct >= 60 ? 'casualDone' : 'done')
      : (o.gameMode === 'test' ? 'testDone' : 'casualDone');

    this.setData({
      lang,
      emoji,
      title:          t(lang, titleKey),
      scoreText:      `${t(lang, 'youScored')} ${correct} / ${total}`,
      pct,
      playAgainLabel: t(lang, 'playAgain'),
      homeLabel:      t(lang, 'backHome'),
    });
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  playAgain() {
    const o = this._opts;
    if (o.gameType === 'book') {
      wx.redirectTo({ url: `/pages/book/book?id=${o.bookId}` });
    } else if (o.gameType === 'spell') {
      wx.redirectTo({ url: `/pages/spell/spell?ageGroup=${o.ageGroup}` });
    } else {
      wx.redirectTo({ url: `/pages/game/game?ageGroup=${o.ageGroup}&gameMode=${o.gameMode}` });
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
});
