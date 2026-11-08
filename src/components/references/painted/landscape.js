import { STAGE, BLOCKS } from '../wonder/config';
import { band, daub, streak, speck, glow, hash } from './brush';

const G = STAGE.ground;

function paintSky(g) {
  const sky = g.createLinearGradient(0, 0, 0, G + 40);
  sky.addColorStop(0, '#DE9159');
  sky.addColorStop(0.34, '#EFB981');
  sky.addColorStop(0.68, '#F9DCAF');
  sky.addColorStop(1, '#FDF0D9');
  g.fillStyle = sky;
  g.fillRect(0, 0, STAGE.w, STAGE.h);

  glow(g, 210, 148, 300, 'rgba(255, 240, 198, 0.85)');
  const core = g.createRadialGradient(210, 148, 6, 210, 148, 52);
  core.addColorStop(0, '#FFFCEB');
  core.addColorStop(0.7, '#FFE6A8');
  core.addColorStop(1, '#FFD287');
  g.fillStyle = core;
  g.beginPath();
  g.arc(210, 148, 52, 0, Math.PI * 2);
  g.fill();

  g.filter = 'blur(10px)';
  [
    [330, 80, 120, 22],
    [566, 54, 152, 25],
    [812, 116, 128, 24],
    [694, 196, 108, 18],
    [452, 212, 96, 15],
  ].forEach(([x, y, rx, ry]) => {
    g.globalAlpha = 0.55;
    g.fillStyle = '#FFF6E4';
    g.beginPath();
    g.ellipse(x, y, rx, ry, -0.05, 0, Math.PI * 2);
    g.fill();
    g.globalAlpha = 0.28;
    g.fillStyle = '#E9A472';
    g.beginPath();
    g.ellipse(x + rx * 0.1, y + ry * 0.8, rx * 0.78, ry * 0.42, 0, 0, Math.PI * 2);
    g.fill();
  });
  g.globalAlpha = 1;
  g.filter = 'none';
}

function paintHorizon(g) {
  g.filter = 'blur(3px)';
  band(g, { y: 350, amp: 30, freq: 0.0038, phase: 1.1, color: '#CBB884', alpha: 0.85 });
  band(g, { y: 384, amp: 22, freq: 0.0057, phase: 3.4, color: '#A9AC66', alpha: 0.95 });
  band(g, { y: 408, amp: 15, freq: 0.0086, phase: 5.3, color: '#87904A' });
  g.filter = 'none';

  for (let r = 0; r < 5; r++) {
    const yBase = 356 + r * 11;
    for (let x = 4; x < STAGE.w; x += 13) {
      const y = yBase + Math.sin(x * 0.011 + r * 1.4) * 3;
      daub(g, x + (r % 2) * 6, y, 1.5 + r * 0.35, 1.2 + r * 0.3, 0, '#FBF2DE', 0.2 + r * 0.1);
    }
  }

  const haze = g.createLinearGradient(0, 318, 0, 424);
  haze.addColorStop(0, 'rgba(253, 240, 216, 0)');
  haze.addColorStop(1, 'rgba(253, 240, 216, 0.82)');
  g.fillStyle = haze;
  g.fillRect(0, 318, STAGE.w, 106);
}

function paintStream(g) {
  const top = 418;
  const water = g.createLinearGradient(0, top, 0, G + 8);
  water.addColorStop(0, '#D8B98F');
  water.addColorStop(0.45, '#C3B79E');
  water.addColorStop(1, '#A7A992');
  g.fillStyle = water;
  g.fillRect(0, top, STAGE.w, G + 10 - top);

  const refl = g.createLinearGradient(0, top, 0, top + 16);
  refl.addColorStop(0, 'rgba(255, 242, 204, 0.6)');
  refl.addColorStop(1, 'rgba(255, 242, 204, 0)');
  g.fillStyle = refl;
  g.fillRect(0, top, STAGE.w, 16);

  for (let i = 0; i < 44; i++) {
    const x = hash(i * 2.7) * STAGE.w;
    const y = top + 6 + hash(i * 5.9) * (G - top - 2);
    streak(g, x, y, x + 10 + hash(i * 1.3) * 26, y, 'rgba(255, 246, 214, 0.55)', 1.6, 0.7);
  }
  streak(g, 0, top + 1, STAGE.w, top + 1, 'rgba(120, 82, 48, 0.3)', 2, 0.8);
}

