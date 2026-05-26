// Builds a flat list of drawables from the map config, sorted by zIndex.
// Each drawable is { zIndex, draw(ctx) }.
// Supports both image-based assets and programmatic drawFn.

class LayerRenderer {
  buildDrawables(config, assets, canvasSize) {
    const { w, h } = canvasSize;
    const drawables = [];

    drawables.push(this._background(config.map, assets, w, h));

    for (const dec of config.decorations) {
      drawables.push(this._decoration(dec, assets, w, h));
    }

    drawables.push(this._path(config.paths, w, h));

    for (const loc of config.locations) {
      drawables.push(this._location(loc, assets, w, h));
      drawables.push(this._banner(loc, w, h));
    }

    return drawables;
  }

  _background(mapCfg, assets, w, h) {
    return {
      zIndex: 0,
      draw(ctx) {
        if (mapCfg.drawFn) {
          mapCfg.drawFn(ctx, w, h);
          return;
        }
        const asset = assets.get(mapCfg.background);
        if (asset) ctx.drawImage(asset.img, 0, 0, w, h);
      },
    };
  }

  _decoration(dec, assets, w, h) {
    return {
      zIndex: dec.zIndex,
      draw(ctx) {
        if (dec.drawFn) { dec.drawFn(ctx, dec.position.x * w, dec.position.y * h, dec.scale, w, h); return; }
        const asset = assets.get(dec.asset);
        if (!asset) return;
        const dw = asset.width * dec.scale, dh = asset.height * dec.scale;
        ctx.drawImage(asset.img, dec.position.x * w - dw * asset.anchor.x, dec.position.y * h - dh * asset.anchor.y, dw, dh);
      },
    };
  }

  _path(pathsCfg, w, h) {
    return {
      zIndex: pathsCfg.zIndex || 5,
      draw(ctx) {
        const { style, routes } = pathsCfg;
        ctx.save();
        for (const route of routes) {
          // Route can override with its own drawFn (e.g. quadratic curves)
          if (route.drawFn) { route.drawFn(ctx, w, h); continue; }
          ctx.strokeStyle = style.color;
          ctx.lineWidth = style.lineWidth || w * .011;
          ctx.globalAlpha = style.opacity != null ? style.opacity : 1;
          ctx.lineCap = style.lineCap || 'round';
          ctx.setLineDash(style.dashPattern || [w * .018, w * .028]);
          ctx.beginPath();
          route.waypoints.forEach((pt, i) => {
            const x = pt.x * w, y = pt.y * h;
            if (i === 0) ctx.moveTo(x, y);
            else if (pt.cp) ctx.quadraticCurveTo(pt.cp[0] * w, pt.cp[1] * h, x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      },
    };
  }

  _location(loc, assets, w, h) {
    return {
      zIndex: loc.zIndex,
      draw(ctx) {
        const x = loc.position.x * w, y = loc.position.y * h;

        // Pulsing glow — only for available (unlocked) locations
        if (loc.state !== 'locked') {
          const phase = (loc.position.x * 3.1 + loc.position.y * 2.3) * 1000;
          const pulse = (Math.sin((Date.now() + phase) / 900) + 1) / 2;
          ctx.save();
          ctx.globalAlpha = 0.06 + pulse * 0.09;
          ctx.fillStyle = loc.color || '#FFD700';
          ctx.beginPath();
          ctx.arc(x, y - w * .04, w * .13, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (loc.state === 'locked') ctx.save();

        if (loc.drawFn) {
          if (loc.state === 'locked') { ctx.globalAlpha = 0.45; ctx.filter = 'grayscale(100%)'; }
          loc.drawFn(ctx, x, y, loc.scale, w, h);
        } else {
          const asset = assets.get(loc.asset);
          if (!asset) return;
          const lw = asset.width * loc.scale, lh = asset.height * loc.scale;
          if (loc.state === 'locked') { ctx.globalAlpha = 0.45; ctx.filter = 'grayscale(100%)'; }
          ctx.drawImage(asset.img, x - lw * asset.anchor.x, y - lh * asset.anchor.y, lw, lh);
        }

        if (loc.state === 'locked') ctx.restore();

        // Star progress dots (3 dots below building: gold = earned, grey = not yet)
        if (loc.stars !== undefined) {
          const r  = w * .016;
          const sy = y + w * .074;
          const gap = r * 2.8;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x + (i - 1) * gap, sy, r, 0, Math.PI * 2);
            ctx.fillStyle = i < loc.stars ? '#FFD700' : 'rgba(160,160,160,0.45)';
            ctx.fill();
          }
        }

        // Number badge
        if (loc.badgeNum != null && loc.color) {
          const bs = w * .095, br = bs * .24;
          const bx = loc.position.x * w - bs * .80, by = loc.position.y * h - bs * .20;
          ctx.fillStyle = loc.color;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${Math.round(br * 1.1)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(loc.badgeNum), bx, by);
        }

        // New-content badge (NEW / +N)
        if (loc.contentBadge) {
          const pulse = (Math.sin(Date.now() / 550) + 1) / 2;
          const br = w * .048;
          const bx = x + w * .065, by = y - w * .095;
          ctx.save();
          ctx.globalAlpha = 0.9 + pulse * 0.1;
          ctx.fillStyle = loc.contentBadge === 'new' ? '#FF4757' : '#FF6B35';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 6 + pulse * 8;
          ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${Math.round(br * 1.05)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(loc.contentBadge, bx, by);
          ctx.restore();
        }
      },
    };
  }

  _banner(loc, w, h) {
    return {
      zIndex: loc.zIndex + 1,
      draw(ctx) {
        if (loc.banner && loc.banner.drawFn) {
          loc.banner.drawFn(ctx, loc.position.x * w, loc.position.y * h, w, h);
        }
      },
    };
  }
}

module.exports = { LayerRenderer };
