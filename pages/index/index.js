const BOOKS = require('../../utils/books');

const TWO_PI = Math.PI * 2;

const ROAD = [
  { bookIdx: 3, lat: -0.10, lon: -0.50 },
  { bookIdx: 4, lat:  0.22, lon:  0.60 },
  { bookIdx: 0, lat: -0.15, lon:  1.65 },
  { bookIdx: 5, lat:  0.28, lon:  2.75 },
];
const COLORS = ['#FF6B6B', '#FF9A3C', '#9B59B6', '#2979FF'];

// Organic continent patches — [angle, radiusFraction] control points
const TERRAIN_PATCHES = [
  { lat: -0.08, lon: -0.50, baseR: 0.36, fill: '#2D6A2D', stroke: '#1A4A18', hi: '#3E7A35',
    pts: [[0.00,0.82],[0.35,1.12],[0.70,0.88],[1.05,1.10],[1.40,0.78],[1.75,1.08],[2.10,0.90],[2.45,1.14],[2.80,0.82],[3.15,1.05],[3.50,0.87],[3.85,1.10],[4.20,0.83],[4.55,1.06],[4.90,0.88],[5.25,1.08],[5.60,0.85],[5.90,0.88]] },
  { lat:  0.05, lon: -0.30, baseR: 0.20, fill: '#3A7A35', stroke: '#2A5A28', hi: '#4A8A40',
    pts: [[0.0,0.88],[0.6,1.10],[1.2,0.85],[1.8,1.08],[2.4,0.82],[3.0,1.05],[3.6,0.88],[4.2,1.10],[4.8,0.85],[5.4,1.02]] },
  { lat:  0.22, lon:  0.60, baseR: 0.30, fill: '#6B6070', stroke: '#4A4055', hi: '#7A7080',
    pts: [[0.00,0.95],[0.30,0.62],[0.60,1.22],[0.90,0.68],[1.20,1.18],[1.50,0.65],[1.80,1.20],[2.10,0.70],[2.40,1.12],[2.70,0.75],[3.00,1.05],[3.30,0.62],[3.60,1.15],[3.90,0.70],[4.20,1.18],[4.50,0.65],[4.80,1.10],[5.10,0.72],[5.40,1.02],[5.70,0.80]] },
  { lat:  0.10, lon:  0.45, baseR: 0.18, fill: '#5A5565', stroke: '#3A3545', hi: '#6A6575',
    pts: [[0.0,0.90],[0.5,1.10],[1.0,0.72],[1.5,1.18],[2.0,0.78],[2.5,1.12],[3.0,0.72],[3.5,1.08],[4.0,0.80],[4.5,1.14],[5.0,0.75],[5.5,1.02]] },
  { lat: -0.12, lon:  1.65, baseR: 0.24, fill: '#1E2030', stroke: '#0A0A18', hi: '#282A3E',
    pts: [[0.0,0.90],[0.40,1.08],[0.80,0.78],[1.20,1.12],[1.60,0.85],[2.00,1.05],[2.40,0.80],[2.80,1.08],[3.20,0.88],[3.60,1.02],[4.00,0.82],[4.40,1.10],[4.80,0.85],[5.20,1.04],[5.60,0.90]] },
  { lat:  0.04, lon:  1.80, baseR: 0.15, fill: '#2A2C40', stroke: '#1A1C30', hi: '#303248',
    pts: [[0.0,0.92],[0.7,1.08],[1.4,0.85],[2.1,1.05],[2.8,0.88],[3.5,1.10],[4.2,0.85],[4.9,1.02],[5.5,0.90]] },
  { lat:  0.26, lon:  2.75, baseR: 0.28, fill: '#5A8A3A', stroke: '#3E6828', hi: '#6A9A4A',
    pts: [[0.00,0.92],[0.40,1.10],[0.80,0.85],[1.20,1.08],[1.60,0.90],[2.00,1.12],[2.40,0.88],[2.80,1.05],[3.20,0.90],[3.60,1.10],[4.00,0.85],[4.40,1.02],[4.80,0.88],[5.20,1.08],[5.60,0.88]] },
  { lat:  0.08, lon:  0.08, baseR: 0.24, fill: '#4A7835', stroke: '#2E5820', hi: '#5A8840',
    pts: [[0,0.9],[0.7,1.1],[1.4,0.85],[2.1,1.05],[2.8,0.9],[3.5,1.08],[4.2,0.88],[5.0,1.0],[5.7,0.9]] },
  { lat:  0.05, lon:  1.10, baseR: 0.20, fill: '#4A7035', stroke: '#2E5020', hi: '#5A8040',
    pts: [[0,0.95],[0.8,1.08],[1.6,0.88],[2.4,1.05],[3.2,0.90],[4.0,1.06],[4.8,0.85],[5.5,0.98]] },
  { lat:  0.12, lon:  2.20, baseR: 0.18, fill: '#4A7835', stroke: '#2E5820', hi: '#5A8840',
    pts: [[0,0.88],[0.9,1.10],[1.8,0.85],[2.7,1.05],[3.6,0.90],[4.5,1.08],[5.4,0.88]] },
];

