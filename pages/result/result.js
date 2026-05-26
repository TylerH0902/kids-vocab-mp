const { t }        = require('../../utils/i18n');
const progress     = require('../../utils/progress');

Page({
  data: {
    lang: 'en',
    emoji: '🎉', title: '', scoreText: '', pct: 0,
    playAgainLabel: '', homeLabel: '',
    confetti: [],
  },

  _opts: null,

  onLoad(options) {
    this._opts = options;
    if (options.gameType === 'book' && options.bookId) {
      progress.saveResult(options.bookId, parseInt(options.correct) || 0, parseInt(options.total) || 1);
    }
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

    const colors  = ['#FF6B35','#FFD93D','#00C896','#9B59B6','#FF4757','#2ED573','#1E90FF','#FF6B81'];
    const count   = pct >= 80 ? 28 : 18;
    const confetti = Array.from({ length: count }, (_, i) => ({
      id:    i,
      x:     Math.round(Math.random() * 94 + 2),
      delay: +(Math.random() * 1.4).toFixed(2),
      dur:   +(1.8 + Math.random() * 0.9).toFixed(2),
      color: colors[i % colors.length],
      size:  10 + Math.floor(Math.random() * 12),
      shape: i % 3 === 0 ? 'circle' : 'square',
    }));

    this.setData({
      lang,
      emoji,
      title:          t(lang, titleKey),
      scoreText:      `${t(lang, 'youScored')} ${correct} / ${total}`,
      pct,
      playAgainLabel: t(lang, 'playAgain'),
      homeLabel:      t(lang, 'backHome'),
      confetti,
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
    wx.navigateBack();
  },
});
