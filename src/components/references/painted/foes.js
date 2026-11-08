import { daub, glow, streak } from './brush';

export function drawPaintedWeevil(ctx, e, t) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const dir = e.vx >= 0 ? 1 : -1;
  const fade = e.dead > 0 ? Math.min(1, e.dead / 1.4) : 1;

  ctx.save();
  ctx.globalAlpha = fade;
  if (e.dead > 0) ctx.translate(0, 4);

  ctx.globalAlpha = fade * 0.2;
  daub(ctx, cx + 8, e.y + e.h + 2, 26, 5, 0, '#42260F', 1);
  ctx.globalAlpha = fade;

  if (e.alert) glow(ctx, cx, cy, 48, 'rgba(255, 206, 116, 0.35)');

  for (let i = -1; i <= 1; i++) {
    const lx = cx + i * 8;
    const wob = Math.sin(t * 11 + i) * 2;
    streak(ctx, lx, cy + 6, lx + wob, cy + 16, 'rgba(74, 44, 26, 0.85)', 2.6, 1);
  }

  const shell = ctx.createLinearGradient(cx - 14, cy - 12, cx + 14, cy + 12);
  shell.addColorStop(0, '#C98E56');
  shell.addColorStop(0.55, '#8E552F');
  shell.addColorStop(1, '#5C341F');
  ctx.fillStyle = shell;
  ctx.beginPath();
  ctx.ellipse(cx, cy, e.w * 0.42, e.h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  streak(ctx, cx - 2, cy - 10, cx - 2, cy + 10, 'rgba(58, 32, 18, 0.4)', 1.6, 1);
  glow(ctx, cx - 6, cy - 5, 13, 'rgba(255, 216, 164, 0.5)');

  // cabeça e rostro
  const hx = cx + dir * e.w * 0.34;
  const hy = cy - e.h * 0.24;
  daub(ctx, hx, hy, e.h * 0.26, e.h * 0.24, 0, '#6E4023', 1);
  streak(ctx, hx + dir * 4, hy - 2, hx + dir * 17, hy - 11, 'rgba(96, 58, 34, 0.95)', 4, 1);
  streak(ctx, hx + dir * 4, hy - 4, hx + dir * 17, hy - 13, 'rgba(214, 162, 108, 0.5)', 1.4, 0.9);
  streak(ctx, hx + dir * 2, hy - 8, hx + dir * 7, hy - 16, 'rgba(80, 48, 28, 0.8)', 1.6, 1);

  daub(ctx, hx + dir * 2, hy - 2, 3.4, 3.8, 0, '#FFF6E6', 1);
  daub(ctx, hx + dir * 3, hy - 1.6, 1.7, 2, 0, '#22150D', 1);
  streak(ctx, hx - dir * 2, hy - 8, hx + dir * 5, hy - 5, 'rgba(40, 22, 12, 0.75)', 1.8, 1);

  ctx.restore();
}

export function drawPaintedFly(ctx, e, t) {
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const flap = 0.4 + Math.abs(Math.sin(t * 16)) * 0.6;
  const fade = e.dead > 0 ? Math.min(1, e.dead / 1.4) : 1;

  ctx.save();
  ctx.globalAlpha = fade;
  if (e.mode === 'dive') glow(ctx, cx, cy - e.h * 0.9, 16, 'rgba(230, 96, 72, 0.45)');

  [-1, 1].forEach((s) => {
    ctx.save();
    ctx.translate(cx, cy - 4);
    ctx.rotate(s * 0.34);
    const wing = ctx.createLinearGradient(0, -10, s * 24, 8);
    wing.addColorStop(0, 'rgba(255, 252, 242, 0.95)');
    wing.addColorStop(1, 'rgba(228, 214, 210, 0.45)');
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.ellipse(s * 13, -6, 14, 7.5 * flap, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 126, 112, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  });

  const body = ctx.createLinearGradient(cx - 8, cy - 8, cx + 8, cy + 10);
  body.addColorStop(0, '#FFF7E0');
  body.addColorStop(1, '#D8C89E');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, e.w * 0.26, e.h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  [-1, 1].forEach((s) => streak(ctx, cx + s * 3, cy - 8, cx + s * 10, cy - 16, 'rgba(126, 96, 72, 0.7)', 1.4, 1));
  [-1, 1].forEach((s) => {
    daub(ctx, cx + s * 5, cy - e.h * 0.26, 3.6, 3.1, 0, '#C8322B', 1);
    daub(ctx, cx + s * 5 + 0.8, cy - e.h * 0.3, 1.3, 1.1, 0, 'rgba(255,255,255,0.9)', 1);
  });

  ctx.restore();
}

export function drawCottonToken(ctx, x, y, t) {
  glow(ctx, x, y, 27, 'rgba(255, 240, 190, 0.6)');
  const disc = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, 13);
  disc.addColorStop(0, '#FFFEF6');
  disc.addColorStop(1, '#EBDCC2');
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.strokeStyle = 'rgba(140, 108, 74, 0.3)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  [
    [0, -3.6],
    [-4.4, 1.7],
    [4.4, 1.7],
  ].forEach(([dx, dy]) => {
    daub(ctx, x + dx, y + dy, 3.7, 3.3, 0, '#FFFFFF', 1);
    daub(ctx, x + dx - 0.7, y + dy - 0.8, 2.1, 1.7, 0, 'rgba(255, 255, 255, 0.95)', 1);
  });

  const s = 0.6 + Math.sin(t * 3 + x) * 0.4;
  streak(ctx, x + 8.5, y - 10, x + 8.5, y - 5 - s * 3, 'rgba(255, 250, 230, 0.85)', 1.4, 1);
}