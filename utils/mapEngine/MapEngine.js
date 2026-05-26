const { AssetManager }    = require('./AssetManager');
const { LayerRenderer }   = require('./LayerRenderer');
const { AnimationSystem } = require('./AnimationSystem');
const { HitDetector }     = require('./HitDetector');

class MapEngine {
  constructor(canvas, config) {
    this._canvas    = canvas;
    this._ctx       = canvas.getContext('2d');
    this._config    = config;
    this._size      = null; // set in init()
    this._running   = false;
    this._lastTime  = 0;

    this._assets    = new AssetManager(canvas);
    this._renderer  = new LayerRenderer();
    this._animator  = new AnimationSystem();
    this._detector  = new HitDetector(config.locations);
    this._overlays  = new Map(); // key → { drawFn(ctx,w,h), zIndex }
  }

  async init(canvasWidth, canvasHeight) {
    const dpr = wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio;

    this._canvas.width  = canvasWidth  * dpr;
    this._canvas.height = canvasHeight * dpr;
    this._ctx.scale(dpr, dpr);
    this._size = { w: canvasWidth, h: canvasHeight };

    // Load image/spritesheet assets (skips entries that only have drawFn)
    const imageDefs = {};
    for (const [id, def] of Object.entries(this._config.assets || {})) {
      if (def.type === 'image' || def.type === 'spritesheet') imageDefs[id] = def;
    }
    if (Object.keys(imageDefs).length) await this._assets.loadAll(imageDefs);

    this._animator.startIdle(this._config.locations, this._config.animations || {});
    this._startLoop();
  }

  handleTap(tapX, tapY) {
    const loc = this._detector.find(tapX, tapY, this._assets, this._size);
    if (loc) {
      this._animator.trigger(loc, this._config.animations || {});
      if (loc.onTap) loc.onTap(loc);
    }
    return loc;
  }

  // Call this after dynamically adding/updating locations
  updateLocations(locations) {
    this._config.locations = locations;
    this._detector.setLocations(locations);
  }

  triggerOverlay(key, drawFn, zIndex = 50) {
    this._overlays.set(key, { drawFn, zIndex });
  }

  clearOverlay(key) {
    this._overlays.delete(key);
  }

  pause() {
    this._running = false;
  }

  resume() {
    if (!this._running) this._startLoop();
  }

  destroy() {
    this._running = false;
  }

  // ── Private ────────────────────────────────────────────────────────────

  _startLoop() {
    this._running = true;
    const loop = (timestamp) => {
      if (!this._running) return;
      const delta = this._lastTime ? timestamp - this._lastTime : 0;
      this._lastTime = timestamp;
      this._tick(delta);
      this._canvas.requestAnimationFrame(loop);
    };
    this._canvas.requestAnimationFrame(loop);
  }

  _tick(delta) {
    const { _ctx: ctx, _config: cfg, _assets: assets, _animator: anim, _renderer: rend, _size: size } = this;

    anim.tick(delta, assets);

    ctx.clearRect(0, 0, size.w, size.h);

    const staticDrawables  = rend.buildDrawables(cfg, assets, size);
    const animDrawables    = anim.getDrawables(assets, size);
    const overlayDrawables = [];
    for (const [, ov] of this._overlays) {
      overlayDrawables.push({ zIndex: ov.zIndex, draw: (c) => ov.drawFn(c, size.w, size.h) });
    }

    const all = [...staticDrawables, ...animDrawables, ...overlayDrawables].sort((a, b) => a.zIndex - b.zIndex);
    for (const d of all) {
      try {
        d.draw(ctx);
      } catch (e) {
        console.error('[MapEngine] draw error zIndex=' + d.zIndex, e);
      }
    }
  }
}

module.exports = { MapEngine };
