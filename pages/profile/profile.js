const auth     = require('../../utils/auth');
const progress = require('../../utils/progress');
const BOOKS    = require('../../utils/books');

// All books that appear on the map, in display order
const MAP_BOOKS = [
  { id: BOOKS[7].id,  title_en: BOOKS[7].title_en, title_zh: BOOKS[7].title_zh, emoji: BOOKS[7].emoji, sub_en: BOOKS[7].sub_en,  sub_zh: BOOKS[7].sub_zh  },
  { id: BOOKS[3].id,  title_en: BOOKS[3].title_en, title_zh: BOOKS[3].title_zh, emoji: BOOKS[3].emoji, sub_en: BOOKS[3].sub_en,  sub_zh: BOOKS[3].sub_zh  },
  { id: BOOKS[8].id,  title_en: BOOKS[8].title_en, title_zh: BOOKS[8].title_zh, emoji: BOOKS[8].emoji, sub_en: BOOKS[8].sub_en,  sub_zh: BOOKS[8].sub_zh  },
  { id: BOOKS[4].id,  title_en: BOOKS[4].title_en, title_zh: BOOKS[4].title_zh, emoji: BOOKS[4].emoji, sub_en: BOOKS[4].sub_en,  sub_zh: BOOKS[4].sub_zh  },
  { id: BOOKS[0].id,  title_en: BOOKS[0].title_en, title_zh: BOOKS[0].title_zh, emoji: BOOKS[0].emoji, sub_en: BOOKS[0].sub_en,  sub_zh: BOOKS[0].sub_zh  },
  { id: BOOKS[1].id,  title_en: BOOKS[1].title_en, title_zh: BOOKS[1].title_zh, emoji: BOOKS[1].emoji, sub_en: BOOKS[1].sub_en,  sub_zh: BOOKS[1].sub_zh  },
  { id: BOOKS[2].id,  title_en: BOOKS[2].title_en, title_zh: BOOKS[2].title_zh, emoji: BOOKS[2].emoji, sub_en: BOOKS[2].sub_en,  sub_zh: BOOKS[2].sub_zh  },
  { id: BOOKS[5].id,  title_en: BOOKS[5].title_en, title_zh: BOOKS[5].title_zh, emoji: BOOKS[5].emoji, sub_en: BOOKS[5].sub_en,  sub_zh: BOOKS[5].sub_zh  },
  { id: BOOKS[6].id,  title_en: BOOKS[6].title_en, title_zh: BOOKS[6].title_zh, emoji: BOOKS[6].emoji, sub_en: BOOKS[6].sub_en,  sub_zh: BOOKS[6].sub_zh  },
];

Page({
  data: {
    lang: 'en',
    mode: 'quest',
    nickname: '', loginBadge: '', avatarText: '', avatarUrl: '',
    totalPlayed: 0, totalCorrect: 0, avgPct: '—',
    bookRows: [],
  },

  onLoad() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
    this._render(lang);
    this._ready = true;
  },

  onShow() {
    // re-render when returning from a quiz so scores refresh
    if (this._ready) this._render(this.data.lang);
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  setMode(e) {
    const mode = e.currentTarget.dataset.val;
    wx.setStorageSync('mode', mode);
    getApp().globalData.mode = mode;
    this.setData({ mode });
  },

  _render(lang) {
    const profile  = auth.getUserProfile();
    const nickname = (profile && profile.nickname) || 'Explorer';
    const avatarUrl  = (profile && profile.avatarUrl) || '';
    const avatarText = nickname.charAt(0).toUpperCase();
    const isWeChat   = profile && profile.loginMethod === 'wechat';
    const loginBadge = isWeChat
      ? (lang === 'en' ? 'Signed in as ' + nickname : '已登录：' + nickname)
      : (lang === 'en' ? 'Signed in with phone' : '手机号登录');

    const all = progress.getAll();

    let totalPlayed = 0, totalCorrect = 0, totalQuestions = 0;

    const bookRows = MAP_BOOKS.map(b => {
      const p     = all[b.id] || null;
      const stars = progress.getStars(p);
      if (p) {
        totalPlayed++;
        totalCorrect   += p.bestScore;
        totalQuestions += p.bestTotal;
      }
      return {
        id:       b.id,
        emoji:    b.emoji,
        title:    lang === 'en' ? b.title_en : b.title_zh,
        sub:      lang === 'en' ? b.sub_en   : b.sub_zh,
        played:   !!p,
        stars,
        bestScore:  p ? p.bestScore  : 0,
        bestTotal:  p ? p.bestTotal  : 0,
        attempts:   p ? p.attempts   : 0,
        pct:        p ? Math.round((p.bestScore / p.bestTotal) * 100) + '%' : '',
      };
    });

    const avgPct = totalQuestions > 0
      ? Math.round((totalCorrect / totalQuestions) * 100) + '%'
      : '—';

    const mode = wx.getStorageSync('mode') || 'quest';
    this.setData({
      lang, mode, nickname, loginBadge, avatarText, avatarUrl,
      totalPlayed, totalCorrect, avgPct,
      bookRows,
    });
  },

  goBack() {
    wx.navigateBack();
  },

  logout() {
    auth.clearSession();
    wx.reLaunch({ url: '/pages/login/login' });
  },
});
