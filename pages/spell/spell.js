const { buildSpellPool } = require('../../utils/game');
const { fetchWordImage }  = require('../../utils/pixabay');
const { t }               = require('../../utils/i18n');
const achievements        = require('../../utils/achievements');
const progress            = require('../../utils/progress');

Page({
  data: {
    lang:        'en',
    ageGroup:    '',
    wordPool:    [],
    qIndex:      0,
    total:       0,
    correct:     0,
    currentWord: null,
    inputVal:    '',
    inputState:  '',
    answered:    false,
    feedbackText:'',
    feedbackState:'',
    picUrl:      '',
    picLoading:  false,
    progress:    0,
    showBack:    true,
    placeholder: 'Type here…',
    checkLabel:  'Check',
    nextLabel:   'Next →',
    homeLabel:   'Home',
    statPoints:    0,
    statCompleted: 0,
  },

  onLoad(options) {
    const app      = getApp();
    const lang     = app.globalData.lang;
    const ageGroup = options.ageGroup || '1-3';
    const pool     = buildSpellPool(ageGroup);

    this.setData({
      lang,
      ageGroup,
      wordPool:    pool,
      total:       pool.length,
      placeholder: t(lang, 'typeHere'),
      checkLabel:  t(lang, 'check'),
      nextLabel:   t(lang, 'next'),
      homeLabel:   t(lang, 'backHome'),
    });

    this.setData({
      statPoints:    achievements.getBalance(),
      statCompleted: progress.getQuestState().completedInQuest.length,
    });

    this._loadQuestion(0);
  },

  _loadQuestion(idx) {
    const { wordPool, lang, total } = this.data;
    if (idx >= total) { this._showResult(); return; }

    const word     = wordPool[idx];
    const progress = Math.round((idx / total) * 100);

    this.setData({
      qIndex:       idx,
      currentWord:  word,
      inputVal:     '',
      inputState:   '',
      answered:     false,
      feedbackText: '',
      feedbackState:'',
      picUrl:       '',
      picLoading:   true,
      progress,
    });

    fetchWordImage(word.en).then(url => {
      if (this.data.currentWord && this.data.currentWord.id === word.id) {
        this.setData({ picUrl: url || '', picLoading: false });
      }
    });

    this._speak(word.id, lang);
  },

  onInput(e) {
    this.setData({ inputVal: e.detail.value });
  },

  checkSpell() {
    if (this.data.answered) return;
    const { inputVal, currentWord, lang, correct } = this.data;
    const answer  = inputVal.trim().toLowerCase();
    const isRight = answer === currentWord.en.toLowerCase();

    this.setData({
      answered:     true,
      inputState:   isRight ? 'correct' : 'wrong',
      feedbackText: isRight
        ? t(lang, 'spellCorrect')
        : t(lang, 'spellWrong', answer, currentWord.en),
      feedbackState: isRight ? 'correct' : 'wrong',
      correct:       isRight ? correct + 1 : correct,
    });
  },

  nextWord() {
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
    ctx.src = `https://tylerh0902.github.io/kids-vocab-audio/${lang}/${wordId}.mp3`;
    ctx.play();
    ctx.onEnded(() => { this._audioCtx = null; ctx.destroy(); });
    ctx.onError(()  => { this._audioCtx = null; ctx.destroy(); });
  },

  goHome() {
    wx.navigateBack();
  },

  _showResult() {
    const { correct, total, lang, ageGroup } = this.data;
    wx.redirectTo({
      url: `/pages/result/result?correct=${correct}&total=${total}&lang=${lang}&ageGroup=${ageGroup}&gameType=spell`
    });
  }
});
