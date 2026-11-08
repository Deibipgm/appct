import { ART, getSprite, drawSprite } from './sprites';
import { INK, rr, ink, hash, puffCluster, drawBoll } from './brush';

function drawPlant(ctx, x, groundY, seed) {
  const h = 36 + hash(seed) * 20;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x + 5, groundY - h * 0.6, x + 2, groundY - h);
  ink(ctx, 5.5);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x + 5, groundY - h * 0.6, x + 2, groundY - h);
  ink(ctx, 2.4, '#3E8B2E');

  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.ellipse(x + s * 9, groundY - h * 0.55, 9, 5, s * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#5FC24A';
    ctx.fill();
    ink(ctx, 2);
  });
  drawBoll(ctx, x + 2, groundY - h - 5, 0.62);
}

function drawBush(ctx, x, groundY) {
  puffCluster(ctx, x, groundY - 7, [[0, 0, 15], [-11, 3, 10], [11, 3, 10]], 1, '#57B24A');
}

function drawStake(ctx, x, groundY) {
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 42);
  ink(ctx, 7);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 42);
  ink(ctx, 3.4, '#C98A4B');
  ctx.beginPath();
  ctx.arc(x, groundY - 46, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD23F';
  ctx.fill();
  ink(ctx, 2.4);
}

// --- Fase 1: preparo do solo ------------------------------------------------
function drawFurrow(ctx, x, groundY, seed) {
  const w = 46 + hash(seed) * 8;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, groundY);
  ctx.quadraticCurveTo(x, groundY - 22, x + w / 2, groundY);
  ctx.closePath();
  ctx.fillStyle = '#A9764A';
  ctx.fill();
  ink(ctx, 2.6);
  ctx.strokeStyle = 'rgba(80, 48, 22, 0.5)';
  ctx.lineWidth = 2.2;
  [-6, 2, 9].forEach((dy) => {
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + 6, groundY - 8 + dy * 0.2);
    ctx.quadraticCurveTo(x, groundY - 16 + dy, x + w / 2 - 6, groundY - 8 + dy * 0.2);
    ctx.stroke();
  });
}

function drawClod(ctx, x, groundY, seed) {
  const s = 0.85 + hash(seed) * 0.4;
  [[0, -7, 11, 7], [-11, -4, 7, 5], [10, -5, 8, 5.5]].forEach(([dx, dy, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(x + dx * s, groundY + dy * s, rx * s, ry * s, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#9A6B3F';
    ctx.fill();
    ink(ctx, 2.2);
  });
  ctx.strokeStyle = 'rgba(60, 36, 16, 0.55)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x - 5, groundY - 9);
  ctx.lineTo(x + 2, groundY - 5);
  ctx.lineTo(x - 1, groundY - 1);
  ctx.stroke();
}

// --- Fase 2: plantio -------------------------------------------------------
function drawSeedling(ctx, x, groundY, seed) {
  const h = 16 + hash(seed) * 9;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - h);
  ink(ctx, 3.4, '#3E8B2E');
  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.ellipse(x + s * 6, groundY - h - 1, 7.5, 4.2, s * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#7BD05B';
    ctx.fill();
    ink(ctx, 1.8);
  });
  ctx.beginPath();
  ctx.arc(x, groundY - h - 2, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE066';
  ctx.fill();
}

function drawSprinkler(ctx, x, groundY) {
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 34);
  ink(ctx, 6);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 34);
  ink(ctx, 3, '#9FB4C4');
  ctx.beginPath();
  ctx.arc(x, groundY - 38, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD23F';
  ctx.fill();
  ink(ctx, 2.2);
  ctx.strokeStyle = '#7FCBEF';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  [-2, -1, 0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.moveTo(x + i * 3, groundY - 44);
    ctx.lineTo(x + i * 9, groundY - 26);
    ctx.stroke();
  });
}

function drawSeedBag(ctx, x, groundY) {
  ctx.beginPath();
  rr(ctx, x - 15, groundY - 30, 30, 30, 9);
  ctx.fillStyle = '#E8D7AE';
  ctx.fill();
  ink(ctx, 2.6);
  ctx.beginPath();
  rr(ctx, x - 9, groundY - 36, 18, 9, 4);
  ctx.fillStyle = '#C9AF7C';
  ctx.fill();
  ink(ctx, 2.2);
  ctx.fillStyle = '#3E8B2E';
  ctx.beginPath();
  ctx.arc(x, groundY - 15, 5, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, 1.8);
}

// --- Fase 3: crescimento ---------------------------------------------------
function drawFlowerPlant(ctx, x, groundY, seed) {
  const h = 30 + hash(seed) * 12;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x - 3, groundY - h * 0.6, x, groundY - h);
  ink(ctx, 4.6);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.quadraticCurveTo(x - 3, groundY - h * 0.6, x, groundY - h);
  ink(ctx, 2.2, '#4E9A3A');
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(a) * 8,
      groundY - h + Math.sin(a) * 8,
      6.5,
      4.6,
      a,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#FFE066';
    ctx.fill();
    ink(ctx, 1.8);
  }
  ctx.beginPath();
  ctx.arc(x, groundY - h, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#F2A6C0';
  ctx.fill();
  ink(ctx, 1.6);
}

