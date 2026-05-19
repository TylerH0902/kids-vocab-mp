const BOOKS = require('../../utils/books');

// Matches the ROAD colour order from the planet screen
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
    lang:      'en',
    bookId:    '',
    bookEmoji: '',
    bookTitle: '',
    bookSub:   '',
    total:     0,
    headerColor: '#6C63FF',
  },

  onLoad(options) {
    const lang = wx.getStorageSync('lang') || 'en';
    const book = BOOKS.find(b => b.id === options.id);
    if (!book) { wx.navigateBack(); return; }

    this.setData({
      lang,
      bookId:      book.id,
      bookEmoji:   book.emoji,
      bookTitle:   lang === 'en' ? book.title_en : book.title_zh,
      bookSub:     lang === 'en' ? book.sub_en   : book.sub_zh,
      total:       book.questions.length,
      headerColor: BOOK_COLORS[book.id] || '#6C63FF',
    });
  },

  startQuiz() {
    // Replace intro in stack so Back from quiz doesn't return here
    wx.redirectTo({ url: `/pages/book/book?id=${this.data.bookId}` });
  },

  goBack() {
    wx.navigateBack();
  },
});
