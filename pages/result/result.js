const { t }        = require('../../utils/i18n');
const progress     = require('../../utils/progress');
const BOOKS        = require('../../utils/books');
const achievements = require('../../utils/achievements');

const CHECKPOINT_IDS = new Set([
  BOOKS[0].id, BOOKS[3].id, BOOKS[4].id, BOOKS[5].id, BOOKS[6].id, BOOKS[7].id, BOOKS[8].id,
]);

Page({
  data: {
    lang: 'en',
    emoji: '🎉', title: '', scoreText: '', pct: 0,
    playAgainLabel: '', homeLabel: '',
    confetti: [],
    showQuestBanner: false, questPassed: false, questBannerText: '',
    showNewQuestBtn: false, newQuestLabel: '',
    achToast: '', showAchToast: false, achBalance: 0,
  },

  _opts: null,
  _questComplete: false,
  _newAch: null,

  onLoad(options) {
    this._opts = options;
    if (options.gameType === 'book' && options.bookId) {
      progress.saveResult(options.bookId, parseInt(options.correct) || 0, parseInt(options.total) || 1);

      const mode = wx.getStorageSync('mode') || 'quest';
      const pct  = Math.round((parseInt(options.correct) || 0) / (parseInt(options.total) || 1) * 100);
      if (mode === 'quest' && pct >= 80 && CHECKPOINT_IDS.has(options.bookId)) {
        const state = progress.completeCheckpoint(options.bookId);
        this._questComplete = state.questComplete;
      } else if (mode === 'quest') {
        this._questComplete = progress.getQuestState().questComplete;
      }

      // Achievement check after saveResult
      const isSQ = !!(BOOKS.find(b => b.id === options.bookId) || {}).sideQuest;
      this._newAch = achievements.checkBookComplete(
        options.bookId,
        parseInt(options.correct) || 0,
        parseInt(options.total) || 1,
        options.lang || wx.getStorageSync('lang') || 'en',
        isSQ
      );
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

    const mode = wx.getStorageSync('mode') || 'quest';
    const isCheckpoint = o.gameType === 'book' && CHECKPOINT_IDS.has(o.bookId);
    const showQuestBanner = mode === 'quest' && isCheckpoint;
    const questPassed = pct >= 80;
    let questBannerText = '';
    if (showQuestBanner) {
      questBannerText = questPassed
        ? (lang === 'en' ? '🌟 Checkpoint cleared! Next stop unlocked!' : '🌟 关卡通过！下一站已解锁！')
        : (lang === 'en'
            ? `⚔️ Need 80% to unlock next stop — you got ${pct}%. Try again!`
            : `⚔️ 需要80%解锁下一站，你得了${pct}%，再试一次！`);
    }

    const hasAch = !!(this._newAch && this._newAch.length > 0);
    const firstAch = hasAch ? this._newAch[0] : null;

    this.setData({
      lang,
      emoji,
      title:          t(lang, titleKey),
      scoreText:      `${t(lang, 'youScored')} ${correct} / ${total}`,
      pct,
      playAgainLabel: t(lang, 'playAgain'),
      homeLabel:      t(lang, 'backHome'),
      confetti,
      showQuestBanner, questPassed, questBannerText,
      showNewQuestBtn: !!(this._questComplete),
      newQuestLabel:   lang === 'en' ? '🗺️ Start New Quest' : '🗺️ 开始新旅程',
      achToast:       hasAch
        ? `🏆 ${lang === 'en' ? firstAch.title_en : firstAch.title_zh} +${firstAch.pts}pts`
        : '',
      showAchToast:   hasAch,
      achBalance:     achievements.getBalance(),
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

  startNewQuest() {
    achievements.checkNewQuest();
    progress.startNewQuest();
    wx.navigateBack();
  },
});
