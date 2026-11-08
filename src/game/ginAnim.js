// Animação da algodoeira: luzes das luminárias pulsando e fumaça saindo dos canos.
const LAMPS = [
  [0.075, 0.13, 1], [0.28, 0.13, 1], [0.505, 0.13, 1], [0.72, 0.13, 1], [0.935, 0.13, 1],
  [0.19, 0.27, 0.6], [0.33, 0.27, 0.6], [0.815, 0.27, 0.6],
];
const MACHINES = [0.195, 0.352, 0.51, 0.668, 0.825];
const PIPES = [[0.1, 0.2], [0.945, 0.27]];

export function drawGinAnim(ctx, x0, y0, w, h, time) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  LAMPS.forEach(([fx, fy, s], i) => {
    const flick = 0.75 + Math.sin(time * 3 + i * 1.7) * 0.15 + Math.sin(time * 17 + i) * 0.05;
    const cx = x0 + fx * w;
    const cy = y0 + fy * h;
    const r = 70 * s * (w / 1600) * 1.6;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy + r * 0.4, r);
    g.addColorStop(0, `rgba(255, 220, 130, ${0.55 * flick})`);
    g.addColorStop(1, 'rgba(255, 200, 90, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.4, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // algodão girando dentro das cinco máquinas
  MACHINES.forEach((fx, m) => {
    const bx = x0 + (fx - 0.045) * w;
    const by = y0 + 0.735 * h;
    const bw = 0.09 * w;
    const bh = 0.055 * h;
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx, by - bh * 0.4, bw, bh * 1.4);
    ctx.clip();
    for (let i = 0; i < 7; i++) {
      const k = (((time * 0.5 + i / 7 + m * 0.13) % 1) + 1) % 1;
      const px = bx + k * bw;
      const py = by + bh * 0.55 - Math.abs(Math.sin(time * 4 + i * 1.3 + m)) * bh * 0.5;
      const r = bh * (0.28 + (i % 3) * 0.06);
      ctx.fillStyle = '#FFFDF5';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.arc(px + r * 0.7, py + r * 0.2, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(200, 180, 150, 0.5)';
      ctx.beginPath();
      ctx.arc(px + r * 0.2, py + r * 0.45, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  PIPES.forEach(([fx, fy], j) => {
    const px = x0 + fx * w;
    const py = y0 + fy * h;
    for (let i = 0; i < 6; i++) {
      const k = ((time * 0.35 + i / 6 + j * 0.37) % 1);
      const r = 6 + k * 22;
      ctx.fillStyle = `rgba(245, 240, 230, ${0.5 * (1 - k)})`;
      ctx.beginPath();
      ctx.arc(px + Math.sin(time * 1.3 + i) * 6 + k * 18, py - k * 80, r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}