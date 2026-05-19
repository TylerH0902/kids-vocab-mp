const BOOKS = require('../../utils/books');

const BOOK_COLORS = {
  caterpillar: '#FF9A3C',
  wildthings:  '#FF6B6B',
  alice:       '#9B59B6',
  wonder:      '#2979FF',
  alice2:      '#00C896',
  alice3:      '#FF69B4',
};

Page({
  data: {
    lang: 'en',
    bookId: '', bookEmoji: '', bookTitle: '', bookSub: '', total: 0,
    headerColor: '#6C63FF',
    // labels
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

  _render(lang) {
    const book = this._book;
    this.setData({
      lang,
      bookId:      book.id,
      bookEmoji:   book.emoji,
      bookTitle:   lang === 'en' ? book.title_en : book.title_zh,
      bookSub:     lang === 'en' ? book.sub_en   : book.sub_zh,
      total:       book.questions.length,
      headerColor: BOOK_COLORS[book.id] || '#6C63FF',
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

  goBack() {
    wx.navigateBack();
  },
});
