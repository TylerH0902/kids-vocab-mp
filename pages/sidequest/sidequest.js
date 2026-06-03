const BOOKS        = require('../../utils/books');
const progress     = require('../../utils/progress');
const achievements = require('../../utils/achievements');

const HUB_BG = {
  1: '/assets/images/sq1_map.jpg',
  2: '/assets/images/sq2_map.jpg',
};

Page({
  data: {
    lang:     'en',
    bgImage:  '/assets/images/sq1_map.jpg',
    balance:  0,
    backLabel: '← Back',
    locations: [],
    popup:    null,
  },

  _hub: 1,
  _hubBooks: [],

  onLoad(options) {
    this._hub = parseInt(options.hub) || 1;
    this._hubBooks = BOOKS.filter(b => b.sideQuest && b.hub === this._hub);
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    this._render(lang);
  },

  _render(lang) {
    const balance = achievements.getBalance();
    const locations = this._hubBooks.map(b => {
      const p        = progress.getBook(b.id);
      const unlocked = achievements.isUnlocked(b.id);
      const stars    = progress.getStars(p);
      return {
        id:        b.id,
        left:      (b.hubPos.x * 100).toFixed(1),
        top:       (b.hubPos.y * 100).toFixed(1),
        unlocked,
        stars,
        played:    !!p,
        bestText:  p ? `${p.bestScore}/${p.bestTotal}` : '',
        title:     lang === 'en' ? b.title_en : b.title_zh,
        sub:       lang === 'en' ? b.sub_en   : b.sub_zh,
        cost:      achievements.SIDE_QUEST_COST,
        canAfford: balance >= achievements.SIDE_QUEST_COST,
      };
    });
    this.setData({
      lang,
      bgImage:   HUB_BG[this._hub] || HUB_BG[1],
      balance,
      backLabel: lang === 'en' ? '← Back' : '← 返回',
      locations,
      popup: null,
    });
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  onLocTap(e) {
    const id  = e.currentTarget.dataset.id;
    const loc = this.data.locations.find(l => l.id === id);
    if (!loc) return;
    this.setData({ popup: loc });
  },

  closePopup() {
    this.setData({ popup: null });
  },

  onPlay() {
    const id = this.data.popup && this.data.popup.id;
    if (!id) return;
    this.setData({ popup: null });
    wx.navigateTo({ url: `/pages/intro/intro?id=${id}` });
  },

  onUnlock() {
    const id   = this.data.popup && this.data.popup.id;
    const lang = this.data.lang;
    if (!id) return;
    if (achievements.unlockSideQuest(id)) {
      wx.showToast({ title: lang === 'en' ? 'Unlocked! 🎉' : '已解锁！🎉', icon: 'none' });
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
