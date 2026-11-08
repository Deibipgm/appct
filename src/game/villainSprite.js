import { ART_BASE } from './sprites';

const VILLAIN_SRC = `${ART_BASE}vilao-laboratorio.png`;

let image = null;

function getImage() {
  if (image) return image;
  image = new Image();
  image.src = VILLAIN_SRC;
  return image;
}

if (typeof window !== 'undefined') getImage();

// Vilão do laboratório: sprite da criatura de chorume com óculos.
// Retorna false enquanto a imagem ainda não carregou.
export function drawLabVillain(ctx, x, y, w, h, t, dir = 1, alert = false) {
  const img = getImage();
  if (!img.complete || !img.naturalWidth) return false;

  const bob = Math.sin(t * 4) * 2;
  const spriteH = h * 1.5 + (alert ? 5 : 0);
  const spriteW = spriteH * (img.naturalWidth / img.naturalHeight);
  const cx = x + w / 2;
  const feet = y + h + bob;

  ctx.save();
  ctx.translate(cx, feet);
  ctx.scale(dir >= 0 ? 1 : -1, 1);
  ctx.drawImage(img, -spriteW / 2, -spriteH, spriteW, spriteH);
  ctx.restore();
  return true;
}