// Maps a tap (x, y) to a location, checking in reverse zIndex order
// so the topmost visible element wins.
//
// Supports two hit shapes:
//   radius  — circular, good for buildings drawn programmatically (current approach)
//   bounds  — axis-aligned box, used when image asset dimensions are known

class HitDetector {
  constructor(locations) {
    this._locations = locations;
    // Sort descending by zIndex once; update if locations change via setLocations()
    this._sorted = [...locations].sort((a, b) => b.zIndex - a.zIndex);
  }

  setLocations(locations) {
    this._locations = locations;
    this._sorted = [...locations].sort((a, b) => b.zIndex - a.zIndex);
  }

  find(tapX, tapY, assets, canvasSize) {
    const { w, h } = canvasSize;
    for (const loc of this._sorted) {
      if (loc.state === 'locked') continue;
      const x = loc.position.x * w;
      const y = loc.position.y * h;

      if (this._hits(loc, tapX, tapY, x, y, assets, w, h)) return loc;
    }
    return null;
  }

  _hits(loc, tapX, tapY, cx, cy, assets, w) {
    // Prefer explicit hitRadius on the location definition
    if (loc.hitRadius != null) {
      return Math.hypot(tapX - cx, tapY - cy) < loc.hitRadius * w;
    }

    // Fall back to image asset bounding box
    const asset = assets && assets.get(loc.asset);
    if (asset) {
      const lw = asset.width * loc.scale;
      const lh = asset.height * loc.scale;
      const left = cx - lw * asset.anchor.x;
      const top = cy - lh * asset.anchor.y;
      return tapX >= left && tapX <= left + lw && tapY >= top && tapY <= top + lh;
    }

    // Last resort: fixed radius of 13% canvas width
    return Math.hypot(tapX - cx, tapY - cy) < w * 0.13;
  }
}

module.exports = { HitDetector };
