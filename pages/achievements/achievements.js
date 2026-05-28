const achievements = require('../../utils/achievements');

const CATS = [
  { id:'login',     en:'Login & Streaks', zh:'登录与连续' },
  { id:'books',     en:'Books',           zh:'阅读' },
  { id:'scores',    en:'Scores',          zh:'分数' },
  { id:'questions', en:'Questions',       zh:'问答' },
  { id:'quest',     en:'Quest',           zh:'任务' },
  { id:'side',      en:'Side Quests',     zh:'支线任务' },
  { id:'lang',      en:'Language',        zh:'语言' },
  { id:'special',   en:'Special',         zh:'特殊' },
];

function _today() {
  return new Date().toISOString().slice(0, 10);
}

Page({
  data: {
    lang: 'en',
    balance: 0,
    totalEarned: 0,
    categories: [],
    earnedCount: 0,
    totalCount: 50,
  },

  onLoad() {
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  _render(lang) {
    const state = achievements.getState();
    const ALL   = achievements.ACHIEVEMENTS;
    const today = _today();

    const categories = CATS.map(c => ({
      ...c,
      label: lang === 'en' ? c.en : c.zh,
      items: ALL.filter(a => a.cat === c.id).map(a => ({
        ...a,
        title: lang === 'en' ? a.title_en : a.title_zh,
        desc:  lang === 'en' ? a.desc_en  : a.desc_zh,
        earned: state.earned.includes(a.id) ||
                (a.daily && (state.dailyEarned || {})[a.id] === today),
      })),
    }));

    this.setData({
      lang,
      balance:      state.points,
      totalEarned:  state.totalEarned,
      categories,
      earnedCount:  state.earned.length,
      totalCount:   ALL.length,
    });
  },

  goBack() {
    wx.navigateBack();
  },
});
