const BOOKS = require('../../utils/books');

const TWO_PI = Math.PI * 2;

// Ordered road stops: {bookIdx, lat, lon}
// Open road — caterpillar → wildthings → alice → wonder (more to come)
const ROAD = [
  { bookIdx: 3, lat: -0.10, lon: -0.50 },  // 🐛 caterpillar  (start)
  { bookIdx: 4, lat:  0.22, lon:  0.60 },  // 🦁 wildthings
  { bookIdx: 0, lat: -0.15, lon:  1.65 },  // 🐰 alice
  { bookIdx: 5, lat:  0.28, lon:  2.75 },  // ⭐ wonder        (current end)
];

// Per-stop accent colours
const COLORS = ['#FF6B6B', '#FF9A3C', '#9B59B6', '#2979FF'];

Page({
  data: { lang: 'en' },

  _canvas: null, _ctx: null,
  _w: 0, _h: 0, _cx: 0, _cy: 0, _R: 0,
  _rotY: 0.50,          // caterpillar faces viewer on load
  _dragStartX: 0, _dragStartRot: 0, _isDragging: false,

  onLoad() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
  },

  onReady() {
    wx.createSelectorQuery()
      .select('#planet-canvas')
      .fields({ node: true, size: true })
      .exec(res => {
        const canvas = res[0].node;
        const ctx    = canvas.getContext('2d');
        const dpr    = wx.getSystemInfoSync().pixelRatio;
        const w = res[0].width, h = res[0].height;
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
        this._canvas = canvas;
        this._ctx    = ctx;
        this._w = w; this._h = h;
        this._cx = w / 2; this._cy = h / 2;
        this._R  = w * 0.36;
        this._draw();
      });
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
    if (this._ctx) this._draw();
  },

  // ── 3D projection ─────────────────────────────────────────────────
  _project(lat, lon) {
    const { _cx: cx, _cy: cy, _R: R, _rotY: rotY } = this;
    const x0 = R * Math.cos(lat) * Math.sin(lon);
    const y0 = R * Math.sin(lat);
    const z0 = R * Math.cos(lat) * Math.cos(lon);

    const cosR = Math.cos(rotY), sinR = Math.sin(rotY);
    const x1 =  x0 * cosR + z0 * sinR;
    const z1 = -x0 * sinR + z0 * cosR;

    const tilt = 0.35;
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    const y2 = y0 * cosT - z1 * sinT;
    const z2 = y0 * sinT + z1 * cosT;

    const fov   = R * 3.2;
    const scale = fov / (fov + z2);
    return {
      sx: cx + x1 * scale,
      sy: cy - y2 * scale,
      z:  z2, scale,
      visible: z2 > -R * 0.1,
    };
  },

  // ── Main render ───────────────────────────────────────────────────
  _draw() {
    const { _ctx: ctx, _w: w, _h: h, _cx: cx, _cy: cy, _R: R } = this;
    ctx.clearRect(0, 0, w, h);

    // Space background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#080C24');
    bg.addColorStop(1, '#0D1840');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    this._drawStars(ctx, w, h);

    // Atmosphere glow
    const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35);
    glow.addColorStop(0, 'rgba(100,181,246,0.22)');
    glow.addColorStop(1, 'rgba(100,181,246,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, TWO_PI); ctx.fill();

    // Planet body
    const planet = ctx.createRadialGradient(cx - R*0.28, cy - R*0.3, R*0.04, cx, cy, R);
    planet.addColorStop(0,   '#90CAF9');
    planet.addColorStop(0.25,'#42A5F5');
    planet.addColorStop(0.6, '#1565C0');
    planet.addColorStop(1,   '#0D3A7A');
    ctx.fillStyle = planet;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TWO_PI); ctx.fill();

    // Specular
    const shine = ctx.createRadialGradient(cx - R*0.32, cy - R*0.34, 0, cx - R*0.18, cy - R*0.2, R*0.52);
    shine.addColorStop(0, 'rgba(255,255,255,0.38)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TWO_PI); ctx.fill();

    // Road (dotted) + arrows between stops
    this._drawRoad(ctx);

    // Checkpoints sorted back→front
    const pts = ROAD.map((stop, i) => ({
      ...this._project(stop.lat, stop.lon),
      book:  BOOKS[stop.bookIdx],
      color: COLORS[i],
      roadIdx: i,
    })).sort((a, b) => a.z - b.z);

    for (const pt of pts) this._drawCheckpoint(ctx, pt);
  },

  _drawStars(ctx, w, h) {
    const s = [
      [0.05,0.07],[0.18,0.03],[0.92,0.06],[0.83,0.11],[0.08,0.82],
      [0.94,0.88],[0.76,0.04],[0.02,0.43],[0.97,0.56],[0.50,0.02],
      [0.28,0.93],[0.70,0.96],[0.37,0.04],[0.64,0.09],[0.16,0.17],
      [0.87,0.30],[0.03,0.64],[0.95,0.73],[0.44,0.97],[0.58,0.99],
      [0.12,0.50],[0.88,0.50],[0.33,0.33],[0.66,0.70],[0.50,0.88],
    ];
    s.forEach(([fx, fy]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.arc(fx * w, fy * h, 1.3, 0, TWO_PI);
      ctx.fill();
    });
  },

  _drawRoad(ctx) {
    const R = this._R;
    const n = ROAD.length;

    for (let i = 0; i < n - 1; i++) {       // n-1: open road, no wrap
      const a = ROAD[i], b = ROAD[i + 1];

      // Unwrap longitude
      let lonA = a.lon, lonB = b.lon;
      if (lonB - lonA >  Math.PI) lonA += TWO_PI;
      if (lonA - lonB >  Math.PI) lonB += TWO_PI;

      const steps = 16;

      // --- Dotted path ---
      for (let s = 0; s <= steps; s++) {
        const t   = s / steps;
        const lat = a.lat + (b.lat - a.lat) * t;
        const lon = lonA  + (lonB  - lonA)  * t;
        const pt  = this._project(lat, lon);
        const alpha = Math.max(0.08, Math.min(0.65, (pt.z + R) / (2 * R)));
        ctx.fillStyle = `rgba(255,215,0,${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.sx, pt.sy, 3, 0, TWO_PI);
        ctx.fill();
      }

      // --- Arrow at ~55% along the segment (past midpoint, clearly directional) ---
      const at = 0.55;
      const arLat  = a.lat + (b.lat - a.lat) * at;
      const arLon  = lonA  + (lonB  - lonA)  * at;
      const arLat2 = a.lat + (b.lat - a.lat) * (at + 0.08);
      const arLon2 = lonA  + (lonB  - lonA)  * (at + 0.08);

      const ptA = this._project(arLat,  arLon);
      const ptB = this._project(arLat2, arLon2);

      const alpha = Math.max(0.1, Math.min(0.85, (ptA.z + R) / (R * 1.5)));
      const angle = Math.atan2(ptB.sy - ptA.sy, ptB.sx - ptA.sx);
      const sz    = 9 * Math.max(0.5, ptA.scale);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#FFD93D';
      ctx.translate(ptA.sx, ptA.sy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo( sz,       0);
      ctx.lineTo(-sz * 0.6,  sz * 0.55);
      ctx.lineTo(-sz * 0.6, -sz * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  },

  _drawCheckpoint(ctx, { sx, sy, z, scale, visible, book, color }) {
    const R    = this._R;
    const size = R * 0.21 * Math.max(0.55, scale);
    const alpha = visible ? Math.max(0.3, Math.min(1, (z + R) / (R * 1.1))) : 0.25;

    ctx.globalAlpha = alpha;

    if (z > R * 0.1) {
      ctx.fillStyle = color + '44';
      ctx.beginPath(); ctx.arc(sx, sy, size * 1.6, 0, TWO_PI); ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, TWO_PI); ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    const fontSize = Math.round(size * 1.05);
    ctx.font         = `${fontSize}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#fff';
    ctx.fillText(book.emoji, sx, sy);

    ctx.globalAlpha = 1;
  },

  // ── Touch ─────────────────────────────────────────────────────────
  onTouchStart(e) {
    const t = e.touches[0];
    this._dragStartX   = t.x;
    this._dragStartRot = this._rotY;
    this._isDragging   = false;
  },

  onTouchMove(e) {
    const dx = e.touches[0].x - this._dragStartX;
    if (Math.abs(dx) > 4) this._isDragging = true;
    this._rotY = this._dragStartRot + dx / (this._R * 1.1);
    this._draw();
  },

  onTouchEnd(e) {
    if (this._isDragging) return;
    const t  = e.changedTouches[0];
    const tx = t.x, ty = t.y;

    let best = -1, bestDist = this._R * 0.3;
    for (let i = 0; i < ROAD.length; i++) {
      const pt = this._project(ROAD[i].lat, ROAD[i].lon);
      if (!pt.visible) continue;
      const d = Math.hypot(tx - pt.sx, ty - pt.sy);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    if (best >= 0) {
      wx.navigateTo({ url: `/pages/book/book?id=${BOOKS[ROAD[best].bookIdx].id}` });
    }
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this.setData({ lang });
  },
});
