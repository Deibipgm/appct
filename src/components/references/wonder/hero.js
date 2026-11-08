import { INK, ink, rr } from '@/game/brush';
import { STAGE } from './config';

const C = {
  cotton: '#FEFDFA',
  cottonShade: 'rgba(190, 184, 170, 0.75)',
  suit: '#1479E8',
  suitDark: '#0C4E9C',
  suitLight: 'rgba(99, 180, 255, 0.6)',
  cape: '#DC3545',
  capeDark: '#A6222F',
  gold: '#FFC107',
  goldDark: '#C89100',
  leaf: '#6B4D36',
};

// Dão, o super-herói do algodão: cabeça de capulho, macacão azul, capa e luvas vermelhas.
export function drawHero(ctx, s) {
  const h = s.hero;
  const cx = h.x + h.w / 2;
  const feet = h.y + h.h;
  const dir = h.face;
  const moving = Math.abs(h.vx) > 24 && h.onGround;
  const swing = moving ? Math.sin(h.walk) : 0;
  const air = !h.onGround;
  const idle = !moving && !air ? Math.sin(s.t * 2.2) * 1.6 : 0;

  ctx.beginPath();
  ctx.ellipse(cx, Math.min(feet + 4, STAGE.ground + 4), air ? 13 : 20, air ? 4 : 5.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(27,18,12,0.16)';
  ctx.fill();

  ctx.save();
  ctx.translate(cx, feet);
  ctx.scale(1 + h.squash * 0.45, 1 - h.squash * 0.45);
  ctx.translate(-cx, -feet + idle);

  // capa vermelha esvoaçando
  const flap = Math.sin(s.t * 6.2) * 3.4 + (air ? 4.6 : 0);
  ctx.beginPath();
  ctx.moveTo(cx - dir * 3.4, feet - 39);
  ctx.quadraticCurveTo(cx - dir * 21, feet - 34 + flap, cx - dir * 27, feet - 9 + flap * 1.5);
  ctx.quadraticCurveTo(cx - dir * 12, feet - 21, cx - dir * 2.4, feet - 20);
  ctx.closePath();
  ctx.fillStyle = C.cape;
  ctx.fill();
  ink(ctx, 2.8);
  ctx.beginPath();
  ctx.moveTo(cx - dir * 8, feet - 33);
  ctx.quadraticCurveTo(cx - dir * 17, feet - 23 + flap, cx - dir * 21, feet - 13 + flap * 1.3);
  ink(ctx, 2.2, C.capeDark);

  const seg = (x0, y0, x1, y1, color, w) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ink(ctx, w + 2.8);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ink(ctx, w, color);
  };

  const armLift = air ? (h.vy < 0 ? -7 : 5) : -swing * 4;
  [-1, 1].forEach((side) => {
    const sx = cx + side * 8;
    const sy = feet - 37;
    const handX = cx + side * 12 + dir * 2;
    const handY = feet - 28 + armLift + (air ? side * 2 : side * swing * 3);
    const ex = (sx + handX) / 2 + side * 0.6;
    const ey = (sy + handY) / 2 + 1.4;

    seg(sx, sy, ex, ey, C.suit, 5.2);
    seg(ex, ey, handX, handY, C.cape, 4.8);

    ctx.beginPath();
    ctx.ellipse(ex, ey, 3.4, 2.6, side * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 1.5);

    ctx.beginPath();
    ctx.arc(handX, handY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 1.8);
  });

  // pernas do macacão e botas vermelhas
  [-1, 1].forEach((side, i) => {
    const off = side * 4.8 + (i === 0 ? swing : -swing) * 2.6;

    ctx.beginPath();
    rr(ctx, cx + off - 4.5, feet - 23, 9, 14, 4.2);
    ctx.fillStyle = C.suit;
    ctx.fill();
    ink(ctx, 2.4);

    ctx.beginPath();
    rr(ctx, cx + off - 5.2, feet - 11, 10.6, 11, 3.6);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 2.1);

    ctx.beginPath();
    rr(ctx, cx + off - 5.2, feet - 11, 10.6, 3.2, 1.5);
    ctx.fillStyle = C.capeDark;
    ctx.fill();
  });

  // tronco
  ctx.beginPath();
  rr(ctx, cx - 10.5, feet - 40, 21, 20, 8);
  ctx.fillStyle = C.suit;
  ctx.fill();
  ink(ctx, 2.8);

  ctx.beginPath();
  rr(ctx, cx - 7.4 + dir * 1.6, feet - 37, 7.4, 11.5, 4.2);
  ctx.fillStyle = C.suitLight;
  ctx.fill();

  ctx.beginPath();
  rr(ctx, cx - 11, feet - 26.6, 22, 5.4, 2.2);
  ctx.fillStyle = C.gold;
  ctx.fill();
  ink(ctx, 1.9);

  ctx.beginPath();
  rr(ctx, cx - 3, feet - 27, 6, 6.2, 1.8);
  ctx.fillStyle = C.goldDark;
  ctx.fill();
  ink(ctx, 1.4);

  // gola da capa
  ctx.beginPath();
  ctx.ellipse(cx, feet - 39.4, 7.6, 3.6, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.cape;
  ctx.fill();
  ink(ctx, 1.8);

  // folhas do cálice na base do capulho
  const headY = feet - 47;
  [
    [-8.2, 0.6, -0.75],
    [-2.8, 1.8, -0.25],
    [2.8, 1.8, 0.25],
    [8.2, 0.6, 0.75],
  ].forEach(([dx, dy, rot]) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, headY + 8.6 + dy, 3.7, 2.2, rot, 0, Math.PI * 2);
    ctx.fillStyle = C.leaf;
    ctx.fill();
    ink(ctx, 1.3);
  });

  // cabeça de capulho
  const hx = cx + dir * 1.2;
  const puffs = [
    [0, 1.2, 10.8],
    [-7, -4.4, 8.4],
    [7, -4.4, 8.4],
    [0, -9, 7.8],
    [-8.6, 3.6, 7.2],
    [8.6, 3.6, 7.2],
  ];
  puffs.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(hx + dx, headY + dy, r + 2.3, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  });
  puffs.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(hx + dx, headY + dy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.cotton;
    ctx.fill();
  });

  ctx.strokeStyle = C.cottonShade;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.arc(hx - 2.6, headY + 2, 8, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx + 5.6, headY + 2.6, 6.4, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // rosto
  const fx = hx + dir * 1.6;
  const eyeY = headY - 0.4;
  const blinking = h.blink < 0.14;
  [-3.8, 3.8].forEach((dx) => {
    if (blinking) {
      ctx.beginPath();
      ctx.moveTo(fx + dx - 2.4, eyeY);
      ctx.lineTo(fx + dx + 2.4, eyeY);
      ink(ctx, 2);
      return;
    }
    ctx.beginPath();
    ctx.ellipse(fx + dx, eyeY, 2.3, 2.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ink(ctx, 1.2);
    ctx.beginPath();
    ctx.arc(fx + dx + dir * 0.7, eyeY, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  });

  ctx.beginPath();
  ctx.moveTo(fx - 6.8, eyeY - 6.6);
  ctx.lineTo(fx - 1.9, eyeY - 4.6);
  ink(ctx, 2.1);
  ctx.beginPath();
  ctx.moveTo(fx + 6.8, eyeY - 6.6);
  ctx.lineTo(fx + 1.9, eyeY - 4.6);
  ink(ctx, 2.1);

  ctx.beginPath();
  ctx.moveTo(fx - 2.8, eyeY + 4.6);
  ctx.quadraticCurveTo(fx + 1.2, eyeY + 7, fx + 4.6, eyeY + 4.2);
  ink(ctx, 1.9);

  ctx.fillStyle = 'rgba(234, 122, 122, 0.38)';
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(fx + side * 7, eyeY + 3.8, 2.7, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}