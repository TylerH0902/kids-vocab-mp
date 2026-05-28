const BOOKS    = require('../../utils/books');
const auth     = require('../../utils/auth');
const progress = require('../../utils/progress');
const { MapEngine }   = require('../../utils/mapEngine/MapEngine');
const { buildConfig } = require('./mapConfig');

// Side-quest portals: unlockAfterCount = unlockedCount threshold required
const SQ_HUBS = [
  { locId: 'sq_hub_1', unlockAfterCount: 4 },  // after completing checkpoint 3
  { locId: 'sq_hub_2', unlockAfterCount: 6 },  // after completing checkpoint 5
];

// Ordered unlock sequence — completing index N unlocks index N+1
const CHECKPOINT_ORDER = [
  { locId: 'gruffalo_wood',    bookId: BOOKS[7].id },
  { locId: 'caterpillar_glen', bookId: BOOKS[3].id },
  { locId: 'cat_hat_house',    bookId: BOOKS[8].id },
  { locId: 'wild_wood',        bookId: BOOKS[4].id },
  { locId: 'wonder_castle',    bookId: BOOKS[0].id },
  { locId: 'charlottes_barn',  bookId: BOOKS[6].id },
  { locId: 'story_school',     bookId: BOOKS[5].id },
];

// Bezier path segments connecting each checkpoint pair (matches mapConfig drawFn)
const PATH_SEGMENTS = [
  { p0:{x:.48,y:.86}, cp:{x:.30,y:.82}, p1:{x:.21,y:.72} },
  { p0:{x:.21,y:.72}, cp:{x:.16,y:.63}, p1:{x:.13,y:.52} },
  { p0:{x:.13,y:.52}, cp:{x:.08,y:.42}, p1:{x:.20,y:.34} },
  { p0:{x:.20,y:.34}, cp:{x:.50,y:.08}, p1:{x:.78,y:.32} },
  { p0:{x:.78,y:.32}, cp:{x:.72,y:.28}, p1:{x:.58,y:.56} },
  { p0:{x:.58,y:.56}, cp:{x:.62,y:.72}, p1:{x:.80,y:.74} },
];

// Maps each location's contentRef to its primary book ID
const CONTENT_BOOK = {
  book_0: BOOKS[0].id,
  book_3: BOOKS[3].id,
  book_4: BOOKS[4].id,
  book_5: BOOKS[5].id,
  book_6: BOOKS[6].id,
  book_7: BOOKS[7].id,
  book_8: BOOKS[8].id,
};

function bezierPt(p0, cp, p1, t) {
  const u = 1 - t;
  return { x: u*u*p0.x + 2*u*t*cp.x + t*t*p1.x, y: u*u*p0.y + 2*u*t*cp.y + t*t*p1.y };
}

