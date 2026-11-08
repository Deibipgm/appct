export const INK = '#1B120C';

export function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

// Contorno grosso em todos os elementos, para ler bem em tela pequena.
export const INK_SCALE = 1.28;

export function ink(ctx, w = 2.6, color = INK) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w * INK_SCALE;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

export const hash = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

export function puffCluster(ctx, cx, cy, puffs, scale, fill, outline = INK) {
  if (outline) {
    ctx.fillStyle = outline;
    puffs.forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * scale, cy + dy * scale, (r + 2.3) * scale, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  ctx.fillStyle = fill;
  puffs.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(cx + dx * scale, cy + dy * scale, r * scale, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function star(ctx, cx, cy, spikes, outer, inner, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = rot + (i * Math.PI) / spikes;
    const r = i % 2 === 0 ? outer : inner;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export function drawCloud(ctx, x, y, s) {
  puffCluster(ctx, x, y, [[0, 0, 25], [-30, 6, 17], [30, 7, 19], [-12, -12, 19], [16, -10, 16]], s, '#FFFFFF');
}

export function drawBoll(ctx, cx, cy, scale = 1) {
  ctx.fillStyle = '#57B24A';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * 9.5 * scale, cy + Math.sin(a) * 9.5 * scale, 7 * scale, 5 * scale, a, 0, Math.PI * 2);
    ctx.fill();
    ink(ctx, 1.9);
  }
  const puffs = [[0, 0, 10], [-7, 2, 8], [7, 2, 8], [0, -7, 8], [0, 7, 7.5]];
  puffCluster(ctx, cx, cy, puffs, scale, '#FFFDF7');
  ctx.fillStyle = 'rgba(168, 203, 224, 0.55)';
  ctx.beginPath();
  ctx.arc(cx + 4 * scale, cy + 5 * scale, 5.4 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx - 3.5 * scale, cy - 3.5 * scale, 2.2 * scale, 0, Math.PI * 2);
  ctx.fill();
}