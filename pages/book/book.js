const BOOKS  = require('../../utils/books');
const { t }  = require('../../utils/i18n');

Page({
  data: {
    lang:           'en',
    bookId:         '',
    bookTitle:      '',
    bookEmoji:      '',
    questions:      [],
    qIndex:         0,
    total:          0,
    correct:        0,
    question:       '',
    choices:        [],
    answered:       false,
    feedbackVisible: false,
    feedbackText:   '',
    feedbackState:  '',
    progress:       0,
    nextLabel:      'Next',
    doneLabel:      'Done',
    speaking:       false,
  },

  _audioCtx: null,

  onLoad(options) {
    const lang  = wx.getStorageSync('lang') || 'en';
    const book  = BOOKS.find(b => b.id === options.id);
    if (!book) { wx.navigateBack(); return; }

    this.setData({
      lang,
      bookId:    book.id,
      bookTitle: lang === 'en' ? book.title_en : book.title_zh,
      bookEmoji: book.emoji,
      questions: book.questions,
      total:     book.questions.length,
      nextLabel: t(lang, 'next').replace(' →', ''),
      doneLabel: t(lang, 'done'),
    });

    this._loadQuestion(0);
  },

  _loadQuestion(idx) {
    const { questions, lang, total } = this.data;
    if (idx >= total) { this._showResult(); return; }

    const q        = questions[idx];
    const question = lang === 'en' ? q.q_en : q.q_zh;
    const letters  = ['A', 'B', 'C', 'D'];
    const choices  = q.opts.map((o, i) => ({
      id:     o.id,
      label:  lang === 'en' ? o.en : o.zh,
      letter: letters[i],
      correct: o.correct,
      state:  ''
    }));

    this.setData({
      qIndex:          idx,
      question,
      choices,
      answered:        false,
      feedbackVisible: false,
      speaking:        false,
      progress:        Math.round((idx / total) * 100),
    });

    // Auto-read question on load
    this._speak(question, lang);
  },

  speakQuestion() {
    this._speak(this.data.question, this.data.lang);
  },

  speakChoice(e) {
    this._speak(e.currentTarget.dataset.label, this.data.lang);
  },

  _speak(text, lang) {
    if (this._audioCtx) {
      this._audioCtx.stop();
      this._audioCtx.destroy();
      this._audioCtx = null;
    }
    this.setData({ speaking: true });
    wx.textToSpeech({
      lang:    lang === 'zh' ? 'zh_CN' : 'en_US',
      speed:   0.9,
      content: text,
      success: (res) => {
        const ctx = wx.createInnerAudioContext();
        this._audioCtx = ctx;
        ctx.src = res.filename;
        ctx.play();
        ctx.onEnded(() => {
          this.setData({ speaking: false });
          ctx.destroy();
          this._audioCtx = null;
        });
        ctx.onError(() => {
          this.setData({ speaking: false });
        });
      },
      fail: () => {
        this.setData({ speaking: false });
      }
    });
  },

  onChoiceTap(e) {
    if (this.data.answered) return;
    const id      = e.currentTarget.dataset.id;
    const { choices, lang } = this.data;
    const tapped  = choices.find(c => c.id === id);
    const isRight = tapped && tapped.correct;

    const updated = choices.map(c => ({
      ...c,
      state: c.id === id
        ? (isRight ? 'correct' : 'wrong')
        : (c.correct && !isRight ? 'correct' : '')
    }));

    this.setData({
      answered:        true,
      choices:         updated,
      feedbackVisible: true,
      feedbackText:    t(lang, isRight ? 'correct' : 'wrong'),
      feedbackState:   isRight ? 'correct' : 'wrong',
      correct:         isRight ? this.data.correct + 1 : this.data.correct,
    });
  },

  nextQuestion() {
    if (!this.data.answered) return;
    const next = this.data.qIndex + 1;
    if (next >= this.data.total) {
      this._showResult();
    } else {
      this._loadQuestion(next);
    }
  },

  _showResult() {
    const { correct, total, lang, bookId } = this.data;
    wx.redirectTo({
      url: `/pages/result/result?correct=${correct}&total=${total}&lang=${lang}&gameType=book&bookId=${bookId}`
    });
  }
});
