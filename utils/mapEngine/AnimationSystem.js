// Manages two types of animations:
//   idle   — looping, started on init for each location that declares one
//   onTap  — one-shot, triggered by HitDetector, reverts to idle on complete
//
// Each active animation is keyed by a string (locationId or locationId+'_tap').
// On each tick(), state advances; getDrawables() returns drawable objects
// that the engine merges into the main sorted draw list.

class AnimationSystem {
  constructor() {
    this._active = new Map(); // key -> AnimState
  }

  startIdle(locations, animDefs) {
    for (const loc of locations) {
      const animId = loc.animations && loc.animations.idle;
      if (animId) this._start(loc.id, animId, animDefs, loc.position, true);
    }
  }

  trigger(loc, animDefs) {
    const animId = loc.animations && loc.animations.onTap;
    if (!animId) return;
    const key = loc.id + '_tap';
    // Don't restart if already playing
    if (this._active.has(key)) return;
    this._start(key, animId, animDefs, loc.position, false, () => {
      this._active.delete(key);
    });
  }

  tick(delta, assets) {
    for (const [key, state] of this._active) {
      if (state.done) { this._active.delete(key); continue; }
      if (state.drawFn) continue; // programmatic animations handle their own timing

      const asset = assets.get(state.def.asset);
      if (!asset || !asset.isSheet) continue;

      state.elapsed += delta;
      const frameDuration = 1000 / asset.fps;
      if (state.elapsed >= frameDuration) {
        state.elapsed -= frameDuration;
        state.currentFrame++;
        if (state.currentFrame >= asset.frameCount) {
          if (state.loop) {
            state.currentFrame = 0;
          } else {
            state.done = true;
            if (state.onComplete) state.onComplete();
          }
        }
      }
    }
  }

  getDrawables(assets, canvasSize) {
    const drawables = [];
    const { w, h } = canvasSize;

    for (const [, state] of this._active) {
      if (state.done) continue;

      if (state.drawFn) {
        drawables.push({ zIndex: state.zIndex || 100, draw: (ctx) => state.drawFn(ctx, state.position, w, h) });
        continue;
      }

      const asset = assets.get(state.def.asset);
      if (!asset || !asset.isSheet) continue;

      const frame = state.currentFrame;
      const cols = Math.floor(asset.img.width / asset.frameWidth);
      const sx = (frame % cols) * asset.frameWidth;
      const sy = Math.floor(frame / cols) * asset.frameHeight;
      const offset = state.def.offset || { x: 0, y: 0 };
      const px = (state.position.x + offset.x) * w;
      const py = (state.position.y + offset.y) * h;

      drawables.push({
        zIndex: state.zIndex || 100,
        draw(ctx) {
          ctx.drawImage(
            asset.img,
            sx, sy, asset.frameWidth, asset.frameHeight,
            px - asset.frameWidth / 2,
            py - asset.frameHeight / 2,
            asset.frameWidth, asset.frameHeight,
          );
        },
      });
    }
    return drawables;
  }

  _start(key, animId, animDefs, position, loop, onComplete) {
    const def = animDefs[animId];
    if (!def) return;
    this._active.set(key, {
      def,
      position,
      loop: def.loop != null ? def.loop : loop,
      drawFn: def.drawFn || null,
      zIndex: def.zIndex || 100,
      currentFrame: 0,
      elapsed: 0,
      done: false,
      onComplete: onComplete || null,
    });
  }
}

module.exports = { AnimationSystem };