function paintBridge(g) {
  const x0 = 470;
  const x1 = 668;
  const deck = 404;

  daub(g, (x0 + x1) / 2, deck + 26, 96, 13, 0, 'rgba(110, 68, 38, 0.16)', 1);

  [x0 + 12, (x0 + x1) / 2, x1 - 12].forEach((x) => {
    streak(g, x, deck + 10, x, G + 2, 'rgba(126, 79, 45, 0.85)', 6, 0.95);
    streak(g, x - 1, deck + 10, x - 1, G + 2, 'rgba(214, 160, 106, 0.5)', 2, 0.8);
  });

  for (let x = x0; x < x1; x += 17) {
    daub(g, x + 8.5, deck + 5, 9.3, 5.6, 0, '#B07A45', 1);
    streak(g, x + 2, deck, x + 15, deck, 'rgba(250, 214, 160, 0.5)', 1.6, 0.9);
  }

  streak(g, x0 - 4, deck - 20, x1 + 4, deck - 20, 'rgba(150, 96, 54, 0.9)', 4, 1);
  [x0, x1].forEach((x) => streak(g, x, deck - 20, x, deck, 'rgba(150, 96, 54, 0.9)', 4, 1));
  streak(g, x0 - 4, deck - 21, x1 + 4, deck - 21, 'rgba(250, 214, 160, 0.45)', 1.4, 0.9);
}

function paintGround(g) {
  const earth = g.createLinearGradient(0, G, 0, STAGE.h);
  earth.addColorStop(0, '#7B5330');
  earth.addColorStop(0.45, '#633F25');
  earth.addColorStop(1, '#4B2E1D');
  g.fillStyle = earth;
  g.fillRect(0, G - 6, STAGE.w, STAGE.h - G + 6);

  band(g, { y: G - 2, amp: 5, freq: 0.021, phase: 0.7, color: '#6B7F3B', bottom: G + 20 });
  band(g, { y: G - 7, amp: 4, freq: 0.031, phase: 2.2, color: '#87993F', bottom: G + 8 });
  band(g, { y: G + 16, amp: 6, freq: 0.012, phase: 1.9, color: 'rgba(214, 158, 96, 0.22)', bottom: STAGE.h });

  speck(g, 0, G + 14, STAGE.w, STAGE.h - G - 14, 'rgba(255, 214, 158, 0.28)', 0.5, 220, 3);
  speck(g, 0, G + 26, STAGE.w, STAGE.h - G - 26, 'rgba(38, 22, 12, 0.35)', 0.5, 180, 9);

  // tufos de grama na borda
  for (let i = 0; i < 74; i++) {
    const x = hash(i * 2.3) * STAGE.w;
    const hgt = 4 + hash(i * 4.1) * 7;
    streak(g, x, G - 2, x + (hash(i) - 0.5) * 5, G - 2 - hgt, 'rgba(112, 132, 58, 0.85)', 1.8, 0.8);
  }

  // sombra longa da borda sobre a terra
  const edge = g.createLinearGradient(0, G + 4, 0, G + 26);
  edge.addColorStop(0, 'rgba(36, 20, 10, 0.35)');
  edge.addColorStop(1, 'rgba(36, 20, 10, 0)');
  g.fillStyle = edge;
  g.fillRect(0, G + 4, STAGE.w, 22);
}

