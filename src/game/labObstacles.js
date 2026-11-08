import { getCutout } from './cutout';

import { ART_BASE } from './sprites';
// Obstáculos ilustrados do laboratório: carrinho de rolos e máquina HVI.
const ARTS = {
  carrinho: { url: `${ART_BASE}carrinho-rolos.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 18 },
  fardo1: { url: `${ART_BASE}fardo-1.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 8, fit: true },
  fardo2: { url: `${ART_BASE}fardo-2.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 8, fit: true },
  fardo4: { url: `${ART_BASE}fardo-4.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 10, fit: true },
  carda: { url: `${ART_BASE}fiacao-carda.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 6, fit: true },
  carretel1: { url: `${ART_BASE}fiacao-carretel-1.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 6, fit: true },
  carretel2: { url: `${ART_BASE}fiacao-carretel-2.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 6, fit: true },
  carretel3: { url: `${ART_BASE}fiacao-carretel-3.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 6, fit: true },
  rolofio: { url: `${ART_BASE}fiacao-rolo.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 4, fit: true },
  hvi: { url: `${ART_BASE}maquina-hvi.png`, crop: [0, 0, 1, 1], mode: 'alpha', over: 8 },
};

// Desenha a arte cobrindo os blocos do obstáculo (o topo da arte fica um pouco acima).
export function drawLabObstacle(ctx, o, camera, groundY, tile) {
  const a = ARTS[o.art];
  const art = a && getCutout(a.url, a.crop, a.mode);
  if (!art) return;
  const x = o.x * tile - camera;
  // sombra suave: destaca a peça do fundo e a assenta no chão
  ctx.save();
  ctx.shadowColor = 'rgba(27, 18, 12, 0.45)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 3;
  try {
    return drawLabObstacleInner(ctx, o, camera, groundY, tile, a, art, x);
  } finally {
    ctx.restore();
  }
}

function drawLabObstacleInner(ctx, o, camera, groundY, tile, a, art, x) {
  let w = o.w * tile + 8;
  const h = o.h * tile + a.over;
  if (a.fit) {
    // mantém a proporção da arte e centraliza sobre os blocos
    w = h * (art.width / art.height);
    ctx.drawImage(art, x + (o.w * tile) / 2 - w / 2, groundY - h + 3, w, h);
    return;
  }
  ctx.drawImage(art, x - 4, groundY - h + 3, w, h);
}