function drawScarecrow(ctx, x, groundY) {
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 74);
  ink(ctx, 7);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x, groundY - 74);
  ink(ctx, 3.4, '#C98A4B');
  ctx.beginPath();
  ctx.moveTo(x - 24, groundY - 54);
  ctx.lineTo(x + 24, groundY - 54);
  ink(ctx, 5.4);
  ctx.beginPath();
  ctx.moveTo(x - 24, groundY - 54);
  ctx.lineTo(x + 24, groundY - 54);
  ink(ctx, 2.6, '#C98A4B');
  ctx.beginPath();
  rr(ctx, x - 13, groundY - 60, 26, 24, 6);
  ctx.fillStyle = '#8FB7D6';
  ctx.fill();
  ink(ctx, 2.4);
  ctx.fillStyle = '#FFE9A8';
  ctx.beginPath();
  ctx.arc(x, groundY - 66, 9, 0, Math.PI * 2);
  ctx.fill();
  ink(ctx, 2.2);
  ctx.beginPath();
  ctx.moveTo(x - 13, groundY - 71);
  ctx.lineTo(x + 13, groundY - 71);
  ctx.lineTo(x, groundY - 82);
  ctx.closePath();
  ctx.fillStyle = '#C9A24B';
  ctx.fill();
  ink(ctx, 2.2);
  [-3, 3].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(x + dx, groundY - 68, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  });
}

// --- Fase 4: colheita ------------------------------------------------------
function drawBale(ctx, x, groundY, seed) {
  const art = getSprite(ART.bale);
  if (art) {
    drawSprite(ctx, art, x, groundY + 2, 58 + (seed % 3) * 6, { anchorY: 1 });
    return;
  }
  const w = 42 + hash(seed) * 8;
  const h = 30 + hash(seed) * 6;
  ctx.beginPath();
  rr(ctx, x - w / 2, groundY - h, w, h, 12);
  ctx.fillStyle = '#FFF6E4';
  ctx.fill();
  ink(ctx, 2.8);
  ctx.strokeStyle = '#C9A67A';
  ctx.lineWidth = 2.4;
  [-6, 6].forEach((dx) => {
    ctx.beginPath();
    ctx.moveTo(x + dx, groundY - h + 4);
    ctx.lineTo(x + dx, groundY - 4);
    ctx.stroke();
  });
  ctx.fillStyle = 'rgba(201, 166, 122, 0.5)';
  ctx.beginPath();
  ctx.arc(x + 2, groundY - h + 10, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCrate(ctx, x, groundY) {
  ctx.beginPath();
  rr(ctx, x - 18, groundY - 26, 36, 26, 5);
  ctx.fillStyle = '#C98A4B';
  ctx.fill();
  ink(ctx, 2.6);
  ctx.strokeStyle = 'rgba(90, 55, 24, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 14, groundY - 12);
  ctx.lineTo(x + 14, groundY - 12);
  ctx.moveTo(x - 18, groundY - 26);
  ctx.lineTo(x + 18, groundY);
  ctx.stroke();
  puffCluster(ctx, x, groundY - 28, [[0, 0, 9], [-8, 2, 6], [8, 2, 6]], 1, '#FFFDF7');
}

function drawStalk(ctx, x, groundY, seed) {
  const h = 34 + hash(seed) * 12;
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x + 2, groundY - h);
  ink(ctx, 5);
  ctx.beginPath();
  ctx.moveTo(x, groundY);
  ctx.lineTo(x + 2, groundY - h);
  ink(ctx, 2.2, '#A9793F');
  [-1, 1].forEach((s) => {
    ctx.strokeStyle = '#8A5A2C';
    ctx.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 2, groundY - h + i * 4);
      ctx.lineTo(x + 2 + s * (12 + i * 3), groundY - h - 4 + i * 6);
      ctx.stroke();
    }
  });
}

const PROPS = {
  plant: drawPlant,
  bush: (ctx, x, groundY) => drawBush(ctx, x, groundY),
  stake: drawStake,
  furrow: drawFurrow,
  clod: drawClod,
  seedling: drawSeedling,
  sprinkler: drawSprinkler,
  seedbag: drawSeedBag,
  flower: drawFlowerPlant,
  scarecrow: drawScarecrow,
  bale: drawBale,
  crate: drawCrate,
  stalk: drawStalk,
};

export function drawSceneryProp(ctx, kind, x, groundY, seed) {
  const draw = PROPS[kind];
  if (draw) draw(ctx, x, groundY, seed);
}