Page({
  data: { lang: 'en', mode: 'quest', hintVisible: true, hintText: '', canvasReady: false },
  _engine: null,
  _config: null,
  _unlockedCount: null,   // null = not yet initialised; set on first _applyProgress
  _touchStartX: 0, _touchStartY: 0, _touchMoved: false,

  onLoad() {
    if (!auth.isLoggedIn()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const lang = wx.getStorageSync('lang') || 'en';
    const mode = wx.getStorageSync('mode') || 'quest';
    this.setData({ lang, mode, hintText: lang === 'en' ? 'Tap a stop to begin!' : '点击站点开始！' });
    setTimeout(() => this.setData({ hintVisible: false }), 4000);
  },

  onReady() {
    wx.createSelectorQuery()
      .select('#planet-canvas')
      .fields({ node: true, size: true })
      .exec(async (res) => {
        const { node: canvas, width, height } = res[0];
        const lang = this.data.lang;
        const config = buildConfig(lang);

        config.locations.forEach(loc => {
          loc.onTap = (tappedLoc) => this._onLocationTap(tappedLoc);
        });

        this._config = config;

        // Set correct unlock states before engine starts — prevents locked flash
        const initCount = this._getUnlockedCount();
        this._unlockedCount = initCount;
        this._setLocationStates(initCount);

        this._engine = new MapEngine(canvas, config);
        await this._engine.init(width, height);
        this._applyProgress();
        this.setData({ canvasReady: true });
      });
  },

  onHide() {
    this._engine && this._engine.pause();
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    const mode = wx.getStorageSync('mode') || 'quest';
    if (lang !== this.data.lang || mode !== this.data.mode) {
      this.setData({ lang, mode });
      if (this._engine && lang !== this.data.lang) {
        const config = buildConfig(lang);
        config.locations.forEach(loc => { loc.onTap = (l) => this._onLocationTap(l); });
        this._config = config;
      }
    }
    this._applyProgress();
    this._engine && this._engine.resume();
  },

  onUnload() {
    this._engine && this._engine.destroy();
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  // ── Location tap ──────────────────────────────────────────────────────────

  _onLocationTap(loc) {
    if (loc.state === 'locked') {
      const { lang, mode } = this.data;
      const isSQHub = SQ_HUBS.some(h => h.locId === loc.id);
      let msg;
      if (isSQHub) {
        msg = lang === 'en' ? 'Clear more checkpoints to unlock this portal!' : '完成更多关卡即可解锁此传送门！';
      } else {
        msg = mode === 'quest'
          ? (lang === 'en' ? 'Score 80%+ on the previous stop to unlock!' : '需在上一站得分80%以上才能解锁！')
          : (lang === 'en' ? 'Finish the previous story first!' : '请先完成前一个故事！');
      }
      wx.showToast({ title: msg, icon: 'none', duration: 2200 });
      return;
    }
    // Side quest portals
    if (SQ_HUBS.some(h => h.locId === loc.id)) {
      wx.navigateTo({ url: '/pages/sidequest/sidequest' });
      return;
    }
    const book = {
      book_0: BOOKS[0], book_3: BOOKS[3],
      book_4: BOOKS[4], book_5: BOOKS[5],
      book_6: BOOKS[6], book_7: BOOKS[7],
      book_8: BOOKS[8],
    }[loc.contentRef];
    if (book) wx.navigateTo({ url: `/pages/intro/intro?id=${book.id}` });
  },

  // ── Touch handlers ────────────────────────────────────────────────────────

  onTouchStart(e) {
    const t = e.touches[0];
    this._touchStartX = t.x; this._touchStartY = t.y; this._touchMoved = false;
  },
  onTouchMove(e) {
    const t = e.touches[0];
    if (Math.abs(t.x - this._touchStartX) > 8 || Math.abs(t.y - this._touchStartY) > 8)
      this._touchMoved = true;
  },
  onTouchEnd(e) {
    if (this._touchMoved) return;
    const { x, y } = e.changedTouches[0];
    this._engine && this._engine.handleTap(x, y);
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this.setData({ lang });
    if (this._engine) {
      const config = buildConfig(lang);
      config.locations.forEach(loc => { loc.onTap = (l) => this._onLocationTap(l); });
      this._config = config;
      this._applyProgress();
    }
  },

  setMode(e) {
    const mode = e.currentTarget.dataset.val;
    wx.setStorageSync('mode', mode);
    getApp().globalData.mode = mode;
    this.setData({ mode });
    this._applyProgress();
  },

  // ── Unlock logic ──────────────────────────────────────────────────────────

  _getUnlockedCount() {
    if (!auth.isLoggedIn()) return 1;
    const mode = wx.getStorageSync('mode') || 'quest';

    if (mode === 'quest') {
      const completed = progress.getQuestState().completedInQuest;
      let count = 1;
      for (let i = 0; i < CHECKPOINT_ORDER.length; i++) {
        if (!completed.includes(CHECKPOINT_ORDER[i].bookId)) break;
        count = i + 2;
      }
      return Math.min(count, CHECKPOINT_ORDER.length);
    }

    // story mode: any attempt unlocks next
    let count = 1;
    for (let i = 0; i < CHECKPOINT_ORDER.length; i++) {
      const p = progress.getBook(CHECKPOINT_ORDER[i].bookId);
      if (!p || p.attempts === 0) break;
      count = i + 2;
    }
    return Math.min(count, CHECKPOINT_ORDER.length);
  },

  _setLocationStates(unlockedCount) {
    if (!this._config) return;
    this._config.locations.forEach(loc => {
      const order = CHECKPOINT_ORDER.findIndex(c => c.locId === loc.id);
      if (order !== -1) {
        loc.state = order < unlockedCount ? 'unlocked' : 'locked';
      } else {
        const hub = SQ_HUBS.find(h => h.locId === loc.id);
        if (hub) loc.state = unlockedCount >= hub.unlockAfterCount ? 'unlocked' : 'locked';
      }
    });
  },

  _applyProgress() {
    if (!this._engine || !this._config) return;

    const unlockedCount = this._getUnlockedCount();

    // Detect new unlocks — only animate when count rises within the same session
    if (this._unlockedCount !== null && unlockedCount > this._unlockedCount) {
      for (let i = this._unlockedCount; i < unlockedCount; i++) {
        const delay = (i - this._unlockedCount) * 2800;
        setTimeout(() => this._triggerUnlockAnimation(i - 1), delay);
      }
    }
    this._unlockedCount = unlockedCount;

    this._setLocationStates(unlockedCount);
    this._config.locations.forEach(loc => {
      const bookId = CONTENT_BOOK[loc.contentRef];
      const p = bookId ? progress.getBook(bookId) : null;
      loc.stars = bookId ? progress.getStars(p) : undefined;

      if (bookId && loc.state !== 'locked') {
        const book = BOOKS.find(b => b.id === bookId);
        if (!p) {
          loc.contentBadge = 'new';
        } else if (book && book.questions.length > (p.bestTotal || 0)) {
          loc.contentBadge = '+' + (book.questions.length - (p.bestTotal || 0));
        } else {
          loc.contentBadge = null;
        }
      } else {
        loc.contentBadge = null;
      }
    });

    this._engine.updateLocations(this._config.locations);
  },

  // ── Unlock animation ──────────────────────────────────────────────────────

  _triggerUnlockAnimation(segIdx) {
    const seg = PATH_SEGMENTS[segIdx];
    if (!seg || !this._engine) return;

    const startTime = Date.now();
    const DURATION  = 2400;
    const TRAIL_LEN = 10;
    const key       = 'unlock_seg_' + segIdx;

    this._engine.triggerOverlay(key, (ctx, w, h) => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / DURATION, 1);

      if (t >= 1) {
        this._engine.clearOverlay(key);
        this._triggerArrivalBurst(seg.p1);
        return;
      }

      // Fading trail
      for (let i = TRAIL_LEN; i >= 0; i--) {
        const tp = Math.max(0, t - i * 0.012);
        const pt = bezierPt(seg.p0, seg.cp, seg.p1, tp);
        ctx.save();
        ctx.globalAlpha = (1 - i / TRAIL_LEN) * 0.55;
        ctx.fillStyle   = '#FFD700';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur  = 8;
        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, Math.max(w * 0.009 * (1 - i * 0.06), w * 0.003), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Glowing head particle
      const head = bezierPt(seg.p0, seg.cp, seg.p1, t);
      const hx = head.x * w, hy = head.y * h;
      ctx.save();
      ctx.shadowColor = '#FFE566';
      ctx.shadowBlur  = 28;
      ctx.fillStyle   = '#FFE566';
      ctx.beginPath();
      ctx.arc(hx, hy, w * 0.020, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth   = 1.8;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.beginPath();
        ctx.moveTo(hx + Math.cos(a) * w * 0.020, hy + Math.sin(a) * w * 0.020);
        ctx.lineTo(hx + Math.cos(a) * w * 0.034, hy + Math.sin(a) * w * 0.034);
        ctx.stroke();
      }
      ctx.restore();
    }, 20);
  },

  _triggerArrivalBurst(pos) {
    const startTime = Date.now();
    const DURATION  = 900;
    const key       = 'arrival_' + pos.x + '_' + pos.y;
    const COLORS    = ['#FFD700', '#FF6B35', '#FFE566', '#FFFFFF'];

    this._engine.triggerOverlay(key, (ctx, w, h) => {
      const t = Math.min((Date.now() - startTime) / DURATION, 1);
      if (t >= 1) { this._engine.clearOverlay(key); return; }

      const x = pos.x * w, y = pos.y * h;
      const alpha = 1 - t;

      // Expanding ring
      ctx.save();
      ctx.globalAlpha = alpha * 0.75;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth   = 3;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur  = 20;
      ctx.beginPath();
      ctx.arc(x, y, w * (0.06 + t * 0.14), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Burst particles
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist  = t * w * 0.13;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = COLORS[i % COLORS.length];
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur  = 10;
        ctx.beginPath();
        ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, w * 0.009, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }, 21);
  },
});
