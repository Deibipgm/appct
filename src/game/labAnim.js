// Animação do fundo do laboratório: mãos das pesquisadoras mexendo e logo da ABAPA ao centro.
import { ART } from './sprites';
const LOGO = ART.logoAbapaH;
let logo = null;

// regiões das mãos (frações da imagem): x, y, w, h, fase
const HANDS = [
  [0.068, 0.41, 0.04, 0.05, 0],
  [0.2, 0.37, 0.025, 0.04, 1.3],
  [0.32, 0.33, 0.025, 0.04, 2.1],
  [0.69, 0.44, 0.03, 0.05, 0.7],
  [0.79, 0.52, 0.03, 0.05, 1.8],
];

export function drawLabAnim(ctx, img, ox, oy, w, h, time) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  HANDS.forEach(([fx, fy, fw, fh, ph]) => {
    const dx = Math.sin(time * 4 + ph) * 3;
    const dy = Math.abs(Math.sin(time * 3 + ph)) * -3;
    ctx.drawImage(img, fx * iw, fy * ih, fw * iw, fh * ih, ox + fx * w + dx, oy + fy * h + dy, fw * w, fh * h);
  });

  if (!logo) {
    logo = new Image();
    logo.src = LOGO;
  }
  if (logo.complete && logo.naturalWidth) {
    const lw = w * 0.075;
    const lh = lw * (logo.naturalHeight / logo.naturalWidth);
    const lx = ox + w * 0.5 - lw / 2;
    const ly = oy + h * 0.215;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(lx - 6, ly - 5, lw + 12, lh + 10, 8);
    ctx.fill();
    ctx.drawImage(logo, lx, ly, lw, lh);
  }
}