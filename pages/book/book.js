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

const FW_COLORS = ['#FF6B35','#FFD93D','#00C896','#9B59B6','#FF4757','#2ED573','#1E90FF','#FF6B81','#FFE566','#FFFFFF'];

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
    fwVisible:       false,
    progress:        0,
    speaking:        false,
    replayLabel:     'Replay',
    nextLabel:       'Next',
    doneLabel:       'Done',
  },

  _audioCtx: null,
  _fwCanvas:  null,
  _fwRaf:     null,

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

    this.setData({
      answered:        true,
      choices:         updated,
      feedbackVisible: true,
      feedbackText:    t(lang, isRight ? 'correct' : 'wrong'),
      feedbackState:   isRight ? 'correct' : 'wrong',
      correct:         isRight ? this.data.correct + 1 : this.data.correct,
      fwVisible:       isRight,
    });

    if (isRight) setTimeout(() => this._startFireworks(), 60);
  },

  // ── Fireworks (Canvas 2D) ─────────────────────────────────────────
  _startFireworks() {
    const sys = wx.getSystemInfoSync();
    const dpr = sys.pixelRatio;

    wx.createSelectorQuery()
      .select('#fw-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const { node: canvas, width, height } = res[0];
        canvas.width  = Math.round(width  * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        this._fwCanvas = canvas;

        const rockets   = [];
        const particles = [];
        let frame = 0;

        const launch = () => {
          const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
          rockets.push({
            x:       width * (0.15 + Math.random() * 0.70),
            y:       height + 4,
            vx:      (Math.random() - 0.5) * 2.5,
            vy:      -(height * (0.013 + Math.random() * 0.009)),
            targetY: height * (0.10 + Math.random() * 0.32),
            color,
            trail:   [],
          });
        };

        const explode = (x, y, color) => {
          for (let k = 0; k < 72; k++) {
            const angle = Math.random() * Math.PI * 2;
            const spd   = 2 + Math.random() * 6;
            particles.push({
              x, y,
              vx:    Math.cos(angle) * spd,
              vy:    Math.sin(angle) * spd - 1.8,
              color: Math.random() < 0.15 ? '#FFFFFF' : color,
              alpha: 1,
              size:  1.8 + Math.random() * 3.2,
              decay: 0.012 + Math.random() * 0.013,
            });
          }
        };

        // Launch 5 rockets staggered across ~2 s
        const LAUNCHES = 5;
        for (let n = 0; n < LAUNCHES; n++) {
          setTimeout(launch, n * 380 + Math.random() * 120);
        }

        const tick = () => {
          // Semi-transparent overlay creates motion-blur trail
          ctx.fillStyle = 'rgba(0,0,0,0.20)';
          ctx.fillRect(0, 0, width, height);

          // Rockets
          for (let i = rockets.length - 1; i >= 0; i--) {
            const r = rockets[i];
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 12) r.trail.shift();
            r.x  += r.vx;
            r.y  += r.vy;
            r.vy += 0.30;

            r.trail.forEach((pt, ti) => {
              ctx.save();
              ctx.globalAlpha = (ti / r.trail.length) * 0.6;
              ctx.fillStyle   = r.color;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });

            ctx.save();
            ctx.fillStyle   = '#fff';
            ctx.shadowColor = r.color;
            ctx.shadowBlur  = 16;
            ctx.beginPath();
            ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            if (r.y <= r.targetY) {
              explode(r.x, r.y, r.color);
              rockets.splice(i, 1);
            }
          }

          // Particles
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x     += p.vx;
            p.y     += p.vy;
            p.vy    += 0.09;
            p.vx    *= 0.97;
            p.alpha -= p.decay;
            if (p.alpha <= 0) { particles.splice(i, 1); continue; }
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle   = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur  = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          frame++;
          const stillRunning = rockets.length > 0 || particles.length > 0 || frame < 50;
          if (stillRunning) {
            this._fwRaf = canvas.requestAnimationFrame(tick);
          } else {
            ctx.clearRect(0, 0, width, height);
            this.setData({ fwVisible: false });
            this._fwCanvas = null;
            this._fwRaf    = null;
          }
        };

        this._fwRaf = canvas.requestAnimationFrame(tick);
      });
  },

  _stopFireworks() {
    if (this._fwCanvas && this._fwRaf) {
      this._fwCanvas.cancelAnimationFrame(this._fwRaf);
    }
    this._fwCanvas = null;
    this._fwRaf    = null;
    this.setData({ fwVisible: false });
  },

  nextQuestion() {
    if (!this.data.answered) return;
    this._stopFireworks();
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
