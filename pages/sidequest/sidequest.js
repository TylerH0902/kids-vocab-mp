const BOOKS    = require('../../utils/books');
const progress = require('../../utils/progress');

const SIDE_QUEST_BOOKS = BOOKS.filter(b => b.sideQuest);

Page({
  data: {
    lang: 'en',
    title: 'Side Quests',
    subtitle: '',
    books: [],
    backLabel: '← Back',
  },

  onLoad() {
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  _render(lang) {
    const books = SIDE_QUEST_BOOKS.map(b => {
      const p = progress.getBook(b.id);
      return {
        id:       b.id,
        emoji:    b.emoji,
        title:    lang === 'en' ? b.title_en : b.title_zh,
        sub:      lang === 'en' ? b.sub_en   : b.sub_zh,
        stars:    progress.getStars(p),
        attempts: p ? p.attempts : 0,
        bestText: p ? `${p.bestScore}/${p.bestTotal}` : '',
      };
    });
    this.setData({
      lang,
      title:    lang === 'en' ? 'Side Quests'      : '支线任务',
      subtitle: lang === 'en' ? 'Bonus adventures — no quest progress affected'
                              : '额外冒险 — 不影响主线进度',
      books,
      backLabel: lang === 'en' ? '← Back' : '← 返回',
    });
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  onBookTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/intro/intro?id=${id}` });
  },

  goBack() {
    wx.navigateBack();
  },
});
