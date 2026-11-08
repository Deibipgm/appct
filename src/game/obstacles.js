import { TILE } from './config';
import { ink } from './brush';
import { ART, getSprite, drawSprite } from './sprites';

const PAD = 2;

// Retângulo com cantos arredondados apenas onde o fardo não encosta em outro.
function balePath(ctx, x, y, w, h, r, up, right, down, left) {
  const tl = !left && !up ? r : 0;
  const tr = !right && !up ? r : 0;
  const br = !right && !down ? r : 0;
  const bl = !left && !down ? r : 0;

  ctx.beginPath();
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  if (tr) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  if (br) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  if (bl) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  if (tl) ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

// Fase 5: fardo com a manta azul em destaque.
function drawBlueBale(ctx, x, y, w, h, up, right, down, left) {
  const body = ctx.createLinearGradient(0, y, 0, y + h);
  body.addColorStop(0, '#3FB4FF');
  body.addColorStop(0.55, '#0091FF');
  body.addColorStop(1, '#0055AA');

  balePath(ctx, x, y, w, h, 13, up, right, down, left);
  ctx.fillStyle = body;
  ctx.fill();
  ink(ctx, 1.8, '#0A5FA8');

  // sulcos da manta plástica
  ctx.strokeStyle = 'rgba(0, 60, 130, 0.28)';
  ctx.lineWidth = 2;
  [-0.18, 0.18].forEach((t) => {
    ctx.beginPath();
    ctx.moveTo(x + w * (0.5 + t), y + 5);
    ctx.quadraticCurveTo(x + w * (0.5 + t) + 4, y + h / 2, x + w * (0.5 + t), y + h - 5);
    ctx.stroke();
  });

  // pluma aparecendo no centro
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w * 0.24, h * 0.23, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#F6F2E6';
  ctx.fill();
  ink(ctx, 1.6, '#CFC3A8');

  // brilho
  ctx.beginPath();
  ctx.moveTo(x + 9, y + 7);
  ctx.quadraticCurveTo(x + w * 0.34, y + 3, x + w * 0.5, y + 7);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

// Fase 4: meio branco do fardo com bordas azuis.
function drawCottonBale(ctx, x, y, w, h, up, right, down, left) {
  const rim = ctx.createLinearGradient(0, y, 0, y + h);
  rim.addColorStop(0, '#2E9BFF');
  rim.addColorStop(1, '#0050A0');

  balePath(ctx, x, y, w, h, 13, up, right, down, left);
  ctx.fillStyle = rim;
  ctx.fill();
  ink(ctx, 1.8, '#0A5FA8');

  const ix = x + (left ? 0 : 6);
  const iy = y + 6;
  const iw = w - (left ? 0 : 6) - (right ? 0 : 6);
  const ih = h - 12;

  balePath(ctx, ix, iy, iw, ih, 9, up, right, down, left);
  ctx.fillStyle = '#F7F4EA';
  ctx.fill();
  ink(ctx, 1.6, '#CFC3A8');

  // volume da pluma
  ctx.save();
  ctx.beginPath();
  ctx.rect(ix, iy, iw, ih);
  ctx.clip();

  ctx.fillStyle = '#E9E2D2';
  ctx.beginPath();
  ctx.ellipse(ix + iw * 0.3, iy + ih * 0.74, iw * 0.22, ih * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.ellipse(ix + iw * 0.58, iy + ih * 0.34, iw * 0.24, ih * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(180, 168, 146, 0.65)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    const py = iy + 5 + (i * (ih - 10)) / 2;
    ctx.beginPath();
    ctx.moveTo(ix + 4, py);
    ctx.quadraticCurveTo(ix + iw / 2, py + 3, ix + iw - 4, py);
    ctx.stroke();
  }
  ctx.restore();
}

// Fardos de algodão: obstáculos sólidos para o Dão saltar.
export function drawBaleContainer(ctx, sx, sy, style = 'blue', left = false, right = false, up = false, down = false) {
  const art = getSprite(ART.bale);
  if (art) {
    // Fardo redondo azul da arte conceitual, um por bloco (empilhados formam as pilhas).
    drawSprite(ctx, art, sx + TILE / 2, sy + TILE + 1, TILE + 6, { anchorY: 1 });
    return;
  }
  const x = sx + PAD;
  const y = sy + PAD + 2;
  const w = TILE - PAD * 2;
  const h = TILE - PAD * 2 - 4;

  ctx.beginPath();
  ctx.rect(x, y + 5, w, h);
  ctx.fillStyle = 'rgba(27, 18, 12, 0.16)';
  ctx.fill();

  if (style === 'cotton') drawCottonBale(ctx, x, y, w, h, up, right, down, left);
  else drawBlueBale(ctx, x, y, w, h, up, right, down, left);
}