import { getCutout } from './cutout';
import { ART_BASE } from './sprites';

const A = [0, 0, 1, 1];
const FOES = {
  folharao: { url: `${ART_BASE}folharao.png`, crop: A, mode: 'alpha' },
  casca: { url: `${ART_BASE}casca.png`, crop: A, mode: 'alpha' },
  plastico: { url: `${ART_BASE}plastico.png`, crop: A, mode: 'alpha' },
  fumagina: { url: `${ART_BASE}fumagina.png`, crop: A, mode: 'alpha' },
  graxolino: { url: `${ART_BASE}graxolino.png`, crop: A, mode: 'alpha' },
  cochonilha: { url: `${ART_BASE}cochonilha.png`, crop: A, mode: 'alpha', scale: 0.85 },
  sintetico: { url: `${ART_BASE}sintetico.png`, crop: A, mode: 'alpha', scale: 0.95 },
  microbio: { url: `${ART_BASE}microbio.png`, crop: A, mode: 'alpha', scale: 0.95 },
  relogio: { url: `${ART_BASE}relogio-24h.png`, crop: A, mode: 'alpha', faces: 1 },
};
const HEAVY = { casca: true, graxolino: true };

// Inimigos da algodoeira: Folharão (balança e solta folhas) e Casca-Bruta (passo pesado).
export function drawGinFoe(ctx, skin, x, y, w, h, t, dir, alert) {
  const f = FOES[skin];
  const art = f && getCutout(f.url, f.crop, f.mode);
  if (!art) return false;
  const heavy = !!HEAVY[skin];
  const step = Math.abs(Math.sin(t * (alert ? 14 : heavy ? 6 : 8)));
  const sh = (h * 2 + (alert ? 6 : 0)) * (f.scale ?? 1);
  const sw = sh * (art.width / art.height);
  const cx = x + w / 2;
  const feet = y + h + 2;

  ctx.fillStyle = 'rgba(27, 18, 12, 0.22)';
  ctx.beginPath();
  ctx.ellipse(cx, feet, sw * 0.38, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(cx, feet - (heavy ? 0 : step * 4));
  ctx.rotate((heavy ? Math.sin(t * 6) * 0.05 : Math.sin(t * 5) * 0.09) + (alert ? 0.1 * dir : 0));
  // plástico tremula como uma sacola ao vento
  const flap = skin === 'plastico' ? Math.sin(t * 11) * 0.06 : 0;
  // relógio balança como um pêndulo, no ritmo do tique-taque
  if (skin === 'relogio') ctx.rotate(Math.sin(t * 7) * 0.08);
  const flip = f.faces ? (dir >= 0 ? 1 : -1) : dir >= 0 ? -1 : 1;
  ctx.scale(flip * (1 + step * 0.03 + flap), 1 - step * (heavy ? 0.07 : 0.03) - flap);
  ctx.drawImage(art, -sw / 2, -sh, sw, sh);
  ctx.restore();

  if (skin === 'folharao') {
    // folhinhas girando ao redor
    for (let i = 0; i < 3; i++) {
      const a = t * 3 + i * 2.1;
      ctx.save();
      ctx.translate(cx + Math.cos(a) * sw * 0.55, feet - sh * 0.5 + Math.sin(a) * sh * 0.3);
      ctx.rotate(a * 2);
      ctx.fillStyle = i % 2 ? '#E8892E' : '#8CC63F';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (step > 0.95) {
    ctx.fillStyle = '#C8643A';
    ctx.fillRect(cx - sw * 0.4, feet - 6, 6, 4);
    ctx.fillRect(cx + sw * 0.35, feet - 8, 5, 4);
  }
  return true;
}