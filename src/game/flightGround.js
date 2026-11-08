import { VIEW_W, VIEW_H, TILE } from './config';
import { ART, getSprite } from './sprites';

// Voo rasante: obstáculos presos ao chão da lavoura (torres de energia, postes com fios e pivôs).
export const GROUND_Y = VIEW_H - 64;

// w = largura desenhada; boxes = partes que batem (frações da arte desenhada: x0, y0, x1, y1)
const KINDS = {
  torre: { art: 'torre', w: 120, boxes: [[0.32, 0.03, 0.68, 0.3], [0.18, 0.3, 0.82, 1]] },
  poste: { art: 'poste', w: 360, boxes: [[0.03, 0, 0.13, 1], [0.87, 0, 0.97, 1], [0.08, 0.12, 0.92, 0.42]] },
  pivo: { art: 'pivo', w: 470, boxes: [[0.62, 0.03, 1, 0.42], [0.43, 0.3, 0.72, 1], [0.2, 0.36, 0.5, 0.62], [0.02, 0.6, 0.22, 0.85]] },
};

const art = (k) => getSprite(ART[KINDS[k].art]);

// altura aproximada de cada obstáculo desenhado (para tirar os capulhos de cima dele)
const HEIGHTS = { torre: 235, poste: 110, pivo: 168 };

// Capulhos, dourados e curiosidades não podem ficar dentro de um obstáculo:
// os que caem na frente dele sobem para o céu livre, bem acima do topo.
export function keepPickupsClear(ground, pickups) {
  for (const o of ground) {
    const x0 = o.at + 20 - 70;
    const x1 = o.at + 20 + KINDS[o.kind].w + 70;
    const top = GROUND_Y - HEIGHTS[o.kind];
    for (const it of pickups) {
      const x = it.at + 40;
      if (x > x0 && x < x1 && it.y > top - 70) it.y = Math.max(60, top - 80);
    }
  }
}

export function initGround(def) {
  return (def.ground ?? []).map((g) => ({ ...g, at: g.at * TILE, x: 0, live: false, gone: false }));
}

export const boxesOf = (o) => {
  const k = KINDS[o.kind];
  const a = art(o.kind);
  const h = a ? (k.w * a.naturalHeight) / a.naturalWidth : HEIGHTS[o.kind];
  const top = GROUND_Y - h + 6;
  return k.boxes.map(([x0, y0, x1, y1]) => ({ x: o.x + x0 * k.w, y: top + y0 * h, w: (x1 - x0) * k.w, h: (y1 - y0) * h }));
};

export function updateGround(eng, hurt) {
  const fl = eng.fl;
  const pl = fl.plane;
  // caixa do avião bem justa: só a fuselagem bate (asas e rodas não), dando folga para desviar
  const me = { x: pl.x + 22, y: pl.y + 10, w: pl.w - 44, h: pl.h - 20 };
  for (const o of fl.ground) {
    if (o.gone) continue;
    if (!o.live && fl.dist + VIEW_W >= o.at) {
      o.live = true;
      o.x = VIEW_W + 20;
    }
    if (!o.live) continue;
    o.x -= fl.speed;
    if (o.x < -KINDS[o.kind].w - 40) o.gone = true;
    const hit = boxesOf(o).some((b) => me.x < b.x + b.w && me.x + me.w > b.x && me.y < b.y + b.h && me.y + me.h > b.y);
    if (hit) hurt(eng, o.kind);
  }
}

export function drawGroundObstacles(ctx, fl) {
  fl.ground.forEach((o) => {
    if (!o.live || o.gone) return;
    const a = art(o.kind);
    const w = KINDS[o.kind].w;
    const h = a ? (w * a.naturalHeight) / a.naturalWidth : HEIGHTS[o.kind];
    ctx.fillStyle = 'rgba(27, 18, 12, 0.18)';
    ctx.beginPath();
    ctx.ellipse(o.x + w / 2, GROUND_Y + 4, w * 0.45, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (a) ctx.drawImage(a, o.x, GROUND_Y - h + 6, w, h);
    else {
      ctx.fillStyle = '#8A8F96';
      boxesOf(o).forEach((b) => ctx.fillRect(b.x, b.y, b.w, b.h));
    }
  });
}

// Fileiras de algodão bem perto do chão, rolando na velocidade do voo
// (espelhadas a cada repetição para não aparecer emenda).
export function drawCottonRows(ctx, dist) {
  const a = getSprite(ART.fileira);
  ctx.fillStyle = '#A8683A';
  ctx.fillRect(0, GROUND_Y - 10, VIEW_W, VIEW_H - GROUND_Y + 10);
  if (!a) return;
  const h = VIEW_H - GROUND_Y + 40;
  const w = (h * a.naturalWidth) / a.naturalHeight;
  const first = Math.floor(dist / w);
  for (let i = first; i * w - dist < VIEW_W; i++) {
    const x = i * w - dist;
    ctx.save();
    if (i % 2) {
      ctx.translate(x + w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(a, -0.5, GROUND_Y - 40, w + 1, h);
    } else ctx.drawImage(a, x - 0.5, GROUND_Y - 40, w + 1, h);
    ctx.restore();
  }
}
