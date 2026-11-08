import { INK, puffCluster } from './brush';
import { THROW_FRAMES } from './throws';

// Pose do arremesso: o Dão inclina para trás segurando a bola e depois
// joga o corpo para a frente, soltando a bola com um rastro de vento.
const WINDUP = 0.4;
const ease = (k) => k * k * (3 - 2 * k);

export function throwPose(p) {
  if (!(p.throwT > 0)) return { a: 0, rot: 0, lunge: 0, stretch: 0 };
  const a = 1 - p.throwT / THROW_FRAMES;
  if (a < WINDUP) {
    const w = ease(a / WINDUP);
    return { a, rot: -0.32 * w, lunge: -7 * w, stretch: 0 };
  }
  const w = 1 - ease((a - WINDUP) / (1 - WINDUP));
  return { a, rot: 0.34 * w, lunge: 11 * w, stretch: 0.1 * w };
}

export function drawThrowArm(ctx, cx, feet, dir, th) {
  if (th.a <= 0) return;
  if (th.a < WINDUP) {
    // bola na mão, erguida atrás da cabeça
    const w = ease(th.a / WINDUP);
    puffCluster(ctx, cx - dir * (10 + 14 * w), feet - 62 - 8 * w, [[0, 0, 6], [-4, 2, 4.6], [4, 2, 4.6], [0, -4, 4.6]], 1, '#FFFDF7', INK);
    return;
  }
  if (th.a > 0.85) return;
  // rastro do braço passando por cima, na direção do arremesso
  const k = (th.a - WINDUP) / (0.85 - WINDUP);
  ctx.save();
  ctx.globalAlpha = 1 - k;
  ctx.strokeStyle = '#FFFDF7';
  ctx.lineCap = 'round';
  [0, 1].forEach((i) => {
    ctx.lineWidth = 5 - i * 2;
    ctx.beginPath();
    const r = 30 + i * 9;
    const a0 = dir > 0 ? -Math.PI * 0.85 : -Math.PI * 0.15;
    const a1 = dir > 0 ? -Math.PI * (0.85 - 0.6 * k - 0.2) : -Math.PI * (0.15 + 0.6 * k + 0.2);
    ctx.arc(cx, feet - 44, r, Math.min(a0, a1), Math.max(a0, a1));
    ctx.stroke();
  });
  ctx.restore();
}