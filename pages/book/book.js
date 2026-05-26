const BOOKS = require('../../utils/books');
const { t }  = require('../../utils/i18n');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Page({
  data: {
    lang:            'en',
    bookId:          '',
    bookTitle:       '',
    bookEmoji:       '',
    questions:       [],
    qIndex:          0,
    total:           0,
    correct:         0,
    question:        '',
    choices:         [],
    answered:        false,
    feedbackVisible: false,
    feedbackText:    '',
    feedbackState:   '',
    fireworks:       [],
    progress:        0,
    speaking:        false,
    replayLabel:     'Replay',
    nextLabel:       'Next',
    doneLabel:       'Done',
  },

  _audioCtx: null,

  onLoad(options) {
    const lang = wx.getStorageSync('lang') || 'en';
    const book = BOOKS.find(b => b.id === options.id);
    if (!book) { wx.navigateBack(); return; }
    this._book = book;

    this.setData({
      lang,
      bookId:      book.id,
      bookTitle:   lang === 'en' ? book.title_en : book.title_zh,
      bookEmoji:   book.emoji,
      questions:   book.questions,
      total:       book.questions.length,
      replayLabel: lang === 'en' ? 'Replay' : '重播',
      nextLabel:   lang === 'en' ? 'Next' : '下一题',
      doneLabel:   lang === 'en' ? 'Done' : '完成',
    });

    this._loadQuestion(0);
  },

  _loadQuestion(idx) {
    const { questions, lang, total } = this.data;
    if (idx >= total) { this._showResult(); return; }

    const q        = questions[idx];
    const question = lang === 'en' ? q.q_en : q.q_zh;
    const letters  = ['A', 'B', 'C', 'D'];
    const choices  = shuffle(q.opts).map((o, i) => ({
      id:      o.id,
      label:   lang === 'en' ? o.en : o.zh,
      letter:  letters[i],
      correct: o.correct,
      state:   '',
      delay:   i * 75,
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

    this._speak(question, lang);
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this.setData({
      lang,
      replayLabel: lang === 'en' ? 'Replay' : '重播',
      nextLabel:   lang === 'en' ? 'Next'   : '下一题',
      doneLabel:   lang === 'en' ? 'Done'   : '完成',
    });
    this._refreshLang(lang);
  },

  _refreshLang(lang) {
    const { questions, qIndex, answered, feedbackState } = this.data;
    const q = questions[qIndex];
    if (!q) return;

    const question = lang === 'en' ? q.q_en : q.q_zh;
    // preserve shuffled order and answer states, only swap display label
    const choices = this.data.choices.map(c => {
      const opt = q.opts.find(o => o.id === c.id);
      return { ...c, label: lang === 'en' ? opt.en : opt.zh };
    });
    const updates = {
      question,
      choices,
      bookTitle: lang === 'en' ? this._book.title_en : this._book.title_zh,
    };
    if (answered) updates.feedbackText = t(lang, feedbackState === 'correct' ? 'correct' : 'wrong');
    this.setData(updates);
  },

  // ── TTS ──────────────────────────────────────────────────────────
  speakQuestion() {
    this._speak(this.data.question, this.data.lang);
  },

  _speak(text, lang) {
    this._stopAudio();
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
          ctx.destroy(); this._audioCtx = null;
        });
        ctx.onError(() => this.setData({ speaking: false }));
      },
      fail: () => this.setData({ speaking: false })
    });
  },

  _stopAudio() {
    if (this._audioCtx) {
      this._audioCtx.stop();
      this._audioCtx.destroy();
      this._audioCtx = null;
    }
  },

  // ── Answer selection ─────────────────────────────────────────────
  onChoiceTap(e) {
    if (this.data.answered) return;
    const id      = e.currentTarget.dataset.id;
    const choices = this.data.choices;
    const tapped  = choices.find(c => c.id === id);
    if (!tapped) return;

    const isRight = tapped.correct;
    const lang    = this.data.lang;
    const updated = choices.map(c => ({
      ...c,
      state: c.id === id
        ? (isRight ? 'correct' : 'wrong')
        : (c.correct && !isRight ? 'correct' : c.state),
    }));

    const fireworks = isRight ? this._makeFireworks() : [];

    this.setData({
      answered:        true,
      choices:         updated,
      feedbackVisible: true,
      feedbackText:    t(lang, isRight ? 'correct' : 'wrong'),
      feedbackState:   isRight ? 'correct' : 'wrong',
      correct:         isRight ? this.data.correct + 1 : this.data.correct,
      fireworks,
    });

    if (isRight) setTimeout(() => this.setData({ fireworks: [] }), 1500);
  },

  _makeFireworks() {
    const COLORS = ['#FF6B35','#FFD93D','#00C896','#9B59B6','#FF4757','#2ED573','#1E90FF','#FF6B81','#FFE566','#FFFFFF'];
    return Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist  = 18 + Math.random() * 24;
      return {
        id:     i,
        color:  COLORS[i % COLORS.length],
        size:   7 + Math.floor(Math.random() * 9),
        x:      +(50 + Math.cos(angle) * dist).toFixed(1),
        y:      +(42 + Math.sin(angle) * dist).toFixed(1),
        delay:  Math.round(Math.random() * 200),
        dur:    650 + Math.floor(Math.random() * 400),
        circle: i % 3 !== 0,
      };
    });
  },

  nextQuestion() {
    if (!this.data.answered) return;
    this._stopAudio();
    this._loadQuestion(this.data.qIndex + 1);
  },

  _showResult() {
    const { correct, total, lang, bookId } = this.data;
    wx.redirectTo({
      url: `/pages/result/result?correct=${correct}&total=${total}&lang=${lang}&gameType=book&bookId=${bookId}`
    });
  }
});
