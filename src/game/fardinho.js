import { getCutout } from './cutout';
import { ART_BASE } from './sprites';

// Artes dos fardos (do portfólio), já com fundo transparente.
const SRC = `${ART_BASE}fardo-unico.png`;
const TALL = `${ART_BASE}fardo-1.png`;

// Fardo em pé (ocupa 1 bloco de largura e 2 de altura), um pouco maior que o bloco.
export function drawTallFardinho(ctx, x, y, tile) {
  const art = getCutout(TALL, [0, 0, 1, 1], 'alpha');
  if (!art) return;
  const h = tile * 2 + 8;
  const w = Math.min(h * (art.width / art.height), tile * 1.45);
  ctx.drawImage(art, x + tile / 2 - w / 2, y - 8, w, h);
}

export function drawFardinho(ctx, x, y, w, h) {
  const art = getCutout(SRC, [0, 0, 1, 1], 'alpha');
  if (!art) return;
  const dh = w * (art.height / art.width) * 1.05;
  ctx.drawImage(art, x - 3, y + h - dh, w + 6, dh);
}
