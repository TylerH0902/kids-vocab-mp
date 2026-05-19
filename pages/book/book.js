const BOOKS = require('../../utils/books');
const { t }  = require('../../utils/i18n');

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
    step:            'question',
    question:        '',
    choices:         [],
    answered:        false,
    feedbackVisible: false,
    feedbackText:    '',
    feedbackState:   '',
    progress:        0,
    speaking:        false,
    replayLabel:     'Replay',
    swipeHint:       'swipe for choices',
    nextLabel:       'Next',
    doneLabel:       'Done',
  },

  _audioCtx:    null,
  _touchStartX: 0,
  _touchStartY: 0,

  onLoad(options) {
    const lang = wx.getStorageSync('lang') || 'en';
    const book = BOOKS.find(b => b.id === options.id);
    if (!book) { wx.navigateBack(); return; }

    this.setData({
      lang,
      bookId:      book.id,
      bookTitle:   lang === 'en' ? book.title_en : book.title_zh,
      bookEmoji:   book.emoji,
      questions:   book.questions,
      total:       book.questions.length,
      replayLabel: lang === 'en' ? 'Replay' : '重播',
      swipeHint:   lang === 'en' ? 'swipe for choices' : '滑动查看选项',
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
    const choices  = q.opts.map((o, i) => ({
      id:       o.id,
      label:    lang === 'en' ? o.en : o.zh,
      letter:   letters[i],
      correct:  o.correct,
      state:    '',
      revealed: false,
    }));

    this.setData({
      qIndex:          idx,
      question,
      choices,
      step:            'question',
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
      replayLabel: lang === 'en' ? 'Replay'            : '重播',
      swipeHint:   lang === 'en' ? 'swipe for choices' : '滑动查看选项',
      nextLabel:   lang === 'en' ? 'Next'              : '下一题',
      doneLabel:   lang === 'en' ? 'Done'              : '完成',
    });
  },

  // ── Swipe detection ──────────────────────────────────────────────
  onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
  },

  onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - this._touchStartX;
    const dy = e.changedTouches[0].clientY - this._touchStartY;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);
    if (!isHorizontal || Math.abs(dx) < 40) return;

    if (dx < 0 && this.data.step === 'question') {
      // swipe left → show choices
      this._showChoices();
    } else if (dx > 0 && this.data.step === 'choices' && !this.data.answered) {
      // swipe right → back to question
      this.setData({ step: 'question' });
    }
  },

  _showChoices() {
    this.setData({ step: 'choices' });
    // read all choices sequentially
    this._readChoicesSequence(0);
  },

  _readChoicesSequence(idx) {
    const { choices, lang } = this.data;
    if (idx >= choices.length) return;
    const c    = choices[idx];
    const text = `${c.letter}. ${c.label}`;
    this._speakThen(text, lang, () => {
      setTimeout(() => this._readChoicesSequence(idx + 1), 300);
    });
  },

  // ── TTS ──────────────────────────────────────────────────────────
  speakQuestion() {
    this._speak(this.data.question, this.data.lang);
  },

  speakChoice(e) {
    this._speak(e.currentTarget.dataset.label, this.data.lang);
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

  _speakThen(text, lang, callback) {
    this._stopAudio();
    wx.textToSpeech({
      lang:    lang === 'zh' ? 'zh_CN' : 'en_US',
      speed:   0.9,
      content: text,
      success: (res) => {
        const ctx = wx.createInnerAudioContext();
        this._audioCtx = ctx;
        ctx.src = res.filename;
        ctx.play();
        ctx.onEnded(() => { ctx.destroy(); this._audioCtx = null; callback && callback(); });
        ctx.onError(() => { callback && callback(); });
      },
      fail: () => { callback && callback(); }
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

    // First tap on a fresh choice → just reveal text, don't submit yet
    if (!tapped.revealed) {
      const updated = choices.map(c =>
        c.id === id ? { ...c, revealed: true } : c
      );
      this.setData({ choices: updated });
      this._speak(tapped.label, this.data.lang);
      return;
    }

    // Second tap (already revealed) → submit answer
    const isRight = tapped.correct;
    const lang    = this.data.lang;
    const updated = choices.map(c => ({
      ...c,
      revealed: true,
      state: c.id === id
        ? (isRight ? 'correct' : 'wrong')
        : (c.correct && !isRight ? 'correct' : c.state)
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