export function drawSurfaceDetail(ctx, sx, sy, kind, tileX) {
  if (!kind) return;
  const h = hash(tileX * 4.7);
  ctx.lineCap = 'round';
  if (kind === 'furrow') {
    ctx.strokeStyle = 'rgba(92, 58, 28, 0.35)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx, sy + 8 + h * 2);
    ctx.quadraticCurveTo(sx + 24, sy + 5 + h * 3, sx + 48, sy + 9);
    ctx.stroke();
  } else if (kind === 'seedling') {
    ctx.strokeStyle = 'rgba(52, 110, 40, 0.55)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const px = sx + 9 + i * 14 + h * 4;
      ctx.beginPath();
      ctx.moveTo(px, sy + 12);
      ctx.lineTo(px, sy + 6);
      ctx.moveTo(px - 3, sy + 8);
      ctx.lineTo(px, sy + 6);
      ctx.moveTo(px + 3, sy + 8);
      ctx.lineTo(px, sy + 6);
      ctx.stroke();
    }
  } else if (kind === 'flower') {
    for (let i = 0; i < 2; i++) {
      const px = sx + 12 + i * 20 + h * 6;
      ctx.strokeStyle = 'rgba(60, 110, 44, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, sy + 13);
      ctx.lineTo(px, sy + 7);
      ctx.stroke();
      ctx.fillStyle = i % 2 === 0 ? '#FFDB5C' : '#F3A6BE';
      ctx.beginPath();
      ctx.arc(px, sy + 5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'stubble') {
    ctx.strokeStyle = 'rgba(120, 86, 44, 0.55)';
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 4; i++) {
      const px = sx + 6 + i * 11 + h * 4;
      ctx.beginPath();
      ctx.moveTo(px, sy + 13);
      ctx.lineTo(px + 1, sy + 6);
      ctx.stroke();
    }
  }
}

// --- Silhuetas de fundo por fase -------------------------------------------
const TINT = '#5F7A52';
const TINT_INK = '#41552F';

function landmarkTractor(ctx, x, y) {
  ctx.beginPath();
  rr(ctx, x - 30, y - 30, 50, 22, 6);
  ctx.fillStyle = TINT;
  ctx.fill();
  ink(ctx, 2.4, TINT_INK);
  ctx.beginPath();
  rr(ctx, x - 8, y - 48, 22, 22, 6);
  ctx.fillStyle = TINT;
  ctx.fill();
  ink(ctx, 2.4, TINT_INK);
  [[-20, 15], [18, 23]].forEach(([dx, r]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y - 8, r, 0, Math.PI * 2);
    ctx.fillStyle = '#718A60';
    ctx.fill();
    ink(ctx, 2.4, TINT_INK);
  });
}

function landmarkPivot(ctx, x, y) {
  ctx.strokeStyle = TINT;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(x - 150, y - 62);
  ctx.lineTo(x + 130, y - 62);
  ctx.stroke();
  ctx.lineWidth = 2;
  for (let i = -150; i < 130; i += 22) {
    ctx.beginPath();
    ctx.moveTo(x + i, y - 62);
    ctx.lineTo(x + i + 11, y - 48);
    ctx.stroke();
  }
  [[0, -62], [-84, -50], [78, -50]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  });
}

function landmarkWindmill(ctx, x, y, time) {
  ctx.beginPath();
  ctx.moveTo(x - 16, y);
  ctx.lineTo(x - 6, y - 74);
  ctx.lineTo(x + 6, y - 74);
  ctx.lineTo(x + 16, y);
  ctx.closePath();
  ctx.fillStyle = TINT;
  ctx.fill();
  ink(ctx, 2.4, TINT_INK);
  ctx.save();
  ctx.translate(x, y - 74);
  ctx.rotate(time * 0.5);
  ctx.fillStyle = '#718A60';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    rr(ctx, -3, -44, 6, 40, 3);
    ctx.fill();
    ink(ctx, 1.8, TINT_INK);
  }
  ctx.restore();
}

function landmarkHarvester(ctx, x, y) {
  ctx.beginPath();
  rr(ctx, x - 34, y - 44, 62, 30, 6);
  ctx.fillStyle = TINT;
  ctx.fill();
  ink(ctx, 2.4, TINT_INK);
  ctx.beginPath();
  rr(ctx, x - 6, y - 60, 22, 18, 5);
  ctx.fillStyle = TINT;
  ctx.fill();
  ink(ctx, 2.4, TINT_INK);
  ctx.beginPath();
  ctx.moveTo(x + 28, y - 22);
  ctx.lineTo(x + 76, y - 22);
  ctx.lineTo(x + 76, y - 6);
  ctx.lineTo(x + 28, y - 6);
  ctx.closePath();
  ctx.fillStyle = '#718A60';
  ctx.fill();
  ink(ctx, 2.2, TINT_INK);
  [[-24, 16], [14, 20]].forEach(([dx, r]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y - 6, r, 0, Math.PI * 2);
    ctx.fillStyle = '#718A60';
    ctx.fill();
    ink(ctx, 2.2, TINT_INK);
  });
}

const LANDMARKS = {
  tractor: landmarkTractor,
  pivot: landmarkPivot,
  windmill: landmarkWindmill,
  harvester: landmarkHarvester,
};

export function drawLandmark(ctx, kind, camera, baseY, time) {
  const draw = LANDMARKS[kind];
  if (!draw) return;
  const x = 600 - camera * 0.18;
  if (x < -280 || x > 1300) return;
  ctx.save();
  ctx.globalAlpha = 0.5;
  draw(ctx, x, baseY, time);
  ctx.restore();
}