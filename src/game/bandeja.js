import { getCutout } from './cutout';
import { ART_BASE } from './sprites';

// Arte da pilha de bandejas encaixadas (do portfólio), já com fundo transparente.
const URL = `${ART_BASE}bandeja.png`;

// Uma pilha só, sem espaços, cobrindo os n blocos de altura da coluna.
export function drawBandejaStack(ctx, x, y, tile, n) {
  const art = getCutout(URL, [0, 0, 1, 1], 'alpha');
  if (!art) return;
  const w = tile * 1.4;
  const h = n * tile + 12;
  ctx.drawImage(art, x + tile / 2 - w / 2, y + n * tile - h + 2, w, h);
}
