import { TILE } from './config';
import { INK, ink, star } from './brush';
import { ART, getSprite } from './sprites';

// ---------------------------------------------------------------------------
// Capulho de pontos: pluma branca com 4 lóculos, brácteas marrons e brilho,
// no traço da arte conceitual. É desenhado uma vez num canvas e reaproveitado.
// ---------------------------------------------------------------------------
const BOLL_PX = 64; // tamanho do canvas em cache (desenhado em 2x para ficar nítido)
let bollCache = null;

function paintBoll(g, s) {
  const cx = 32 * s;
  const cy = 32 * s;
  g.lineJoin = 'round';
  g.lineCap = 'round';

  // brácteas marrons secas, aparecendo entre os lóculos (como na arte conceitual)
  const deg = Math.PI / 180;
  const bracts = [
    [28, 24], [152, 24], [72, 23], [108, 23], [-35, 20], [215, 20],
  ];
  bracts.forEach(([a, len]) => {
    const ang = a * deg;
    const tipX = cx + Math.cos(ang) * len * s;
    const tipY = cy + Math.sin(ang) * len * s;
    const nx = -Math.sin(ang) * 7 * s;
    const ny = Math.cos(ang) * 7 * s;
    const mx = cx + Math.cos(ang) * len * 0.45 * s;
    const my = cy + Math.sin(ang) * len * 0.45 * s;
    g.beginPath();
    g.moveTo(cx, cy);
    g.quadraticCurveTo(mx + nx, my + ny, tipX, tipY);
    g.quadraticCurveTo(mx - nx, my - ny, cx, cy);
    g.closePath();
    g.fillStyle = '#8A4E22';
    g.fill();
    g.strokeStyle = INK;
    g.lineWidth = 2.4 * s;
    g.stroke();
    g.beginPath();
    g.moveTo(mx, my);
    g.lineTo(cx + Math.cos(ang) * len * 0.85 * s, cy + Math.sin(ang) * len * 0.85 * s);
    g.strokeStyle = '#C98A4B';
    g.lineWidth = 1.6 * s;
    g.stroke();
  });

  // 4 lóculos de pluma, fofos e com sombra suave
  const lobes = [
    [-8, -2, 10], [8, -2, 10], [-5, 7, 9], [5, 7, 9], [0, -9, 9.5],
  ];
  g.fillStyle = INK;
  lobes.forEach(([dx, dy, r]) => {
    g.beginPath();
    g.arc(cx + dx * s, cy + dy * s, (r + 2.4) * s, 0, Math.PI * 2);
    g.fill();
  });
  lobes.forEach(([dx, dy, r]) => {
    const grad = g.createRadialGradient(
      cx + (dx - 3) * s, cy + (dy - 4) * s, 1 * s,
      cx + dx * s, cy + dy * s, r * s
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.6, '#FBF8F0');
    grad.addColorStop(1, '#D9D3C8');
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    g.fill();
  });
  // dobras leves da pluma
  g.strokeStyle = 'rgba(140, 125, 105, 0.45)';
  g.lineWidth = 1.3 * s;
  [[-8, -2, 5, 3.6, 4.6], [8, -2, 5, 4.8, 5.8], [0, -9, 4.5, 0.4, 1.6]].forEach(([dx, dy, r, a0, a1]) => {
    g.beginPath();
    g.arc(cx + dx * s, cy + dy * s, r * s, a0, a1);
    g.stroke();
  });
  // brilho
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.beginPath();
  g.ellipse(cx - 10 * s, cy - 6 * s, 3 * s, 1.8 * s, -0.6, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(cx - 2 * s, cy - 13 * s, 1.6 * s, 0, Math.PI * 2);
  g.fill();
}

function bollSprite() {
  if (bollCache || typeof document === 'undefined') return bollCache;
  const c = document.createElement('canvas');
  c.width = BOLL_PX * 2;
  c.height = BOLL_PX * 2;
  paintBoll(c.getContext('2d'), 2);
  bollCache = c;
  return c;
}

// Capulho que vale pontos: brilho girando atrás, leve pulsar e reflexo.
export function drawPointBoll(ctx, cx, cy, time = 0, scale = 1, seed = 0) {
  const pulse = 1 + Math.sin(time * 4 + seed) * 0.05;
  const r = 19 * scale * pulse;

  // aura dourada com raios, como na referência de gameplay
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.5);
  glow.addColorStop(0, 'rgba(255, 226, 110, 0.85)');
  glow.addColorStop(0.6, 'rgba(255, 200, 60, 0.35)');
  glow.addColorStop(1, 'rgba(255, 200, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = 'round';
  const rays = 8;
  for (let i = 0; i < rays; i++) {
    const a = time * 0.9 + seed + (i / rays) * Math.PI * 2;
    const inner = r * 1.02;
    const outer = r * (i % 2 ? 1.3 : 1.55);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.strokeStyle = '#FFD23F';
    ctx.lineWidth = 2.6;
    ctx.stroke();
  }
  // anel dourado, como uma moeda de algodão
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.98, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 246, 214, 0.55)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#E8A317';
  ctx.stroke();
  ctx.restore();

  const spr = bollSprite();
  if (spr) {
    const size = BOLL_PX * 0.78 * scale * pulse;
    ctx.drawImage(spr, cx - size / 2, cy - size * 0.53, size, size);
  }

  // cintilar de vez em quando
  const tw = (time * 1.3 + seed * 0.37) % 2.4;
  if (tw < 0.35) {
    const k = Math.sin((tw / 0.35) * Math.PI);
    star(ctx, cx + 10 * scale, cy - 12 * scale, 4, 7 * k * scale, 1.6 * scale, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Capulho-mola: um tufo de algodão em cima de uma mola espiral.
// squash vai de 0 (parado) a 1 (todo comprimido, logo depois do pulo).
// ---------------------------------------------------------------------------
export const SPRING_H = 30;
// tamanho do capulho em cima da mola (grande para ser visto de longe)
export const SPRING_TUFT = 78;

export function drawSpring(ctx, cx, groundY, squash = 0, time = 0) {
  const wob = Math.sin(time * 30) * squash * 0.35;
  const h = SPRING_H * (1 - squash * 0.55 + wob * 0.2) + (squash < 0 ? -squash * 10 : 0);
  const top = groundY - h - 10;

  // arte conceitual do trampolim (pequeno, para não chamar mais atenção que o herói)
  const molaImg = getSprite(ART.mola);
  if (molaImg) {
    const W = 52;
    const H = W * (molaImg.naturalHeight / molaImg.naturalWidth);
    const sy = 1 - squash * 0.45 + wob * 0.15 + (squash < 0 ? -squash * 0.2 : 0);
    const sx = 1 + squash * 0.18;
    ctx.fillStyle = 'rgba(27, 18, 12, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, groundY - 1, 22, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(molaImg, cx - (W * sx) / 2, groundY - H * sy, W * sx, H * sy);
    if (squash <= 0.01) {
      const bob = Math.sin(time * 5) * 3;
      const ty = groundY - H;
      ctx.fillStyle = 'rgba(255, 210, 63, 0.95)';
      ctx.beginPath();
      ctx.moveTo(cx - 7, ty - 12 + bob);
      ctx.lineTo(cx + 7, ty - 12 + bob);
      ctx.lineTo(cx, ty - 3 + bob);
      ctx.closePath();
      ctx.fill();
      ink(ctx, 1.6);
    }
    return;
  }

  // sombra
  ctx.fillStyle = 'rgba(27, 18, 12, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, groundY - 1, 22, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // base de madeira
  ctx.beginPath();
  ctx.moveTo(cx - 20, groundY);
  ctx.lineTo(cx + 20, groundY);
  ctx.lineTo(cx + 16, groundY - 8);
  ctx.lineTo(cx - 16, groundY - 8);
  ctx.closePath();
  ctx.fillStyle = '#9A5A2C';
  ctx.fill();
  ink(ctx, 2.2);

  // espiral metálica
  const coils = 5;
  const base = groundY - 8;
  const span = base - (top + 10);
  ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    for (let i = 0; i <= coils * 16; i++) {
      const t = i / (coils * 16);
      const y = base - t * span;
      const x = cx + Math.sin(t * coils * Math.PI * 2) * 13;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = pass === 0 ? INK : '#C9D4DC';
    ctx.lineWidth = pass === 0 ? 7 : 3.4;
    ctx.stroke();
  }
  // brilho do metal
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < coils; i++) {
    const y = base - ((i + 0.25) / coils) * span;
    ctx.beginPath();
    ctx.moveTo(cx - 6, y - 2);
    ctx.lineTo(cx + 2, y - 3);
    ctx.stroke();
  }

  // tufo de algodão em cima (o "assento" da mola)
  const sq = 1 + squash * 0.25;
  ctx.save();
  ctx.translate(cx, top + 6);
  ctx.scale(sq, 1 / sq);
  const spr = bollSprite();
  if (spr) {
    const size = SPRING_TUFT;
    ctx.drawImage(spr, -size / 2, -size * 0.6, size, size);
  }
  ctx.restore();

  // setinhas indicando "pule aqui"
  if (squash <= 0.01) {
    const bob = Math.sin(time * 5) * 3;
    ctx.fillStyle = 'rgba(255, 210, 63, 0.95)';
    ctx.beginPath();
    ctx.moveTo(cx - 8, top - 50 + bob);
    ctx.lineTo(cx + 8, top - 50 + bob);
    ctx.lineTo(cx, top - 40 + bob);
    ctx.closePath();
    ctx.fill();
    ink(ctx, 1.6);
  }
}

// ---------------------------------------------------------------------------
// Rolo de algodão como bloco: cada célula sólida vira um rolo com lona azul.
// ---------------------------------------------------------------------------
export function drawRollTile(ctx, sx, sy, x, y) {
  const img = getSprite(ART.roll);
  if (!img) {
    // reserva vetorial enquanto a imagem carrega
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2, sy + TILE / 2, TILE / 2 - 2, TILE / 2 - 3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2A7FD4';
    ctx.fill();
    ink(ctx, 2.4);
    ctx.beginPath();
    ctx.ellipse(sx + TILE / 2 - 3, sy + TILE / 2, TILE / 2 - 9, TILE / 2 - 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#F4EBDD';
    ctx.fill();
    ink(ctx, 2);
    return;
  }
  // sempre reto e no mesmo lado, com a proporção original da arte (sem achatar nem virar)
  const h = TILE;
  const w = (h * img.naturalWidth) / img.naturalHeight;
  ctx.drawImage(img, sx + TILE / 2 - w / 2 + 3, sy, w, h);
}