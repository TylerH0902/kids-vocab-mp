const { t } = require('../../utils/i18n');

Page({
  data: {
    lang:     'en',
    ageGroup: '',
    gameMode: '',
    canStart: false,
    labels:   {}
  },

  onShow() {
    const app  = getApp();
    const lang = app.globalData.lang;
    this.setData({ lang, labels: this._labels(lang) });
  },

  _labels(lang) {
    return {
      chooseAge:  t(lang, 'chooseAge'),
      chooseMode: t(lang, 'chooseMode'),
      casual:     t(lang, 'casual'),
      test:       t(lang, 'test'),
      start:      t(lang, 'start'),
      age13:      t(lang, 'age13'),
      age34:      t(lang, 'age34'),
      age56:      t(lang, 'age56'),
    };
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    getApp().globalData.lang = lang;
    wx.setStorageSync('lang', lang);
    this.setData({ lang, labels: this._labels(lang) });
  },

  pickAge(e) {
    const ageGroup = e.currentTarget.dataset.age;
    this.setData({ ageGroup, canStart: !!(ageGroup && this.data.gameMode) });
  },

  pickMode(e) {
    const gameMode = e.currentTarget.dataset.mode;
    this.setData({ gameMode, canStart: !!(this.data.ageGroup && gameMode) });
  },

  startVocab() {
    if (!this.data.canStart) return;
    wx.navigateTo({
      url: `/pages/game/game?ageGroup=${this.data.ageGroup}&gameMode=${this.data.gameMode}`
    });
  },

  startSpell() {
    if (!this.data.ageGroup) return;
    wx.navigateTo({
      url: `/pages/spell/spell?ageGroup=${this.data.ageGroup}`
    });
  }
});
