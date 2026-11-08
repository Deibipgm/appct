import { INK } from './brush';

// Relógio 24h: vilão do laboratório que solta ondas de "tempo parado".
// Se a onda pega o Dão, ele fica mais lento por alguns segundos.
const WAVE_EVERY = 150;
const WAVE_SPEED = 3.2;
const WAVE_MAX = 170;
export const SLOW_FRAMES = 200;
export const SLOW_FACTOR = 0.5;

export function updateClockPower(eng, e) {
  const p = eng.player;
  eng.clockWaves = eng.clockWaves ?? [];
  e.waveT = (e.waveT ?? 60) + 1;
  const near = Math.abs(p.x - e.x) < 320;
  if (near && e.waveT >= WAVE_EVERY) {
    e.waveT = 0;
    eng.clockWaves.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, r: 10, hit: false });
    eng.hooks.onSound?.('tick');
  }
}

export function updateClockWaves(eng) {
  const p = eng.player;
  if (p.slow > 0) p.slow--;
  eng.clockWaves = (eng.clockWaves ?? []).filter((w) => {
    w.r += WAVE_SPEED;
    const d = Math.hypot(p.x + p.w / 2 - w.x, p.y + p.h / 2 - w.y);
    if (!w.hit && Math.abs(d - w.r) < 18 && eng.power <= 0) {
      w.hit = true;
      p.slow = SLOW_FRAMES;
      eng.hooks.onSound?.('slow');
    }
    return w.r < WAVE_MAX;
  });
}

export function drawClockWaves(ctx, eng) {
  const cam = eng.camera;
  (eng.clockWaves ?? []).forEach((w) => {
    const k = w.r / WAVE_MAX;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#F0273A';
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(w.x - cam, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFD23F';
    ctx.beginPath();
    ctx.arc(w.x - cam, w.y, w.r - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  // Dão lento: ampulheta girando sobre a cabeça e ar azulado
  const p = eng.player;
  if (!(p.slow > 0) || eng.finale) return;
  const cx = p.x + p.w / 2 - cam;
  const top = p.y - 34 + Math.sin(eng.time * 4) * 2;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p.slow / 30);
  ctx.fillStyle = 'rgba(120, 170, 255, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, p.y + p.h / 2 - 6, 30, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(cx, top);
  ctx.rotate(Math.sin(eng.time * 2) * 0.4);
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = INK;
  ctx.fillStyle = '#FFE98F';
  ctx.beginPath();
  ctx.moveTo(-8, -11);
  ctx.lineTo(8, -11);
  ctx.lineTo(0, 0);
  ctx.lineTo(8, 11);
  ctx.lineTo(-8, 11);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#E81E25';
  ctx.fillRect(-10, -14, 20, 4);
  ctx.fillRect(-10, 10, 20, 4);
  ctx.restore();
}