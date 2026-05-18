const BOOKS = require('../../utils/books');

Page({
  data: {
    lang:  'en',
    books: []
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    getApp().globalData.lang = lang;
    this.setData({ lang, books: BOOKS });
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    getApp().globalData.lang = lang;
    wx.setStorageSync('lang', lang);
    this.setData({ lang });
  },

  openBook(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/book/book?id=${id}` });
  }
});
