import { VIEW_W, VIEW_H } from './config';
import { drawCloud } from './brush';
import { ART, getSprite } from './sprites';
import { rand } from './scenery';

// Céu da fase aérea: paisagem rural pintada ao fundo (serras, fazendas e talhões), nuvens andando
// e riscos de vento passando rápido. Sem a arte, desenha a lavoura em retalhos.
const FIELDS = ['#6DBE45', '#8ACB52', '#4FA83D', '#B9D86A', '#D9B26A', '#5DB24A', '#A6CF5B'];
const HORIZON = VIEW_H - 190;

function drawFarmland(ctx, dist) {
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, '#2FA8F0');
  sky.addColorStop(1, '#BFEAFF');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, HORIZON + 6);
  // serra azulada no horizonte
  ctx.fillStyle = '#7FA8B8';
  ctx.beginPath();
  ctx.moveTo(0, HORIZON + 4);
  for (let x = 0; x <= VIEW_W; x += 20) ctx.lineTo(x, HORIZON - 6 - Math.sin((x + dist * 0.05) * 0.012) * 8);
  ctx.lineTo(VIEW_W, HORIZON + 4);
  ctx.fill();
  // faixas de lavoura: as de baixo (mais perto) andam mais rápido
  const bands = [[HORIZON, 16, 0.2], [HORIZON + 16, 26, 0.35], [HORIZON + 42, 46, 0.55], [HORIZON + 88, 102, 0.8]];
  bands.forEach(([y, h, k], bi) => {
    const cell = 70 + bi * 50;
    const off = dist * k;
    const first = Math.floor(off / cell);
    for (let i = first; i * cell - off < VIEW_W + cell; i++) {
      const x = i * cell - off;
      ctx.fillStyle = FIELDS[Math.floor(rand(i * 7.3 + bi * 13) * FIELDS.length)];
      ctx.fillRect(x, y, cell + 1, h + 1);
    }
  });
}

function cloudLayer(ctx, dist, time, k, y0, scale, n, alpha) {
  const art = getSprite(ART.aereoNuvem);
  ctx.save();
  ctx.globalAlpha = alpha;
  const span = VIEW_W + 300;
  for (let i = 0; i < n; i++) {
    const raw = i * (span / n) - dist * k - time * 6 * k;
    const x = ((raw % span) + span) % span - 150;
    const y = y0 + rand(i * 5.7 + k) * 90 + Math.sin(time * 0.6 + i) * 3;
    const s = scale * (0.8 + rand(i * 2.3) * 0.5);
    if (art) {
      const w = 170 * s;
      ctx.drawImage(art, x - w / 2, y - (w * art.naturalHeight) / art.naturalWidth / 2, w, (w * art.naturalHeight) / art.naturalWidth);
    } else drawCloud(ctx, x, y, s);
  }
  ctx.restore();
}

// Paisagem de fundo (arte pintada): rola devagar, espelhada a cada repetição para não aparecer emenda.
export function drawFlightSky(ctx, fl, time) {
  const bg = getSprite(ART.aereoFundo);
  if (!bg) {
    drawFarmland(ctx, fl.dist);
  } else {
    const h = VIEW_H;
    const w = (h * bg.naturalWidth) / bg.naturalHeight;
    const off = fl.dist * 0.25;
    for (let i = Math.floor(off / w); i * w - off < VIEW_W; i++) {
      const x = i * w - off;
      ctx.save();
      if (i % 2) {
        ctx.translate(x + w, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(bg, 0, 0, w + 1, h);
      } else ctx.drawImage(bg, x, 0, w + 1, h);
      ctx.restore();
    }
  }
  cloudLayer(ctx, fl.dist, time, 0.12, 14, 0.8, 4, 0.85);
  cloudLayer(ctx, fl.dist, time, 0.3, 60, 1.05, 3, 0.95);
}

// Riscos de vento passando rápido: dão a sensação de velocidade (sem nuvens na frente do avião).
export function drawNearClouds(ctx, fl) {
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    const x = ((i * 173 - fl.dist * 3.2) % (VIEW_W + 200) + VIEW_W + 200) % (VIEW_W + 200) - 100;
    const y = 40 + rand(i * 9.1) * (HORIZON - 80);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40 + rand(i) * 40, y);
    ctx.stroke();
  }
}