// One illustration per biome
const TERRAIN_ICONS = [
  { type: 'forest',   lat: -0.12, lon: -0.52 },
  { type: 'mountain', lat:  0.26, lon:  0.58 },
  { type: 'cave',     lat: -0.24, lon:  1.63 },
  { type: 'flowers',  lat:  0.32, lon:  2.72 },
];

Page({
  data: { lang: 'en', hintVisible: true, hintText: '' },

  _canvas: null, _ctx: null,
  _w: 0, _h: 0, _cx: 0, _cy: 0, _R: 0,
  _rotY: 0.50,
  _zoom: 1.0,
  _dragStartX: 0, _dragStartRot: 0, _isDragging: false,
  _lastTapTime: 0, _tapTimer: null,

  onLoad() {
    const lang = wx.getStorageSync('lang') || 'en';
    const hint = lang === 'en'
      ? '← swipe to spin  ·  tap a stop to play →'
      : '← 左右滑动  ·  点击站点出发 →';
    this.setData({ lang, hintText: hint });
    setTimeout(() => this.setData({ hintVisible: false }), 4000);
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
        this._canvas = canvas; this._ctx = ctx;
        this._w = w; this._h = h;
        this._cx = w / 2; this._cy = h / 2;
        this._R  = w * 0.33;
        this._draw();
      });
  },

  onShow() {
    const lang = wx.getStorageSync('lang') || 'en';
    this.setData({ lang });
    if (this._ctx) this._draw();
  },

  _project(lat, lon) {
    const R  = this._R * this._zoom;
    const cx = this._cx, cy = this._cy;
    const x0 = R * Math.cos(lat) * Math.sin(lon);
    const y0 = R * Math.sin(lat);
    const z0 = R * Math.cos(lat) * Math.cos(lon);
    const cosR = Math.cos(this._rotY), sinR = Math.sin(this._rotY);
    const x1 =  x0 * cosR + z0 * sinR;
    const z1 = -x0 * sinR + z0 * cosR;
    const tilt = 0.35;
    const y2 = y0 * Math.cos(tilt) - z1 * Math.sin(tilt);
    const z2 = y0 * Math.sin(tilt) + z1 * Math.cos(tilt);
    const fov   = R * 3.2;
    const scale = fov / (fov + z2);
    return { sx: cx + x1 * scale, sy: cy - y2 * scale, z: z2, scale, visible: z2 > -R * 0.1 };
  },

  _draw() {
    const { _ctx: ctx, _w: w, _h: h, _cx: cx, _cy: cy } = this;
    const R = this._R * this._zoom;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#080C24'); bg.addColorStop(1, '#0D1840');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    this._drawStars(ctx, w, h);

    const glow = ctx.createRadialGradient(cx, cy, R*0.85, cx, cy, R*1.35);
    glow.addColorStop(0, 'rgba(100,181,246,0.22)');
    glow.addColorStop(1, 'rgba(100,181,246,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, R*1.35, 0, TWO_PI); ctx.fill();

    const ocean = ctx.createRadialGradient(cx-R*0.25, cy-R*0.28, R*0.04, cx, cy, R);
    ocean.addColorStop(0, '#90CAF9'); ocean.addColorStop(0.25, '#42A5F5');
    ocean.addColorStop(0.6, '#1565C0'); ocean.addColorStop(1, '#0D3A7A');
    ctx.fillStyle = ocean;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TWO_PI); ctx.fill();

    // Terrain patches clipped to sphere
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TWO_PI); ctx.clip();
    this._drawTerrainPatches(ctx, R);
    ctx.restore();

    // Specular shine on sphere
    const shine = ctx.createRadialGradient(cx-R*0.32, cy-R*0.34, 0, cx-R*0.18, cy-R*0.2, R*0.52);
    shine.addColorStop(0, 'rgba(255,255,255,0.22)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TWO_PI); ctx.fill();

    this._drawTerrainIcons(ctx, R);
    this._drawRoad(ctx, R);

    const pts = ROAD.map((s, i) => ({
      ...this._project(s.lat, s.lon),
      book: BOOKS[s.bookIdx], color: COLORS[i], roadIdx: i,
    })).sort((a, b) => a.z - b.z);
    for (const pt of pts) this._drawCheckpoint(ctx, pt, R);
  },

  // ── Organic continent patches ──────────────────────────────────────
  _drawTerrainPatches(ctx, R) {
    for (const patch of TERRAIN_PATCHES) {
      const pt = this._project(patch.lat, patch.lon);
      if (!pt.visible) continue;
      const r = patch.baseR * R * pt.scale;
      const alpha = Math.max(0, Math.min(0.95, (pt.z + R) / (R * 1.5)));

      // Screen-space polygon points from control angles
      const sp = patch.pts.map(([a, rf]) => [
        pt.sx + Math.cos(a) * r * rf,
        pt.sy + Math.sin(a) * r * rf,
      ]);
      const n = sp.length;

      // Smooth bezier through midpoints
      ctx.beginPath();
      const fm = [(sp[0][0]+sp[n-1][0])/2, (sp[0][1]+sp[n-1][1])/2];
      ctx.moveTo(fm[0], fm[1]);
      for (let i = 0; i < n; i++) {
        const [x1,y1] = sp[i];
        const [x2,y2] = sp[(i+1)%n];
        ctx.quadraticCurveTo(x1, y1, (x1+x2)/2, (y1+y2)/2);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(pt.sx-r*0.2, pt.sy-r*0.2, 0, pt.sx, pt.sy, r*1.1);
      grad.addColorStop(0, patch.hi);
      grad.addColorStop(0.55, patch.fill);
      grad.addColorStop(1, patch.stroke);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = patch.stroke; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
    }
  },

  // ── Terrain icons (depth-sorted) ──────────────────────────────────
  _drawTerrainIcons(ctx, R) {
    const sorted = TERRAIN_ICONS.map(ic => ({ ...ic, ...this._project(ic.lat, ic.lon) }))
      .sort((a, b) => a.z - b.z);
    for (const ic of sorted) {
      if (!ic.visible) continue;
      const alpha = Math.max(0.2, Math.min(1, (ic.z + R) / (R * 1.2)));
      const s = R * 0.22 * ic.scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      if      (ic.type === 'forest')   this._drawForest(ctx, ic.sx, ic.sy, s);
      else if (ic.type === 'mountain') this._drawMountainRange(ctx, ic.sx, ic.sy, s);
      else if (ic.type === 'cave')     this._drawCaveEntrance(ctx, ic.sx, ic.sy, s);
      else if (ic.type === 'flowers')  this._drawFlowers(ctx, ic.sx, ic.sy, s);
      ctx.restore();
    }
  },

  // ── Forest: 5 layered pine trees ──────────────────────────────────
  _drawForest(ctx, x, y, s) {
    // [dx_fraction, height_scale, isBack]
    const trees = [
      [-1.48, 0.60, true], [-1.15, 0.72, true], [0.82, 0.68, true],
      [-0.38, 1.00, false], [1.18, 0.80, false],
    ];
    for (const back of [true, false]) {
      for (const [df, hs, isBack] of trees) {
        if (isBack !== back) continue;
        const tx = x + s*df;
        const h  = s * 1.9 * hs;
        const hw = s * 0.65 * hs;
        ctx.fillStyle = isBack ? '#3E2010' : '#5C3317';
        ctx.fillRect(tx - hw*0.12, y + s*0.02, hw*0.24, s*0.38*hs);
        ctx.fillStyle = isBack ? '#1A4A1A' : '#1B5E20';
        ctx.beginPath(); ctx.moveTo(tx, y-h*0.50); ctx.lineTo(tx-hw, y+s*0.05); ctx.lineTo(tx+hw, y+s*0.05); ctx.closePath(); ctx.fill();
        ctx.fillStyle = isBack ? '#256025' : '#2E7D32';
        ctx.beginPath(); ctx.moveTo(tx, y-h*0.78); ctx.lineTo(tx-hw*0.75, y-h*0.28); ctx.lineTo(tx+hw*0.75, y-h*0.28); ctx.closePath(); ctx.fill();
        ctx.fillStyle = isBack ? '#307030' : '#388E3C';
        ctx.beginPath(); ctx.moveTo(tx, y-h); ctx.lineTo(tx-hw*0.48, y-h*0.62); ctx.lineTo(tx+hw*0.48, y-h*0.62); ctx.closePath(); ctx.fill();
      }
    }
  },

  // ── Mountain range: 3 peaks with snow and shadow ──────────────────
  _drawMountainRange(ctx, x, y, s) {
    const peaks = [
      { dx: -s*1.05, h: 1.35, w: 0.88 },
      { dx:  s*0.15, h: 2.05, w: 1.02 },
      { dx:  s*1.22, h: 1.65, w: 0.92 },
    ];
    // Bodies
    for (const p of peaks) {
      const px = x+p.dx, ph = s*p.h, pw = s*p.w;
      ctx.fillStyle = '#546E7A';
      ctx.beginPath(); ctx.moveTo(px, y-ph); ctx.lineTo(px-pw, y+s*0.28); ctx.lineTo(px+pw, y+s*0.28); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#455A64';
      ctx.beginPath(); ctx.moveTo(px, y-ph); ctx.lineTo(px-pw*0.14, y-ph*0.52); ctx.lineTo(px-pw, y+s*0.28); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#37474F'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(px+pw*0.2, y-ph*0.38); ctx.lineTo(px+pw*0.44, y+s*0.12); ctx.stroke();
    }
    // Snow caps
    for (const p of peaks) {
      const px = x+p.dx, ph = s*p.h, sw = s*p.w*0.38;
      ctx.fillStyle = '#ECEFF1';
      ctx.beginPath(); ctx.moveTo(px, y-ph); ctx.lineTo(px-sw, y-ph*0.71); ctx.lineTo(px+sw*0.88, y-ph*0.67); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#CFD8DC';
      ctx.beginPath(); ctx.moveTo(px, y-ph); ctx.lineTo(px-sw*0.12, y-ph*0.79); ctx.lineTo(px-sw, y-ph*0.71); ctx.closePath(); ctx.fill();
    }
  },

  // ── Cave entrance with arch, stalactites, glowing eyes ────────────
  _drawCaveEntrance(ctx, x, y, s) {
    const aw = s*1.30, ah = s*1.05;
    // Rock arch
    ctx.fillStyle = '#37474F';
    ctx.beginPath();
    ctx.moveTo(x-aw*1.12, y+s*0.18); ctx.lineTo(x-aw*1.12, y-s*0.08);
    ctx.quadraticCurveTo(x-aw, y-ah*0.60, x-aw*0.42, y-ah);
    ctx.quadraticCurveTo(x,    y-ah*1.08,  x+aw*0.42, y-ah);
    ctx.quadraticCurveTo(x+aw, y-ah*0.60, x+aw*1.12, y-s*0.08);
    ctx.lineTo(x+aw*1.12, y+s*0.18); ctx.closePath(); ctx.fill();
    // Left shadow
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.moveTo(x-aw*1.12, y+s*0.18); ctx.lineTo(x-aw*1.12, y-s*0.08);
    ctx.quadraticCurveTo(x-aw, y-ah*0.50, x-aw*0.70, y-ah*0.70);
    ctx.lineTo(x-aw*0.62, y+s*0.18); ctx.closePath(); ctx.fill();
    // Cave darkness
    ctx.fillStyle = '#050510';
    ctx.beginPath(); this._ell(ctx, x, y-ah*0.32, aw*0.62, ah*0.66, 0); ctx.fill();
    // Stalactites
    ctx.fillStyle = '#546E7A';
    [[-aw*0.34, ah*0.80], [0, ah*0.87], [aw*0.32, ah*0.79]].forEach(([dx, topY]) => {
      const ty = y-topY, tl = s*0.22;
      ctx.beginPath(); ctx.moveTo(x+dx-s*0.07, ty); ctx.lineTo(x+dx+s*0.07, ty); ctx.lineTo(x+dx, ty+tl); ctx.closePath(); ctx.fill();
    });
    // Glowing eyes inside cave
    ctx.fillStyle = 'rgba(255,210,0,0.75)';
    ctx.beginPath(); this._ell(ctx, x-ah*0.13, y-ah*0.26, s*0.07, s*0.05, 0); ctx.fill();
    ctx.beginPath(); this._ell(ctx, x+ah*0.13, y-ah*0.26, s*0.07, s*0.05, 0); ctx.fill();
  },

  // ── Meadow: grass + 3 flowers with petals ─────────────────────────
  _drawFlowers(ctx, x, y, s) {
    // Grass patch
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath(); this._ell(ctx, x, y+s*0.08, s*1.55, s*0.38, 0); ctx.fill();
    // Grass blades
    ctx.strokeStyle = '#43A047'; ctx.lineWidth = 1.2;
    [[-s*1.0,0],[- s*0.48,-s*0.04],[s*0.08,0],[s*0.62,-s*0.03],[s*1.12,s*0.02]].forEach(([bx,by]) => {
      ctx.beginPath(); ctx.moveTo(x+bx, y+by);
      ctx.quadraticCurveTo(x+bx+s*0.14, y+by-s*0.32, x+bx+s*0.06, y+by-s*0.52);
      ctx.stroke();
    });
    // Flowers
    [{ dx:-s*0.92, pCol:'#FF8A80', cCol:'#FF5252', n:5 },
     { dx: s*0.18, pCol:'#FFD740', cCol:'#FFAB00', n:6 },
     { dx: s*1.08, pCol:'#EA80FC', cCol:'#AA00FF', n:5 }].forEach(({ dx, pCol, cCol, n }) => {
      const fx = x+dx, fy = y-s*0.22;
      const pr = s*0.20, or = pr*1.45;
      // Stem
      ctx.strokeStyle = '#2E7D32'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(fx, fy+pr); ctx.lineTo(fx, y+s*0.08); ctx.stroke();
      // Petals
      ctx.fillStyle = pCol;
      for (let i = 0; i < n; i++) {
        const a = (i/n)*TWO_PI;
        ctx.beginPath(); this._ell(ctx, fx+Math.cos(a)*or, fy+Math.sin(a)*or, pr*0.88, pr*0.52, a); ctx.fill();
      }
      // Centre
      ctx.fillStyle = '#FFF9C4'; ctx.beginPath(); ctx.arc(fx, fy, pr*0.54, 0, TWO_PI); ctx.fill();
      ctx.fillStyle = cCol;    ctx.beginPath(); ctx.arc(fx, fy, pr*0.26, 0, TWO_PI); ctx.fill();
    });
  },

  // ctx.ellipse() polyfill (not in WeChat Canvas 2D)
  _ell(ctx, x, y, rx, ry, rot) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(rx, ry);
    ctx.arc(0, 0, 1, 0, TWO_PI);
    ctx.restore();
  },

  // ── Road ──────────────────────────────────────────────────────────
  _drawRoad(ctx, R) {
    const n = ROAD.length;
    for (let i = 0; i < n - 1; i++) {
      const a = ROAD[i], b = ROAD[i+1];
      let lonA = a.lon, lonB = b.lon;
      if (lonB - lonA >  Math.PI) lonA += TWO_PI;
      if (lonA - lonB >  Math.PI) lonB += TWO_PI;
      for (let s = 0; s <= 18; s++) {
        const t  = s / 18;
        const pt = this._project(a.lat+(b.lat-a.lat)*t, lonA+(lonB-lonA)*t);
        const al = Math.max(0.08, Math.min(0.7, (pt.z+R)/(2*R)));
        ctx.fillStyle = `rgba(255,215,0,${al})`;
        ctx.beginPath(); ctx.arc(pt.sx, pt.sy, 3, 0, TWO_PI); ctx.fill();
      }
      const ptA = this._project(a.lat+(b.lat-a.lat)*0.55, lonA+(lonB-lonA)*0.55);
      const ptB = this._project(a.lat+(b.lat-a.lat)*0.63, lonA+(lonB-lonA)*0.63);
      const al  = Math.max(0.1, Math.min(0.9, (ptA.z+R)/(R*1.5)));
      const ang = Math.atan2(ptB.sy-ptA.sy, ptB.sx-ptA.sx);
      const sz  = 9 * Math.max(0.5, ptA.scale);
      ctx.save();
      ctx.globalAlpha = al; ctx.fillStyle = '#FFD93D';
      ctx.translate(ptA.sx, ptA.sy); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(sz,0); ctx.lineTo(-sz*0.6,sz*0.55); ctx.lineTo(-sz*0.6,-sz*0.55); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  },

  // ── Checkpoint circles ────────────────────────────────────────────
  _drawCheckpoint(ctx, { sx, sy, z, scale, visible, book, color }, R) {
    const size  = R * 0.21 * Math.max(0.55, scale);
    const alpha = visible ? Math.max(0.3, Math.min(1, (z+R)/(R*1.1))) : 0.25;
    ctx.globalAlpha = alpha;
    if (z > R*0.1) {
      ctx.fillStyle = color + '44';
      ctx.beginPath(); ctx.arc(sx, sy, size*1.6, 0, TWO_PI); ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(sx, sy, size, 0, TWO_PI); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.font = `${Math.round(size*1.05)}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    ctx.fillText(book.emoji, sx, sy);
    ctx.globalAlpha = 1;
  },

  // ── Stars ─────────────────────────────────────────────────────────
  _drawStars(ctx, w, h) {
    [[0.05,0.07],[0.18,0.03],[0.92,0.06],[0.83,0.11],[0.08,0.82],
     [0.94,0.88],[0.76,0.04],[0.02,0.43],[0.97,0.56],[0.50,0.02],
     [0.28,0.93],[0.70,0.96],[0.37,0.04],[0.64,0.09],[0.16,0.17],
     [0.87,0.30],[0.03,0.64],[0.95,0.73],[0.44,0.97],[0.58,0.99],
     [0.12,0.50],[0.88,0.50],[0.33,0.33],[0.66,0.70],[0.50,0.88],
    ].forEach(([fx,fy]) => {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(fx*w, fy*h, 1.3, 0, TWO_PI); ctx.fill();
    });
  },

  // ── Zoom toggle (smooth animation) ───────────────────────────────
  _toggleZoom() {
    const target = this._zoom > 1.2 ? 1.0 : 1.7;
    const start  = this._zoom, t0 = Date.now(), dur = 320;
    const tick   = () => {
      const p = Math.min(1, (Date.now()-t0)/dur);
      const e = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      this._zoom = start + (target-start)*e;
      this._draw();
      if (p < 1) this._canvas.requestAnimationFrame(tick);
    };
    this._canvas.requestAnimationFrame(tick);
    const lang = this.data.lang;
    const hint = target > 1.2
      ? (lang === 'en' ? 'Double tap to zoom out' : '双击缩小')
      : (lang === 'en' ? 'Double tap to zoom in 🔍' : '双击放大 🔍');
    this.setData({ hintText: hint, hintVisible: true });
    setTimeout(() => this.setData({ hintVisible: false }), 2500);
  },

  // ── Touch handlers ────────────────────────────────────────────────
  onTouchStart(e) {
    this._dragStartX   = e.touches[0].x;
    this._dragStartRot = this._rotY;
    this._isDragging   = false;
  },

  onTouchMove(e) {
    const dx = e.touches[0].x - this._dragStartX;
    if (Math.abs(dx) > 4) this._isDragging = true;
    this._rotY = this._dragStartRot + dx / (this._R * this._zoom * 1.1);
    this._draw();
  },

  onTouchEnd(e) {
    if (this._isDragging) return;
    const { x: tx, y: ty } = e.changedTouches[0];
    const now = Date.now();
    if (now - this._lastTapTime < 300) {
      clearTimeout(this._tapTimer);
      this._lastTapTime = 0;
      this._toggleZoom();
    } else {
      this._lastTapTime = now;
      this._tapTimer = setTimeout(() => {
        const R = this._R * this._zoom;
        let best = -1, bestDist = R * 0.30;
        for (let i = 0; i < ROAD.length; i++) {
          const pt = this._project(ROAD[i].lat, ROAD[i].lon);
          if (!pt.visible) continue;
          const d = Math.hypot(tx - pt.sx, ty - pt.sy);
          if (d < bestDist) { bestDist = d; best = i; }
        }
        if (best >= 0) {
          wx.navigateTo({ url: `/pages/intro/intro?id=${BOOKS[ROAD[best].bookIdx].id}` });
        }
      }, 310);
    }
  },

  setLang(e) {
    const lang = e.currentTarget.dataset.val;
    wx.setStorageSync('lang', lang);
    getApp().globalData.lang = lang;
    this.setData({ lang });
  },
});
