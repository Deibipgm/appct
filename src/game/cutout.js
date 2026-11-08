// Recorta uma arte e apaga o fundo claro ligado às bordas (flood fill), mantendo os brancos internos.
const cache = new Map();

function build(img, crop, mode) {
  // mode 'alpha': a arte já tem fundo transparente, só recorta (não lê pixels, então funciona também em file://)
  const sx = Math.round(crop[0] * img.naturalWidth);
  const sy = Math.round(crop[1] * img.naturalHeight);
  const w = Math.round((crop[2] - crop[0]) * img.naturalWidth);
  const h = Math.round((crop[3] - crop[1]) * img.naturalHeight);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  g.drawImage(img, sx, sy, w, h, 0, 0, w, h);
  if (mode === 'alpha') return c;
  const d = g.getImageData(0, 0, w, h);
  const p = d.data;
  const isBg = (i) => {
    const max = Math.max(p[i], p[i + 1], p[i + 2]);
    const min = Math.min(p[i], p[i + 1], p[i + 2]);
    if (mode === 'dark') return max < 80 && max - min < 16;
    return min > 205 && max - min < 30;
  };
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const k = stack.pop();
    if (seen[k]) continue;
    seen[k] = 1;
    if (!isBg(k * 4)) continue;
    p[k * 4 + 3] = 0;
    const x = k % w;
    if (x > 0) stack.push(k - 1);
    if (x < w - 1) stack.push(k + 1);
    if (k >= w) stack.push(k - w);
    if (k < w * (h - 1)) stack.push(k + w);
  }
  g.putImageData(d, 0, 0);
  return c;
}

export function getCutout(url, crop, mode) {
  let e = cache.get(url);
  if (!e) {
    const img = new Image();
    if (/^https?:/.test(url)) img.crossOrigin = 'anonymous';
    img.src = url;
    e = { img, canvas: null };
    cache.set(url, e);
  }
  if (!e.canvas && e.img.complete && e.img.naturalWidth) e.canvas = build(e.img, crop, mode);
  return e.canvas;
}