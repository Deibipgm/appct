import { STAGE } from '../wonder/config';

export const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// faixa de terreno com topo ondulado, preenchida até o rodapé do palco
export function band(
  g,
  { y, amp, freq, phase = 0, color, alpha = 1, x0 = -12, x1 = STAGE.w + 12, bottom = STAGE.h + 14, step = 10 }
) {
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += step) {
    g.lineTo(x, y - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.6 + phase * 1.8) * amp * 0.3);
  }
  g.lineTo(x1, bottom);
  g.closePath();
  g.fill();
  g.restore();
}

export function daub(g, x, y, rx, ry, rot, color, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

export function streak(g, x0, y0, x1, y1, color, width, alpha = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x0, y0);
  g.lineTo(x1, y1);
  g.stroke();
  g.restore();
}

export function speck(g, x, y, w, h, color, alpha, count, seed = 1) {
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const px = x + hash(i * 1.7 + seed) * w;
    const py = y + hash(i * 3.3 + seed * 2.1) * h;
    const r = 0.6 + hash(i * 5.1 + seed) * 1.8;
    g.beginPath();
    g.arc(px, py, r, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();
}

export function glow(g, x, y, r, color) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255, 248, 226, 0)');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}