function paintCrate(g, b) {
  const { x, y, w, h } = b;

  g.save();
  g.globalAlpha = 0.2;
  g.fillStyle = '#3F2411';
  g.beginPath();
  g.moveTo(x + w - 4, y + 8);
  g.lineTo(x + w + 62, G - 2);
  g.lineTo(x + w + 4, G - 2);
  g.closePath();
  g.fill();
  g.restore();

  const wood = g.createLinearGradient(x, y, x + w, y + h);
  wood.addColorStop(0, '#C48D52');
  wood.addColorStop(0.5, '#AA7340');
  wood.addColorStop(1, '#845430');
  g.fillStyle = wood;
  g.fillRect(x + 2, y + 2, w - 4, h - 4);

  const rows = Math.max(2, Math.round(h / 26));
  for (let r = 1; r < rows; r++) {
    const py = y + 2 + ((h - 4) / rows) * r;
    streak(g, x + 5, py, x + w - 5, py, 'rgba(84, 50, 26, 0.4)', 1.6, 0.9);
    streak(g, x + 5, py + 1.6, x + w - 5, py + 1.6, 'rgba(255, 218, 164, 0.24)', 1.2, 0.8);
  }

  streak(g, x + 5, y + 5, x + 5, y + h - 5, 'rgba(255, 224, 174, 0.45)', 2.4, 0.85);
  streak(g, x + w - 5, y + 5, x + w - 5, y + h - 5, 'rgba(66, 38, 20, 0.32)', 2.6, 0.85);
  speck(g, x + 6, y + 6, w - 12, h - 12, 'rgba(60, 34, 18, 0.3)', 0.45, 60, x);

  // cantoneiras
  [
    [x + 4, y + 4],
    [x + w - 4, y + 4],
    [x + 4, y + h - 4],
    [x + w - 4, y + h - 4],
  ].forEach(([cx, cy]) => daub(g, cx, cy, 5.5, 3, 0, '#6E4526', 0.65));
}

function paintCottonPlant(g, x, base, scale, seed) {
  streak(g, x, base, x + Math.sin(seed) * 4, base - 48 * scale, 'rgba(104, 122, 60, 0.95)', 3.4 * scale, 1);
  for (let i = 0; i < 4; i++) {
    const s = i % 2 === 0 ? -1 : 1;
    daub(g, x + s * 9 * scale, base - (16 + i * 10) * scale, 10 * scale, 4.6 * scale, s * 0.5, i % 2 ? '#6C8A3E' : '#557034', 0.95);
  }
  [
    [0, -50],
    [-8, -38],
    [8, -40],
    [0, -63],
  ].forEach(([dx, dy], i) => {
    if (i === 3 && seed % 2 < 1) return;
    const bx = x + dx * scale;
    const by = base + dy * scale;
    glow(g, bx, by, 13 * scale, 'rgba(255, 250, 232, 0.5)');
    daub(g, bx, by, 7.4 * scale, 6.6 * scale, 0, '#FFFBF0', 1);
    daub(g, bx + 1.6 * scale, by + 1.8 * scale, 4.6 * scale, 3.4 * scale, 0, 'rgba(216, 186, 154, 0.45)', 1);
  });
}

function paintField(g) {
  const spots = [
    [46, 0.74],
    [772, 0.95],
    [806, 0.74],
    [838, 1.04],
    [872, 0.82],
    [904, 0.98],
    [936, 0.78],
  ];
  spots.forEach(([x, s], i) => paintCottonPlant(g, x, G + 4, s, i * 2.7 + 1));

  for (let i = 0; i < 16; i++) {
    const x = 20 + hash(i * 3.7) * (STAGE.w - 40);
    if (x > 690) continue;
    streak(g, x, G, x + 2, G - 12, 'rgba(108, 126, 62, 0.5)', 1.6, 0.7);
    daub(g, x + 2, G - 13, 2, 2, 0, 'rgba(250, 244, 228, 0.55)', 0.7);
  }
}

export function buildBackdrop() {
  const S = 2;
  const canvas = document.createElement('canvas');
  canvas.width = STAGE.w * S;
  canvas.height = STAGE.h * S;
  const g = canvas.getContext('2d');
  g.scale(S, S);

  paintSky(g);
  paintHorizon(g);
  paintStream(g);
  paintBridge(g);
  paintGround(g);
  paintField(g);
  BLOCKS.forEach((b) => paintCrate(g, b));

  return canvas;
}