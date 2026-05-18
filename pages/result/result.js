const { t } = require('../../utils/i18n');

Page({
  data: {
    emoji: '🎉', title: '', scoreText: '', pct: 0,
    playAgainLabel: '', homeLabel: '',
  },

  onLoad(options) {
    const lang     = options.lang || 'en';
    const correct  = parseInt(options.correct) || 0;
    const total    = parseInt(options.total)   || 1;
    const gameMode = options.gameMode || 'casual';
    const gameType = options.gameType || 'vocab';
    const pct      = Math.round((correct / total) * 100);

    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💪';
    const titleKey = gameType === 'spell'
      ? (pct >= 60 ? 'casualDone' : 'done')
      : (gameMode === 'test' ? 'testDone' : 'casualDone');

    this._options = options;

    this.setData({
      emoji,
      title:          t(lang, titleKey),
      scoreText:      `${t(lang, 'youScored')} ${correct} / ${total}`,
      pct,
      playAgainLabel: t(lang, 'playAgain'),
      homeLabel:      t(lang, 'backHome'),
    });
  },

  playAgain() {
    const o = this._options;
    if (o.gameType === 'spell') {
      wx.redirectTo({ url: `/pages/spell/spell?ageGroup=${o.ageGroup}` });
    } else {
      wx.redirectTo({ url: `/pages/game/game?ageGroup=${o.ageGroup}&gameMode=${o.gameMode}` });
    }
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
