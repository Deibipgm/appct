import { TILE } from './config';
import { hash } from './brush';

// Chão no estilo da referência: corpo em terra clara com linhas
// onduladas escuras e faixa de grama verde com borda pixelada.
export function drawGroundCell(ctx, sx, sy, x, y, th, surface) {
  ctx.fillStyle = th.soil;
  ctx.fillRect(sx, sy, TILE + 1, TILE + 1);

  ctx.strokeStyle = th.soilDark;
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  const startY = surface ? 30 : 16;
  for (let i = 0; i < 2; i++) {
    const baseY = sy + startY + i * 15 + hash(x * 19 + y * 7 + i) * 2;
    const wob = 2.4 + hash(x * 7 + y * 3 + i) * 1.6;
    ctx.beginPath();
    ctx.moveTo(sx - 1, baseY);
    ctx.quadraticCurveTo(sx + 12, baseY - wob, sx + 24, baseY);
    ctx.quadraticCurveTo(sx + 36, baseY + wob, sx + TILE + 1, baseY);
    ctx.stroke();
  }

  if (!surface) return;

  ctx.fillStyle = th.grass;
  ctx.fillRect(sx, sy, TILE + 1, 14);
  ctx.fillStyle = th.grassLight;
  ctx.fillRect(sx, sy, TILE + 1, 6);

  // degraus da grama para o efeito pixelado
  ctx.fillStyle = th.grass;
  for (let k = 0; k < 3; k++) {
    const bx = sx + k * 16 + Math.floor(hash(x * 5 + k * 3) * 4);
    const bh = 4 + Math.floor(hash(x * 3 + k * 7 + y) * 4);
    ctx.fillRect(bx, sy + 14, 8, bh);
  }
}