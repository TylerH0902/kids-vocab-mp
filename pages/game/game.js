const { buildTestPool, getDistractors, WORD_POOL, shuffle } = require('../../utils/game');
const { fetchWordImage } = require('../../utils/pixabay');
const { t }              = require('../../utils/i18n');
const achievements       = require('../../utils/achievements');
const progress           = require('../../utils/progress');

Page({
  data: {
    lang:           'en',
    ageGroup:       '',
    gameMode:       '',
    isQuiz:         false,
    wordPool:       [],
    qIndex:         0,
    total:          0,
    correct:        0,
    currentWord:    null,
    choices:        [],
    answered:       false,
    picUrl:         '',
    picLoading:     false,
    picState:       '',      // '' | 'correct' | 'wrong'
    feedbackVisible: false,
    feedbackText:   '',
    feedbackState:  '',      // 'correct' | 'wrong'
    quizDef:        '',
    progress:       0,
    showBack:       true,
    nextLabel:      'Next',
    homeLabel:      'Home',
    statPoints:     0,
    statCompleted:  0,
  },

  onLoad(options) {
    const app      = getApp();
    const lang     = app.globalData.lang;
    const ageGroup = options.ageGroup || '1-3';
    const gameMode = options.gameMode || 'casual';
    const isQuiz   = ageGroup === '5-6';
    const pool     = buildTestPool(ageGroup, gameMode);

    this.setData({
      lang,
      ageGroup,
      gameMode,
      isQuiz,
      wordPool: pool,
      total:    pool.length,
      showBack: gameMode !== 'test',
      nextLabel: t(lang, 'next').replace(' →',''),
      homeLabel: t(lang, 'backHome'),
    });

    this.setData({
      statPoints:    achievements.getBalance(),
      statCompleted: progress.getQuestState().completedInQuest.length,
    });

    this._loadQuestion(0);
  },

  _loadQuestion(idx) {
    const { wordPool, lang, ageGroup, isQuiz, total } = this.data;
    if (idx >= total) { this._showResult(); return; }

    const word      = wordPool[idx];
    const pool      = WORD_POOL[ageGroup];
    const distractors = getDistractors(word, pool, 3);
    const opts      = shuffle([word, ...distractors]);

    const choices = opts.map(o => ({
      id:    o.id,
      label: isQuiz
        ? (o['def_' + lang] || o[lang === 'en' ? 'zh' : 'en'])
        : o[lang],
      state: ''
    }));

    const progress = Math.round((idx / total) * 100);

    this.setData({
      qIndex:          idx,
      currentWord:     word,
      choices,
      answered:        false,
      feedbackVisible: false,
      picUrl:          '',
      picLoading:      false,
      picState:        '',
      progress,
      quizDef: isQuiz ? (word['def_' + (lang === 'en' ? 'zh' : 'en')] || word[lang === 'en' ? 'zh' : 'en']) : '',
    });

    // Load image for young groups
    if (!isQuiz) {
      this.setData({ picLoading: true });
      fetchWordImage(word.en).then(url => {
        if (this.data.currentWord && this.data.currentWord.id === word.id) {
          this.setData({ picUrl: url || '', picLoading: false });
        }
      });
    }

    this._speak(word.id, lang);
  },

  onChoiceTap(e) {
    if (this.data.answered) return;
    const id      = e.currentTarget.dataset.id;
    const correct = this.data.currentWord.id;
    const isRight = id === correct;
    const lang    = this.data.lang;

    // Update choice card states
    const choices = this.data.choices.map(c => ({
      ...c,
      state: c.id === id ? (isRight ? 'correct' : 'wrong') : (c.id === correct && !isRight ? 'correct' : '')
    }));

    this.setData({
      answered:       true,
      choices,
      picState:       isRight ? 'correct' : 'wrong',
      feedbackVisible: true,
      feedbackText:   t(lang, isRight ? 'correct' : 'wrong'),
      feedbackState:  isRight ? 'correct' : 'wrong',
      correct:        isRight ? this.data.correct + 1 : this.data.correct,
    });

    if (isRight) this._speak(correct, lang);
  },

  nextWord() {
    if (!this.data.answered) return;
    this._loadQuestion(this.data.qIndex + 1);
  },

  speakWord() {
    if (this.data.currentWord) this._speak(this.data.currentWord.id, this.data.lang);
  },

  _speak(wordId, lang) {
    if (this._audioCtx) {
      this._audioCtx.stop();
      this._audioCtx.destroy();
      this._audioCtx = null;
    }
    const ctx = wx.createInnerAudioContext();
    this._audioCtx = ctx;
    ctx.autoplay = true;
    const { AUDIO_CDN } = require('../../utils/api');
    ctx.src = `${AUDIO_CDN}/${lang}/${wordId}.mp3`;
    ctx.onEnded(() => { this._audioCtx = null; ctx.destroy(); });
    ctx.onError(e  => { console.error('[audio] failed:', wordId, e); this._audioCtx = null; ctx.destroy(); });
  },

  goHome() {
    wx.navigateBack();
  },

  _showResult() {
    const { correct, total, gameMode, lang, ageGroup } = this.data;
    wx.redirectTo({
      url: `/pages/result/result?correct=${correct}&total=${total}&gameMode=${gameMode}&lang=${lang}&ageGroup=${ageGroup}&gameType=vocab`
    });
  }
});
