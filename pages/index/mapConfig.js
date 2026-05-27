// Data-driven map config for Story Quest / 故事大冒险.
// Adding a new location = one new entry in `locations` + its drawFn (or asset id).
// No engine code needs to change.

const TWO_PI = Math.PI * 2;

// ── Reusable draw primitives (shared across draw functions) ───────────────

function blob(ctx, cx, cy, rx, ry, c0, c1 = 'rgba(0,0,0,0)') {
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 1, 0, TWO_PI); ctx.fill();
  ctx.restore();
}

function bigPine(ctx, x, y, s) {
  ctx.fillStyle = '#4A3010'; ctx.fillRect(x - s * .10, y, s * .20, s * .55);
  const tiers = [{ w: .96, yt: .06 }, { w: .72, yt: -.28 }, { w: .50, yt: -.56 }, { w: .30, yt: -.80 }];
  const cols = ['#224818', '#2C5C20', '#386828', '#488034'];
  tiers.forEach(({ w, yt }, tier) => {
    ctx.fillStyle = cols[tier];
    const top = y + yt * s - s * .20, bot = y + (yt + .30) * s;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x - w * s * .5, bot); ctx.lineTo(x + w * s * .5, bot); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.07)';
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w * s * .15, top + s * .08); ctx.lineTo(x + w * s * .5, bot); ctx.closePath(); ctx.fill();
  });
}

function roundTree(ctx, x, y, s) {
  ctx.fillStyle = '#4A3010'; ctx.fillRect(x - s * .08, y, s * .16, s * .42);
  const g = ctx.createRadialGradient(x - s * .14, y - s * .72, 0, x, y - s * .66, s * .54);
  g.addColorStop(0, '#8CCE3C'); g.addColorStop(.55, '#66A828'); g.addColorStop(1, '#487A1C');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y - s * .66, s * .54, 0, TWO_PI); ctx.fill();
  ctx.strokeStyle = '#386018'; ctx.lineWidth = .6; ctx.stroke();
  const g2 = ctx.createRadialGradient(x + s * .20, y - s * .58, 0, x + s * .26, y - s * .54, s * .30);
  g2.addColorStop(0, '#7ABE30'); g2.addColorStop(1, 'rgba(60,100,20,0)');
  ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x + s * .26, y - s * .54, s * .30, 0, TWO_PI); ctx.fill();
}

