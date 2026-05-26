const BOOKS    = require('../../utils/books');
const progress = require('../../utils/progress');

const BOOK_COLORS = {
  caterpillar:  '#FF9A3C',
  wildthings:   '#FF6B6B',
  alice:        '#9B59B6',
  wonder:       '#2979FF',
  alice2:       '#00C896',
  alice3:       '#FF69B4',
  charlotteweb: '#5C8A3C',
};

Page({
  data: {
    lang: 'en',
    bookId: '', bookEmoji: '', bookTitle: '', bookSub: '', total: 0,
    headerColor: '#6C63FF',
    isSeries: false, chapterList: [],
    played: false, stars: 0, bestText: '',
    newCount: 0, newBannerText: '',
    questionsLabel: 'Questions', quizLabel: 'Quiz',
    startLabel: 'Start Quest  🚀', backLabel: '← choose another',
  },

  _book: null,

  onLoad(options) {
    const lang = wx.getStorageSync('lang') || 'en';
    const book = BOOKS.find(b => b.id === options.id);
    if (!book) { wx.navigateBack(); return; }
    this._book = book;
    this._render(lang);
  },

  onShow() {
    if (this._book) this._render(this.data.lang);
  },

  _render(lang) {
    const book = this._book;
    const isSeries = !!(book.chapters && book.chapters.length > 1);

    const chapterList = isSeries
      ? book.chapters.map(cid => {
          const b = BOOKS.find(x => x.id === cid);
          if (!b) return null;
          const p        = progress.getBook(cid);
          const stars    = progress.getStars(p);
          const newCount = p ? Math.max(0, b.questions.length - (p.bestTotal || 0)) : 0;
          return {
            id:       b.id,
            sub:      lang === 'en' ? b.sub_en : b.sub_zh,
            total:    b.questions.length,
            played:   !!p,
            stars,
            bestText: p ? `${p.bestScore}/${p.bestTotal}` : '',
            newCount,
          };
        }).filter(Boolean)
      : [];

    const p       = !isSeries ? progress.getBook(book.id) : null;
    const played  = !!p;
    const stars   = progress.getStars(p);
    const bestText = p
      ? (lang === 'en' ? `Best: ${p.bestScore} / ${p.bestTotal}` : `最佳: ${p.bestScore} / ${p.bestTotal}`)
      : '';

    // New-question count for single books
    const newCount = !isSeries && played && p
      ? Math.max(0, book.questions.length - (p.bestTotal || 0))
      : 0;
    const newBannerText = newCount > 0
      ? (lang === 'en'
          ? `${newCount} new questions added since your last visit!`
          : `新增了 ${newCount} 道题目，快来挑战吧！`)
      : '';

    this.setData({
      lang,
      bookId:      book.id,
      bookEmoji:   book.emoji,
      bookTitle:   lang === 'en' ? book.title_en : book.title_zh,
      bookSub:     isSeries
        ? (lang === 'en' ? 'Choose a chapter' : '选择章节')
        : (lang === 'en' ? book.sub_en : book.sub_zh),
      total:       book.questions.length,
      headerColor: BOOK_COLORS[book.id] || '#6C63FF',
      isSeries, chapterList,
      played, stars, bestText,
      newCount, newBannerText,
      questionsLabel: lang === 'en' ? 'Questions' : '道题目',
      quizLabel:      lang === 'en' ? 'Quiz'      : '问答挑战',
      startLabel:     lang === 'en' ? 'Start Quest  🚀' : '开始冒险  🚀',
      backLabel:      lang === 'en' ? '← choose another' : '← 返回星球',
    });
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this._render(lang);
  },

  startQuiz() {
    wx.redirectTo({ url: `/pages/book/book?id=${this.data.bookId}` });
  },

  startChapter(e) {
    wx.redirectTo({ url: `/pages/book/book?id=${e.currentTarget.dataset.id}` });
  },

  goBack() {
    wx.navigateBack();
  },
});
