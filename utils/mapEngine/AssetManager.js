class AssetManager {
  constructor(canvas) {
    this._canvas = canvas;
    this._cache = {};
  }

  async loadAll(assetDefs) {
    const entries = Object.entries(assetDefs);
    await Promise.all(entries.map(([id, def]) => this._load(id, def)));
  }

  async _load(id, def) {
    if (def.type === 'image') {
      this._cache[id] = await this._loadImage(def.src, def.anchor || { x: 0.5, y: 1.0 });
    } else if (def.type === 'spritesheet') {
      this._cache[id] = await this._loadSpritesheet(def);
    }
  }

  _loadImage(src, anchor) {
    return new Promise((resolve, reject) => {
      const img = this._canvas.createImage();
      img.onload = () => resolve({ img, anchor, width: img.width, height: img.height });
      img.onerror = reject;
      img.src = src;
    });
  }

  async _loadSpritesheet(def) {
    const { src, frameWidth, frameHeight, frameCount, fps, anchor } = def;
    const loaded = await this._loadImage(src, anchor || { x: 0.5, y: 1.0 });
    return { ...loaded, frameWidth, frameHeight, frameCount, fps, isSheet: true };
  }

  get(id) {
    return this._cache[id] || null;
  }

  has(id) {
    return id in this._cache;
  }
}

module.exports = { AssetManager };