function drawRibbon(ctx, x, y, text, color, w) {
  const fs = Math.round(w * .030);
  ctx.font = `italic bold ${fs}px serif`;
  const tw = ctx.measureText(text).width;
  const rw = tw + w * .072, rh = w * .042;
  ctx.fillStyle = color; ctx.globalAlpha = .88;
  ctx.beginPath();
  ctx.moveTo(x - rw / 2, y - rh / 2); ctx.lineTo(x - rw / 2 - rh * .52, y); ctx.lineTo(x - rw / 2, y + rh / 2);
  ctx.lineTo(x + rw / 2, y + rh / 2); ctx.lineTo(x + rw / 2 + rh * .52, y); ctx.lineTo(x + rw / 2, y - rh / 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.moveTo(x - rw / 2, y - rh / 2); ctx.lineTo(x - rw / 2 - rh * .52, y); ctx.lineTo(x - rw / 2, y); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + rw / 2, y - rh / 2); ctx.lineTo(x + rw / 2 + rh * .52, y); ctx.lineTo(x + rw / 2, y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(x - rw / 2, y - rh / 2); ctx.lineTo(x + rw / 2, y - rh / 2); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffffff'; ctx.font = `italic bold ${fs}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y);
}

// ── Location draw functions ───────────────────────────────────────────────

function drawCottage(ctx, x, y, s) {
  ctx.fillStyle = '#F0E0A0'; ctx.fillRect(x - s * .72, y - s * .44, s * 1.44, s * .95);
  ctx.fillStyle = '#D8C880';
  ctx.beginPath(); ctx.moveTo(x + s * .72, y - s * .44); ctx.lineTo(x + s * .96, y - s * .36); ctx.lineTo(x + s * .96, y + s * .52); ctx.lineTo(x + s * .72, y + s * .52); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C04828';
  ctx.beginPath(); ctx.moveTo(x - s * .84, y - s * .44); ctx.lineTo(x, y - s * 1.18); ctx.lineTo(x + s * .84, y - s * .44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#A03420';
  ctx.beginPath(); ctx.moveTo(x + s * .84, y - s * .44); ctx.lineTo(x + s * .96, y - s * .36); ctx.lineTo(x + s * .18, y - s * 1.12); ctx.lineTo(x, y - s * 1.18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C09060'; ctx.fillRect(x + s * .30, y - s * .82, s * .22, s * .50);
  ctx.fillStyle = '#A07040'; ctx.fillRect(x + s * .30, y - s * .88, s * .28, s * .10);
  ctx.strokeStyle = 'rgba(200,200,200,.45)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + s * .41, y - s * .88); ctx.quadraticCurveTo(x + s * .60, y - s * 1.10, x + s * .48, y - s * 1.32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .41, y - s * .88); ctx.quadraticCurveTo(x + s * .24, y - s * 1.12, x + s * .36, y - s * 1.28); ctx.stroke();
  ctx.fillStyle = '#7A3820'; ctx.fillRect(x - s * .16, y + s * .06, s * .32, s * .46);
  ctx.beginPath(); ctx.arc(x, y + s * .06, s * .16, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#A8D8FF';
  ctx.fillRect(x - s * .58, y - s * .22, s * .30, s * .28); ctx.fillRect(x + s * .28, y - s * .22, s * .30, s * .28);
  ctx.strokeStyle = '#7A5010'; ctx.lineWidth = 1;
  ctx.strokeRect(x - s * .58, y - s * .22, s * .30, s * .28); ctx.strokeRect(x + s * .28, y - s * .22, s * .30, s * .28);
  ctx.beginPath(); ctx.moveTo(x - s * .43, y - s * .22); ctx.lineTo(x - s * .43, y + s * .06); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .58, y - s * .08); ctx.lineTo(x - s * .28, y - s * .08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .43, y - s * .22); ctx.lineTo(x + s * .43, y + s * .06); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .28, y - s * .08); ctx.lineTo(x + s * .58, y - s * .08); ctx.stroke();
}

function drawTower(ctx, x, y, s) {
  blob(ctx, x, y + s * .30, s * .90, s * .38, 'rgba(40,80,20,.35)');
  ctx.fillStyle = '#8090A0'; ctx.fillRect(x - s * .42, y - s * 1.50, s * .84, s * 1.95);
  ctx.fillStyle = '#607080'; ctx.fillRect(x + s * .42, y - s * 1.48, s * .20, s * 1.90);
  ctx.fillStyle = '#708090';
  for (let k = -1; k <= 1; k++) ctx.fillRect(x + k * s * .28 - s * .13, y - s * 1.62, s * .24, s * .24);
  ctx.fillStyle = '#98A8B8'; ctx.fillRect(x - s * .43, y - s * 1.64, s * .84, s * .06);
  ctx.strokeStyle = '#5A3010'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(x, y - s * 1.62); ctx.lineTo(x, y - s * 2.00); ctx.stroke();
  ctx.fillStyle = '#C02820';
  ctx.beginPath(); ctx.moveTo(x, y - s * 2.00); ctx.lineTo(x + s * .40, y - s * 1.84); ctx.lineTo(x, y - s * 1.68); ctx.closePath(); ctx.fill();
}

function drawCastle(ctx, x, y, s) {
  ctx.fillStyle = '#80A848';
  ctx.beginPath(); ctx.moveTo(x - s * 1.50, y + s * .80); ctx.quadraticCurveTo(x - s * .60, y - s * .30, x, y - s * .28); ctx.quadraticCurveTo(x + s * .60, y - s * .30, x + s * 1.50, y + s * .80); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#C0B0D4'; ctx.fillRect(x - s * 1.08, y - s * 1.10, s * .46, s * 1.70);
  ctx.fillStyle = '#C8B8DC'; ctx.fillRect(x - s * .64, y - s * 1.36, s * 1.28, s * 1.85);
  ctx.fillStyle = '#C8B8D8'; ctx.fillRect(x + s * .64, y - s * 1.34, s * .22, s * 1.80);
  ctx.fillStyle = '#C8B8DC'; ctx.fillRect(x + s * .62, y - s * 1.08, s * .46, s * 1.65);
  ctx.fillStyle = '#A898C0';
  [x - s * 1.10, x - s * .94, x - s * .78].forEach(bx => { ctx.fillRect(bx, y - s * 1.22, s * .14, s * .22); });
  [x + s * .64, x + s * .80, x + s * .96].forEach(bx => { ctx.fillRect(bx, y - s * 1.20, s * .14, s * .22); });
  for (let k = -2; k <= 2; k++) ctx.fillRect(x + k * s * .26 - s * .10, y - s * 1.48, s * .18, s * .24);
  ctx.fillStyle = '#5828A0';
  [[x - s * .85, y - s * 1.22], [x + s * .85, y - s * 1.20]].forEach(([tx, ty]) => {
    ctx.beginPath(); ctx.moveTo(tx, ty - s * .72); ctx.lineTo(tx - s * .28, ty); ctx.lineTo(tx + s * .28, ty); ctx.closePath(); ctx.fill();
  });
  ctx.fillStyle = '#5080C0'; ctx.fillRect(x - s * .20, y - s * 1.00, s * .40, s * .50);
  ctx.beginPath(); ctx.arc(x, y - s * 1.00, s * .20, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#3A2818'; ctx.fillRect(x - s * .26, y + s * .22, s * .52, s * .40);
  ctx.beginPath(); ctx.arc(x, y + s * .22, s * .26, Math.PI, 0); ctx.fill();
}

function drawSchool(ctx, x, y, s) {
  ctx.fillStyle = '#F0E898'; ctx.fillRect(x - s * .86, y - s * 1.05, s * 1.72, s * 1.60);
  ctx.fillStyle = '#C03820';
  ctx.beginPath(); ctx.moveTo(x - s * .95, y - s * 1.05); ctx.lineTo(x, y - s * 1.82); ctx.lineTo(x + s * .95, y - s * 1.05); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#88CCFF';
  [[x - s * .54, y - s * .68], [x, y - s * .68], [x + s * .54, y - s * .68]].forEach(([wx, wy]) => {
    ctx.fillRect(wx - s * .17, wy - s * .17, s * .34, s * .34);
    ctx.strokeStyle = '#8A7818'; ctx.lineWidth = 1.0; ctx.strokeRect(wx - s * .17, wy - s * .17, s * .34, s * .34);
    ctx.beginPath(); ctx.moveTo(wx, wy - s * .17); ctx.lineTo(wx, wy + s * .17); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(wx - s * .17, wy); ctx.lineTo(wx + s * .17, wy); ctx.stroke();
  });
  ctx.fillStyle = '#7A3010'; ctx.fillRect(x - s * .19, y + s * .08, s * .38, s * .48);
  ctx.beginPath(); ctx.arc(x, y + s * .08, s * .19, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.font = `bold ${Math.round(s * .18)}px sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SCHOOL', x, y - s * 1.22);
}

function drawTreehouse(ctx, x, y, s) {
  // Roots
  ctx.fillStyle = '#4A2E10';
  [[-1, -.22], [1, -.20]].forEach(([dir, mid]) => {
    ctx.beginPath();
    ctx.moveTo(x + dir * s * .30, y + s * .50);
    ctx.lineTo(x + dir * s * .16, y + s * mid);
    ctx.lineTo(x + dir * s * .08, y + s * .50);
    ctx.closePath(); ctx.fill();
  });
  // Trunk
  ctx.fillStyle = '#6B3D1A';
  ctx.beginPath();
  ctx.moveTo(x - s * .16, y + s * .50);
  ctx.lineTo(x - s * .12, y - s * .28);
  ctx.lineTo(x + s * .12, y - s * .28);
  ctx.lineTo(x + s * .16, y + s * .50);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4A2A0C';
  ctx.beginPath();
  ctx.moveTo(x + s * .12, y - s * .28);
  ctx.lineTo(x + s * .16, y + s * .50);
  ctx.lineTo(x + s * .06, y + s * .50);
  ctx.lineTo(x + s * .04, y - s * .28);
  ctx.closePath(); ctx.fill();
  // Canopy — overlapping blobs, dark forest greens
  const canopy = [
    [0, -.28, .70, '#1E5C16'], [-.38, -.42, .54, '#226820'], [.40, -.40, .52, '#1A6018'],
    [-.18, -.80, .48, '#2A7424'], [.16, -.82, .46, '#246A20'], [0, -1.02, .36, '#307828'],
  ];
  for (const [dx, dy, r, col] of canopy) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TWO_PI); ctx.fill();
  }
  // Highlight on top canopy
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.beginPath(); ctx.arc(x - s * .08, y - s * 1.06, s * .20, 0, TWO_PI); ctx.fill();
  // Platform
  ctx.fillStyle = '#8B5E2A';
  ctx.fillRect(x - s * .52, y - s * .30, s * 1.04, s * .09);
  ctx.fillStyle = '#5C3A14';
  ctx.fillRect(x - s * .52, y - s * .30, s * 1.04, s * .025);
  // Planks
  ctx.strokeStyle = '#6A4418'; ctx.lineWidth = 0.6;
  for (let px = x - s * .38; px < x + s * .40; px += s * .18) {
    ctx.beginPath(); ctx.moveTo(px, y - s * .30); ctx.lineTo(px, y - s * .21); ctx.stroke();
  }
  // House body
  ctx.fillStyle = '#D4A86A';
  ctx.fillRect(x - s * .32, y - s * .70, s * .64, s * .40);
  ctx.fillStyle = '#A87840';
  ctx.fillRect(x + s * .32, y - s * .70, s * .10, s * .40);
  // Roof
  ctx.fillStyle = '#962018';
  ctx.beginPath();
  ctx.moveTo(x - s * .40, y - s * .70);
  ctx.lineTo(x, y - s * 1.06);
  ctx.lineTo(x + s * .40, y - s * .70);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#6E1410';
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.06);
  ctx.lineTo(x + s * .14, y - s * .92);
  ctx.lineTo(x + s * .40, y - s * .70);
  ctx.closePath(); ctx.fill();
  // Chimney
  ctx.fillStyle = '#8C5030';
  ctx.fillRect(x + s * .14, y - s * 1.02, s * .12, s * .36);
  ctx.fillStyle = '#6A3818';
  ctx.fillRect(x + s * .12, y - s * 1.04, s * .16, s * .06);
  // Smoke
  ctx.strokeStyle = 'rgba(210,210,210,.55)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + s * .20, y - s * 1.04); ctx.quadraticCurveTo(x + s * .26, y - s * 1.16, x + s * .18, y - s * 1.26); ctx.stroke();
  // Door
  ctx.fillStyle = '#5C2A0A';
  ctx.fillRect(x - s * .10, y - s * .44, s * .20, s * .28);
  ctx.beginPath(); ctx.arc(x, y - s * .44, s * .10, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#C8A030';
  ctx.beginPath(); ctx.arc(x + s * .07, y - s * .32, s * .025, 0, TWO_PI); ctx.fill();
  // Window
  ctx.fillStyle = '#A8DAFF';
  ctx.fillRect(x - s * .30, y - s * .62, s * .16, s * .14);
  ctx.strokeStyle = '#7A4C18'; ctx.lineWidth = 1;
  ctx.strokeRect(x - s * .30, y - s * .62, s * .16, s * .14);
  ctx.beginPath(); ctx.moveTo(x - s * .22, y - s * .62); ctx.lineTo(x - s * .22, y - s * .48); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .30, y - s * .55); ctx.lineTo(x - s * .14, y - s * .55); ctx.stroke();
  // Rope ladder
  ctx.strokeStyle = '#9B7040'; ctx.lineWidth = 1.2;
  const lx1 = x - s * .10, lx2 = x + s * .10;
  ctx.beginPath(); ctx.moveTo(lx1, y - s * .21); ctx.lineTo(lx1, y + s * .08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(lx2, y - s * .21); ctx.lineTo(lx2, y + s * .08); ctx.stroke();
  for (let ry = y - s * .14; ry < y + s * .08; ry += s * .10) {
    ctx.beginPath(); ctx.moveTo(lx1, ry); ctx.lineTo(lx2, ry); ctx.stroke();
  }
}

function drawMushroomHouse(ctx, x, y, s) {
  // Flowers around base
  const flowerPos = [[-s * .52, s * .38], [-s * .36, s * .46], [s * .40, s * .40], [s * .54, s * .32]];
  for (const [fx, fy] of flowerPos) {
    for (let a = 0; a < TWO_PI; a += TWO_PI / 5) {
      ctx.fillStyle = '#FF9090';
      ctx.beginPath(); ctx.arc(x + fx + Math.cos(a) * s * .07, y + fy + Math.sin(a) * s * .07, s * .05, 0, TWO_PI); ctx.fill();
    }
    ctx.fillStyle = '#FFE040';
    ctx.beginPath(); ctx.arc(x + fx, y + fy, s * .05, 0, TWO_PI); ctx.fill();
  }
  // Stem
  ctx.fillStyle = '#F4EDD4';
  ctx.beginPath();
  ctx.moveTo(x - s * .30, y + s * .50);
  ctx.quadraticCurveTo(x - s * .34, y + s * .15, x - s * .20, y - s * .08);
  ctx.lineTo(x + s * .20, y - s * .08);
  ctx.quadraticCurveTo(x + s * .34, y + s * .15, x + s * .30, y + s * .50);
  ctx.closePath(); ctx.fill();
  // Stem shadow side
  ctx.fillStyle = '#D8CFA8';
  ctx.beginPath();
  ctx.moveTo(x + s * .20, y - s * .08);
  ctx.quadraticCurveTo(x + s * .34, y + s * .15, x + s * .30, y + s * .50);
  ctx.lineTo(x + s * .14, y + s * .50);
  ctx.quadraticCurveTo(x + s * .20, y + s * .15, x + s * .08, y - s * .08);
  ctx.closePath(); ctx.fill();
  // Door arch
  ctx.fillStyle = '#7A3820';
  ctx.fillRect(x - s * .11, y + s * .10, s * .22, s * .32);
  ctx.beginPath(); ctx.arc(x, y + s * .10, s * .11, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#5A2410'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y + s * .10, s * .11, Math.PI, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .11, y + s * .10); ctx.lineTo(x - s * .11, y + s * .42); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .11, y + s * .10); ctx.lineTo(x + s * .11, y + s * .42); ctx.stroke();
  ctx.fillStyle = '#C89028';
  ctx.beginPath(); ctx.arc(x + s * .07, y + s * .26, s * .025, 0, TWO_PI); ctx.fill();
  // Circular window
  ctx.fillStyle = '#B8E4FF';
  ctx.beginPath(); ctx.arc(x - s * .16, y - s * .01, s * .08, 0, TWO_PI); ctx.fill();
  ctx.strokeStyle = '#7A5020'; ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .16, y - s * .09); ctx.lineTo(x - s * .16, y + s * .07); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .24, y - s * .01); ctx.lineTo(x - s * .08, y - s * .01); ctx.stroke();
  // Gill skirt at cap base
  ctx.fillStyle = '#E8C89A';
  ctx.beginPath();
  ctx.moveTo(x - s * .64, y - s * .10);
  ctx.quadraticCurveTo(x, y - s * .02, x + s * .64, y - s * .10);
  ctx.lineTo(x + s * .54, y - s * .06);
  ctx.quadraticCurveTo(x, y + s * .04, x - s * .54, y - s * .06);
  ctx.closePath(); ctx.fill();
  // Cap
  const capG = ctx.createRadialGradient(x - s * .18, y - s * .64, 0, x, y - s * .32, s * .85);
  capG.addColorStop(0, '#FF5840'); capG.addColorStop(.55, '#D42418'); capG.addColorStop(1, '#9E1210');
  ctx.fillStyle = capG;
  ctx.beginPath();
  ctx.moveTo(x - s * .64, y - s * .10);
  ctx.quadraticCurveTo(x - s * .80, y - s * .60, x, y - s * 1.28);
  ctx.quadraticCurveTo(x + s * .80, y - s * .60, x + s * .64, y - s * .10);
  ctx.closePath(); ctx.fill();
  // Cap dark edge
  ctx.fillStyle = 'rgba(0,0,0,.12)';
  ctx.beginPath();
  ctx.moveTo(x + s * .12, y - s * .10);
  ctx.quadraticCurveTo(x + s * .80, y - s * .60, x + s * .64, y - s * .10);
  ctx.closePath(); ctx.fill();
  // White spots
  const spots = [[-s * .26, -s * .76, s * .09], [s * .22, -s * .80, s * .08], [-s * .48, -s * .44, s * .07], [s * .40, -s * .46, s * .08], [s * .06, -s * .54, s * .06]];
  for (const [sx, sy, sr] of spots) {
    ctx.fillStyle = 'rgba(255,255,255,.82)';
    ctx.beginPath(); ctx.arc(x + sx, y + sy, sr, 0, TWO_PI); ctx.fill();
  }
  // Tiny caterpillar crawling on stem
  const segs = [[s * .22, s * .18], [s * .26, s * .14], [s * .30, s * .11], [s * .34, s * .09]];
  const segCols = ['#4CAF50', '#66BB6A', '#4CAF50', '#66BB6A'];
  segs.forEach(([sx, sy], i) => {
    ctx.fillStyle = segCols[i];
    ctx.beginPath(); ctx.arc(x + sx, y + sy, s * .04, 0, TWO_PI); ctx.fill();
  });
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath(); ctx.arc(x + segs[3][0] + s * .01, y + segs[3][1] - s * .02, s * .012, 0, TWO_PI); ctx.fill();
  ctx.strokeStyle = '#388E3C'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(x + segs[3][0], y + segs[3][1] - s * .04); ctx.lineTo(x + segs[3][0] + s * .03, y + segs[3][1] - s * .08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + segs[3][0] + s * .02, y + segs[3][1] - s * .04); ctx.lineTo(x + segs[3][0] - s * .01, y + segs[3][1] - s * .08); ctx.stroke();
}

function drawBarn(ctx, x, y, s) {
  // Shadow
  blob(ctx, x, y + s * .52, s * 1.40, s * .36, 'rgba(0,0,0,.14)');
  // Silo (right side)
  ctx.fillStyle = '#D4C8A0';
  ctx.fillRect(x + s * .72, y - s * .90, s * .32, s * 1.40);
  ctx.fillStyle = '#B8AA80';
  ctx.fillRect(x + s * .88, y - s * .90, s * .10, s * 1.40);
  // Silo dome
  ctx.fillStyle = '#8090A0';
  ctx.beginPath(); ctx.arc(x + s * .88, y - s * .90, s * .18, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#607080';
  ctx.beginPath(); ctx.arc(x + s * .96, y - s * .90, s * .08, Math.PI, 0); ctx.fill();
  // Barn body
  ctx.fillStyle = '#C03020';
  ctx.fillRect(x - s * .78, y - s * .70, s * 1.56, s * 1.20);
  // Side shadow
  ctx.fillStyle = '#9A2018';
  ctx.fillRect(x + s * .62, y - s * .70, s * .16, s * 1.20);
  // Horizontal board lines
  ctx.strokeStyle = 'rgba(0,0,0,.12)'; ctx.lineWidth = .7;
  for (let by = y - s * .50; by < y + s * .50; by += s * .20) {
    ctx.beginPath(); ctx.moveTo(x - s * .78, by); ctx.lineTo(x + s * .62, by); ctx.stroke();
  }
  // Roof
  ctx.fillStyle = '#2A2010';
  ctx.beginPath();
  ctx.moveTo(x - s * .90, y - s * .70);
  ctx.lineTo(x, y - s * 1.50);
  ctx.lineTo(x + s * .74, y - s * .70);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#181408';
  ctx.beginPath();
  ctx.moveTo(x, y - s * 1.50);
  ctx.lineTo(x + s * .20, y - s * 1.20);
  ctx.lineTo(x + s * .74, y - s * .70);
  ctx.closePath(); ctx.fill();
  // Hayloft door (upper center)
  ctx.fillStyle = '#1A1208';
  ctx.fillRect(x - s * .18, y - s * .72, s * .36, s * .30);
  ctx.beginPath(); ctx.arc(x, y - s * .72, s * .18, Math.PI, 0); ctx.fill();
  // Loft hay
  ctx.fillStyle = '#D4A020';
  ctx.fillRect(x - s * .14, y - s * .52, s * .28, s * .12);
  // Main door (double)
  ctx.fillStyle = '#2A1808';
  ctx.fillRect(x - s * .32, y - s * .20, s * .28, s * .70);
  ctx.fillRect(x + s * .04, y - s * .20, s * .28, s * .70);
  ctx.strokeStyle = '#4A2E10'; ctx.lineWidth = 1;
  ctx.strokeRect(x - s * .32, y - s * .20, s * .28, s * .70);
  ctx.strokeRect(x + s * .04, y - s * .20, s * .28, s * .70);
  // Door X-brace
  ctx.beginPath(); ctx.moveTo(x - s * .32, y - s * .20); ctx.lineTo(x - s * .04, y + s * .50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - s * .04, y - s * .20); ctx.lineTo(x - s * .32, y + s * .50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .04, y - s * .20); ctx.lineTo(x + s * .32, y + s * .50); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + s * .32, y - s * .20); ctx.lineTo(x + s * .04, y + s * .50); ctx.stroke();
  // Windows (small, barn-style)
  [[x - s * .60, y - s * .42], [x + s * .44, y - s * .42]].forEach(([wx, wy]) => {
    ctx.fillStyle = '#C8C080';
    ctx.fillRect(wx - s * .10, wy - s * .08, s * .20, s * .16);
    ctx.strokeStyle = '#8B5E20'; ctx.lineWidth = .8; ctx.strokeRect(wx - s * .10, wy - s * .08, s * .20, s * .16);
    ctx.beginPath(); ctx.moveTo(wx, wy - s * .08); ctx.lineTo(wx, wy + s * .08); ctx.stroke();
  });
  // Spiderweb in upper-left corner
  const wx = x - s * .62, wy = y - s * 1.08, wr = s * .22;
  ctx.strokeStyle = 'rgba(255,255,255,.70)'; ctx.lineWidth = .7;
  // Radial spokes
  for (let a = 0; a < TWO_PI; a += TWO_PI / 6) {
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + Math.cos(a) * wr, wy + Math.sin(a) * wr); ctx.stroke();
  }
  // Concentric rings
  for (let r = wr * .30; r <= wr; r += wr * .28) {
    ctx.beginPath();
    for (let a = 0; a <= TWO_PI; a += TWO_PI / 6) {
      const px = wx + Math.cos(a) * r, py = wy + Math.sin(a) * r;
      a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
  }
  // Spider
  ctx.fillStyle = '#1A1A1A';
  ctx.beginPath(); ctx.arc(wx + wr * .55, wy + wr * .55, s * .04, 0, TWO_PI); ctx.fill();
  // Spider legs
  ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = .6;
  [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].forEach(([lx, ly]) => {
    ctx.beginPath();
    ctx.moveTo(wx + wr * .55, wy + wr * .55);
    ctx.lineTo(wx + wr * .55 + lx * s * .06, wy + wr * .55 + ly * s * .06);
    ctx.stroke();
  });
  // Pig snout peeking from doorway
  ctx.fillStyle = '#F4A0A0';
  ctx.beginPath(); ctx.arc(x, y + s * .38, s * .10, 0, TWO_PI); ctx.fill();
  ctx.fillStyle = '#D06060';
  ctx.beginPath(); ctx.arc(x - s * .04, y + s * .38, s * .03, 0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * .04, y + s * .38, s * .03, 0, TWO_PI); ctx.fill();
  ctx.fillStyle = '#3A1A1A';
  ctx.beginPath(); ctx.arc(x - s * .06, y + s * .33, s * .018, 0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * .06, y + s * .33, s * .018, 0, TWO_PI); ctx.fill();
}

function drawCatHatHouse(ctx, x, y, s) {
  // Shadow
  blob(ctx, x, y + s * .55, s * 1.10, s * .28, 'rgba(0,0,0,.14)');
  // House body
  ctx.fillStyle = '#F5E8D0';
  ctx.fillRect(x - s * .60, y - s * .36, s * 1.20, s * .86);
  // Side shading
  ctx.fillStyle = '#DDD0B0';
  ctx.fillRect(x + s * .60, y - s * .36, s * .14, s * .86);
  // Roof
  ctx.fillStyle = '#CC3322';
  ctx.beginPath();
  ctx.moveTo(x - s * .74, y - s * .36);
  ctx.lineTo(x, y - s * .96);
  ctx.lineTo(x + s * .74, y - s * .36);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#A82818';
  ctx.beginPath();
  ctx.moveTo(x + s * .74, y - s * .36);
  ctx.lineTo(x + s * .88, y - s * .28);
  ctx.lineTo(x + s * .16, y - s * .90);
  ctx.lineTo(x, y - s * .96);
  ctx.closePath(); ctx.fill();
  // Door
  ctx.fillStyle = '#7A4020';
  ctx.fillRect(x - s * .16, y + s * .10, s * .32, s * .40);
  ctx.beginPath(); ctx.arc(x, y + s * .10, s * .16, Math.PI, 0); ctx.fill();
  // Windows
  ctx.fillStyle = '#A8D8FF';
  ctx.fillRect(x - s * .48, y - s * .16, s * .24, s * .22);
  ctx.fillRect(x + s * .24, y - s * .16, s * .24, s * .22);
  // ── Tall striped hat sitting on roof peak ──
  const hx = x, hy = y - s * .96;
  // Brim
  ctx.fillStyle = '#EEEEEE';
  ctx.fillRect(hx - s * .34, hy - s * .07, s * .68, s * .13);
  // Hat body (white base)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - s * .22, hy - s * .88, s * .44, s * .82);
  // Red stripes
  ctx.fillStyle = '#DD2222';
  ctx.fillRect(hx - s * .22, hy - s * .88, s * .44, s * .17);
  ctx.fillRect(hx - s * .22, hy - s * .62, s * .44, s * .17);
  ctx.fillRect(hx - s * .22, hy - s * .36, s * .44, s * .17);
  // Hat top cap
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(hx - s * .20, hy - s * .95, s * .40, s * .09);
}

function drawGruffaloWood(ctx, x, y, s) {
  blob(ctx, x, y + s * .55, s * 1.10, s * .30, 'rgba(0,0,0,.28)');
  // Root flares
  ctx.fillStyle = '#1A0E04';
  [[-1, .34, -.40, .55], [1, .32, .40, .55]].forEach(([dir, yt, ex]) => {
    ctx.beginPath();
    ctx.moveTo(x + dir * s * .20, y + yt * s);
    ctx.lineTo(x + dir * s * ex, y + s * .55);
    ctx.lineTo(x + dir * s * .10, y + s * .55);
    ctx.closePath(); ctx.fill();
  });
  // Trunk
  ctx.fillStyle = '#2A1604';
  ctx.fillRect(x - s * .20, y - s * .46, s * .40, s * 1.02);
  ctx.fillStyle = '#180E02';
  ctx.fillRect(x + s * .10, y - s * .46, s * .10, s * 1.02);
  // Hollow
  ctx.fillStyle = '#050202';
  ctx.fillRect(x - s * .12, y - s * .08, s * .24, s * .40);
  ctx.beginPath(); ctx.arc(x, y - s * .08, s * .12, Math.PI, 0); ctx.fill();
  // Glowing orange eyes
  ctx.save();
  ctx.shadowColor = '#FF5500'; ctx.shadowBlur = s * .16;
  ctx.fillStyle = '#FF8800';
  ctx.beginPath(); ctx.arc(x - s * .06, y + s * .07, s * .036, 0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(x + s * .06, y + s * .07, s * .036, 0, TWO_PI); ctx.fill();
  ctx.restore();
  // Dark canopy blobs
  const canopy = [
    [0,    -.50, .64, '#183208'], [-.36, -.64, .52, '#1E3E0A'],
    [.38,  -.62, .50, '#1A3808'], [-.14, -.90, .46, '#224408'],
    [.16,  -.88, .44, '#1C3E06'], [0,  -1.08,  .36, '#284C10'],
  ];
  for (const [dx, dy, r, col] of canopy) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, r * s, 0, TWO_PI); ctx.fill();
  }
}

function drawCloud(ctx, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(255,255,255,0.4)';
  ctx.shadowBlur = r * 0.8;
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.beginPath(); ctx.arc(cx,          cy,          r,        0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - r*.65,  cy + r*.15,  r * .68,  0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r*.65,  cy + r*.15,  r * .65,  0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - r*.30,  cy - r*.28,  r * .58,  0, TWO_PI); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + r*.32,  cy - r*.26,  r * .55,  0, TWO_PI); ctx.fill();
  ctx.restore();
}

// ── Map config ────────────────────────────────────────────────────────────

function buildConfig(lang) {
  const label = (en, zh) => lang === 'en' ? en : zh;

  return {
    map: {
      id: 'story_quest',
      drawFn(ctx, w, h) {
        // Land base
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, '#C4D890'); g.addColorStop(0.35, '#AACC6C');
        g.addColorStop(0.70, '#8CB850'); g.addColorStop(1, '#7AAA42');
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
        blob(ctx, w * .12, h * .15, w * .22, h * .14, 'rgba(120,160,40,.22)');
        blob(ctx, w * .65, h * .18, w * .28, h * .16, 'rgba(100,145,35,.18)');
        blob(ctx, w * .38, h * .52, w * .32, h * .20, 'rgba(90,130,30,.16)');
        blob(ctx, w * .72, h * .65, w * .26, h * .18, 'rgba(110,150,40,.20)');
        blob(ctx, w * .08, h * .72, w * .18, h * .14, 'rgba(75,115,25,.18)');
        blob(ctx, w * .88, h * .42, w * .16, h * .22, 'rgba(100,140,38,.16)');
        // Water
        const pts = [[0, h * .66], [w * .06, h * .62], [w * .14, h * .64], [w * .22, h * .70], [w * .26, h * .80], [w * .22, h * .91], [w * .12, h * .97], [0, h * .98]];
        const n = pts.length;
        ctx.beginPath(); ctx.moveTo((pts[0][0] + pts[n - 1][0]) / 2, (pts[0][1] + pts[n - 1][1]) / 2);
        for (let i = 0; i < n; i++) { const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % n]; ctx.quadraticCurveTo(x1, y1, (x1 + x2) / 2, (y1 + y2) / 2); }
        ctx.closePath();
        const wg = ctx.createLinearGradient(0, h * .62, w * .26, h);
        wg.addColorStop(0, '#80C4D4'); wg.addColorStop(.5, '#58AABF'); wg.addColorStop(1, '#409AAF');
        ctx.fillStyle = wg; ctx.fill();
        ctx.strokeStyle = '#2E8090'; ctx.lineWidth = 1.8; ctx.stroke();
        // Mountains
        const peaks = [[w * .54, h * .68, w * .092, 1.5], [w * .46, h * .70, w * .082, 1.4], [w * .62, h * .70, w * .078, 1.3], [w * .40, h * .72, w * .068, 1.1], [w * .50, h * .72, w * .070, 1.2], [w * .58, h * .72, w * .065, 1.1]];
        for (const [px, py, s, sf] of peaks) {
          const ht = s * sf * 2.0;
          ctx.fillStyle = '#8898A8'; ctx.beginPath(); ctx.moveTo(px, py - ht); ctx.lineTo(px - s * 1.15, py + s * .28); ctx.lineTo(px + s * .85, py + s * .28); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#60788A'; ctx.beginPath(); ctx.moveTo(px, py - ht); ctx.lineTo(px - s * .18, py - ht * .55); ctx.lineTo(px - s * 1.15, py + s * .28); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#EEF4F8'; ctx.beginPath(); ctx.moveTo(px, py - ht); ctx.lineTo(px - s * .38, py - ht * .62); ctx.lineTo(px + s * .32, py - ht * .60); ctx.closePath(); ctx.fill();
        }
        // Border
        ctx.strokeStyle = '#7A5A28'; ctx.lineWidth = 5; ctx.strokeRect(3, 3, w - 6, h - 6);
        ctx.strokeStyle = '#C0A040'; ctx.lineWidth = 1.8; ctx.strokeRect(9, 9, w - 18, h - 18);
        [[12, 12], [w - 12, 12], [12, h - 12], [w - 12, h - 12]].forEach(([cx, cy]) => {
          ctx.fillStyle = '#8B6A30'; ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, TWO_PI); ctx.fill();
        });
      },
    },

    assets: {
      // Future image assets go here, e.g.:
      // dragon_fire: { type: 'spritesheet', src: '/assets/sprites/dragon_fire.png', frameWidth: 120, frameHeight: 120, frameCount: 8, fps: 12 }
    },

    decorations: [
      // Pine forest (top-left) — drawFn receives (ctx, x, y, scale, w, h)
      ...[
        [.03, .08], [.09, .07], [.15, .06], [.21, .07], [.27, .07],
        [.01, .15], [.07, .14], [.13, .13], [.19, .13], [.25, .14], [.31, .14],
        [.04, .21], [.10, .20], [.16, .19], [.22, .20], [.28, .21],
        [.02, .27], [.08, .26], [.14, .25], [.20, .26],
        [.05, .33], [.11, .32],
      ].map(([fx, fy], i) => ({
        id: `pine_${i}`,
        position: { x: fx, y: fy },
        scale: 1.0,
        zIndex: 2,
        drawFn(ctx, x, y, scale, w) { bigPine(ctx, x, y, w * .068 * scale); },
      })),
      // Scattered pines top-center (slightly smaller)
      ...[
        [.35, .08], [.40, .10], [.44, .08], [.48, .10],
      ].map(([fx, fy], i) => ({
        id: `pine_sm_${i}`,
        position: { x: fx, y: fy },
        scale: 0.75,
        zIndex: 2,
        drawFn(ctx, x, y, scale, w) { bigPine(ctx, x, y, w * .068 * scale); },
      })),
      // Round leafy trees
      ...[
        [.86, .10], [.91, .09], [.95, .12], [.88, .17], [.93, .20],
        [.30, .42], [.35, .46], [.33, .50],
        [.46, .84], [.52, .87], [.58, .85], [.64, .82], [.69, .78],
        [.28, .72], [.32, .76],
      ].map(([fx, fy], i) => ({
        id: `tree_${i}`,
        position: { x: fx, y: fy },
        scale: 1.0,
        zIndex: 3,
        drawFn(ctx, x, y, scale, w) { roundTree(ctx, x, y, w * .042 * scale); },
      })),
      // Drifting clouds — drawFn ignores x, computes position from Date.now()
      ...[
        { id: 'cloud_0', fy: .11, scale: .70, offset:     0, speed: 5.5e-6 },
        { id: 'cloud_1', fy: .20, scale: .48, offset:  8000, speed: 4.2e-6 },
        { id: 'cloud_2', fy: .05, scale: .58, offset: 15000, speed: 6.8e-6 },
      ].map(c => ({
        id: c.id,
        position: { x: .5, y: c.fy },
        scale: c.scale,
        zIndex: 4,
        drawFn(ctx, _x, y, scale, w) {
          const phase = ((Date.now() + c.offset) * c.speed) % 1.3;
          const cx = (phase - 0.15) * w;
          drawCloud(ctx, cx, y, w * .048 * scale);
        },
      })),
    ],

    paths: {
      zIndex: 5,
      style: {
        color: 'rgba(255,255,255,.88)',
        lineWidth: null,   // set dynamically in renderer from canvas width
        dashPattern: null, // set dynamically
        lineCap: 'round',
        opacity: 1,
      },
      routes: [
        {
          id: 'main',
          waypoints: [
            { x: .21, y: .72 },
            { x: .08, y: .53, cp: null }, // cp = control point for quadratic curve (set as prev segment's cp)
            { x: .20, y: .34 },
            { x: .50, y: .08, cp: null },
            { x: .78, y: .32 },
            { x: .94, y: .52, cp: null },
            { x: .80, y: .74 },
          ],
          // Uses quadratic curves via PATH_CPS — see drawFn override below
          drawFn(ctx, w, h) {
            const stops = [[.48, .86], [.21, .72], [.13, .52], [.20, .34], [.78, .32], [.58, .56], [.80, .74]];
            const cps   = [[.30, .82], [.16, .63], [.08, .42], [.50, .08], [.72, .28], [.62, .72]];
            ctx.strokeStyle = 'rgba(255,255,255,.88)';
            ctx.lineWidth = w * .011; ctx.lineCap = 'round';
            ctx.setLineDash([w * .018, w * .028]);
            for (let seg = 0; seg < 6; seg++) {
              const [x0, y0] = stops[seg], [x1, y1] = stops[seg + 1], [cx, cy] = cps[seg];
              ctx.beginPath(); ctx.moveTo(x0 * w, y0 * h); ctx.quadraticCurveTo(cx * w, cy * h, x1 * w, y1 * h); ctx.stroke();
            }
            ctx.setLineDash([]);
          },
        },
      ],
    },

    locations: [
      {
        id: 'gruffalo_wood',
        label: label("Gruffalo's Wood", '咕噜牛的树林'),
        position: { x: .48, y: .86 },
        scale: 1.0,
        zIndex: 7,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_7',
        color: '#3A6020',
        badgeNum: 1,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; drawGruffaloWood(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label("Gruffalo's Wood", '咕噜牛的树林'), '#3A6020', w); },
        },
      },
      {
        id: 'caterpillar_glen',
        label: label('Caterpillar Glen', '毛毛虫谷'),
        position: { x: .21, y: .72 },
        scale: 1.0,
        zIndex: 7,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_3',
        color: '#2E7D50',
        badgeNum: 2,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; blob(ctx, x, y + s * .55, s * 1.30, s * .40, 'rgba(0,0,0,.14)'); drawMushroomHouse(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label('Caterpillar Glen', '毛毛虫谷'), '#2E7D50', w); },
        },
      },
      {
        id: 'cat_hat_house',
        label: label('Cat Hat House', '猫帽子小屋'),
        position: { x: .13, y: .52 },
        scale: 1.0,
        zIndex: 7,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_8',
        color: '#CC3322',
        badgeNum: 3,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; drawCatHatHouse(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label('Cat Hat House', '猫帽子小屋'), '#CC3322', w); },
        },
      },
      {
        id: 'wild_wood',
        label: label('Wild Wood', '野兽森林'),
        position: { x: .20, y: .34 },
        scale: 1.0,
        zIndex: 8,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_4',
        color: '#2E5E80',
        badgeNum: 4,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; blob(ctx, x, y + s * .55, s * 1.30, s * .40, 'rgba(0,0,0,.14)'); drawTreehouse(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label('Wild Wood', '野兽森林'), '#2E5E80', w); },
        },
      },
      {
        id: 'wonder_castle',
        label: label('Wonder Castle', '奇境城堡'),
        position: { x: .78, y: .32 },
        scale: 1.0,
        zIndex: 9,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_0',
        color: '#6830A0',
        badgeNum: 5,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; blob(ctx, x, y + s * .55, s * 1.30, s * .40, 'rgba(0,0,0,.14)'); drawCastle(ctx, x, y, s); },
        animations: { idle: null, onTap: 'dragon_fire' },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label('Wonder Castle', '奇境城堡'), '#6830A0', w); },
        },
      },
      {
        id: 'charlottes_barn',
        label: label("Charlotte's Barn", '夏洛的谷仓'),
        position: { x: .58, y: .56 },
        scale: 1.0,
        zIndex: 8,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_6',
        color: '#8B4513',
        badgeNum: 6,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; drawBarn(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label("Charlotte's Barn", '夏洛的谷仓'), '#8B4513', w); },
        },
      },
      {
        id: 'story_school',
        label: label('Story School', '故事学院'),
        position: { x: .80, y: .74 },
        scale: 1.0,
        zIndex: 7,
        hitRadius: .13,
        state: 'locked',
        contentRef: 'book_5',
        color: '#8C6020',
        badgeNum: 7,
        drawFn(ctx, x, y, scale, w) { const s = w * .071 * scale; blob(ctx, x, y + s * .55, s * 1.30, s * .40, 'rgba(0,0,0,.14)'); drawSchool(ctx, x, y, s); },
        animations: { idle: null, onTap: null },
        banner: {
          drawFn(ctx, x, y, w) { drawRibbon(ctx, x, y + w * .071 * 1.05, label('Story School', '故事学院'), '#8C6020', w); },
        },
      },
    ],

    animations: {
      // Placeholder — filled in as sprite assets become available
      dragon_fire: {
        asset: 'dragon_fire',     // matches key in assets{}
        loop: false,
        offset: { x: -.05, y: -.18 },
        onComplete: 'idle',
        // drawFn can override sprite rendering for programmatic animation:
        // drawFn(ctx, position, w, h) { ... }
      },
    },
  };
}

module.exports = { buildConfig };
