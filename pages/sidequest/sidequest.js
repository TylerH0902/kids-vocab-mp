const BOOKS        = require('../../utils/books');
const progress     = require('../../utils/progress');
const achievements = require('../../utils/achievements');

const SIDE_QUEST_BOOKS = BOOKS.filter(b => b.sideQuest);

Page({
  data: {
    lang: 'en',
    title: 'Side Quests',
    subtitle: '',
    books: [],
    backLabel: '← Back',
    balance: 0,
    balanceText: '',
    costText: '',
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
    const balance = achievements.getBalance();
    const books = SIDE_QUEST_BOOKS.map(b => {
      const p        = progress.getBook(b.id);
      const unlocked = achievements.isUnlocked(b.id);
      return {
        id:       b.id,
        emoji:    b.emoji,
        title:    lang === 'en' ? b.title_en : b.title_zh,
        sub:      lang === 'en' ? b.sub_en   : b.sub_zh,
        stars:    progress.getStars(p),
        attempts: p ? p.attempts : 0,
        bestText: p ? `${p.bestScore}/${p.bestTotal}` : '',
        unlocked,
        cost:       achievements.SIDE_QUEST_COST,
        canAfford:  balance >= achievements.SIDE_QUEST_COST,
      };
    });
    this.setData({
      lang,
      title:    lang === 'en' ? 'Side Quests'      : '支线任务',
      subtitle: lang === 'en' ? 'Bonus adventures — no quest progress affected'
                              : '额外冒险 — 不影响主线进度',
      books,
      backLabel:   lang === 'en' ? '← Back' : '← 返回',
      balance,
      balanceText: lang === 'en' ? `⭐ ${balance} pts available` : `⭐ ${balance} 积分可用`,
      costText:    lang === 'en'
        ? `${achievements.SIDE_QUEST_COST} pts to unlock`
        : `${achievements.SIDE_QUEST_COST}积分解锁`,
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
    if (!achievements.isUnlocked(id)) {
      wx.showToast({
        title: this.data.lang === 'en' ? 'Unlock first!' : '请先解锁！',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({ url: `/pages/intro/intro?id=${id}` });
  },

  onUnlockTap(e) {
    const id   = e.currentTarget.dataset.id;
    const lang = this.data.lang;
    if (achievements.unlockSideQuest(id)) {
      wx.showToast({ title: lang === 'en' ? 'Unlocked!' : '已解锁！', icon: 'success' });
      this._render(lang);
    } else {
      wx.showToast({ title: lang === 'en' ? 'Not enough points' : '积分不足', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  goAchievements() {
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },
});
